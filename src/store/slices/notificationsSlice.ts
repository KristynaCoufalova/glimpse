import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  getDoc,
  setDoc,
  Timestamp,
  DocumentData,
} from 'firebase/firestore';
import { firestore } from '../../services/firebase/config';
import { fetchGroupById } from './groupsSlice';

// Define types
export interface GroupInvitation {
  id: string;
  groupId: string;
  groupName?: string;
  email: string;
  invitedBy: string;
  inviterName?: string;
  createdAt: Timestamp;
  status: 'pending' | 'accepted' | 'declined';
}

interface NotificationsState {
  invitations: GroupInvitation[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

// Async thunks
export const fetchGroupInvitations = createAsyncThunk(
  'notifications/fetchGroupInvitations',
  async (email: string, { rejectWithValue }) => {
    try {
      // Query invites where the email matches the current user's email
      const invitesQuery = query(
        collection(firestore, 'invites'),
        where('email', '==', email.toLowerCase()),
        where('status', '==', 'pending')
      );

      const invitesSnapshot = await getDocs(invitesQuery);
      const invitations: GroupInvitation[] = [];

      try {
        // Process each invitation document
        for (const docSnapshot of invitesSnapshot.docs) {
          const inviteData = docSnapshot.data() as DocumentData;
          // Get group name from the group document
          let groupName = 'Unknown Group';
          let inviterName = 'Someone';
          try {
            const groupId = inviteData.groupId;
            console.log(`Processing invitation with groupId: ${groupId}`);
            if (groupId) {
              const groupRef = doc(firestore, 'groups', groupId);
              const groupDoc = await getDoc(groupRef);
              console.log(`Group document exists: ${groupDoc.exists()}`);
              if (groupDoc.exists()) {
                const groupData = groupDoc.data();
                console.log('Group data structure:', JSON.stringify(groupData, null, 2));
                // Access the name directly from the group document
                groupName = groupData.name || 'Unknown Group';
                console.log(`Found group name: ${groupName}`);
              }
            }
          } catch (error) {
            console.error('Error fetching group name:', error);
            // Fallback to Unknown Group (already set)
          }
          // Get inviter name logic...
          try {
            const userRef = doc(firestore, 'users', inviteData.invitedBy);
            const userDoc = await getDoc(userRef);
            if (userDoc.exists()) {
              const userData = userDoc.data() as DocumentData;
              inviterName = userData.displayName || 'Someone';
            }
          } catch (error) {
            console.error('Error fetching inviter name:', error);
          }
          // Create invitation object with the retrieved information
          invitations.push({
            id: docSnapshot.id,
            groupId: inviteData.groupId,
            groupName: groupName,
            email: inviteData.email,
            invitedBy: inviteData.invitedBy,
            inviterName: inviterName,
            createdAt: inviteData.createdAt,
            status: inviteData.status,
          });
        }
      } catch (error) {
        console.error('Error processing invitations:', error);
        throw error;
      }
      return invitations;
    } catch (error) {
      console.error('Error fetching group invitations:', error);
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('An unknown error occurred');
    }
  }
);

export const respondToGroupInvitation = createAsyncThunk(
  'notifications/respondToGroupInvitation',
  async (
    { invitationId, accept, userId }: { invitationId: string; accept: boolean; userId: string },
    { rejectWithValue, dispatch }
  ) => {
    try {
      console.log(`Responding to invitation ${invitationId} - Accept: ${accept}`);
      // Get the invitation document
      const inviteRef = doc(firestore, 'invites', invitationId);
      const inviteDoc = await getDoc(inviteRef);
      if (!inviteDoc.exists()) {
        console.error('Invitation not found');
        return rejectWithValue('Invitation not found');
      }

      const inviteData = inviteDoc.data();
      console.log(`Invitation data: ${JSON.stringify(inviteData)}`);

      if (accept) {
        try {
          // Get the group
          console.log(`Checking group ${inviteData.groupId}`);
          const groupRef = doc(firestore, 'groups', inviteData.groupId);
          const groupDoc = await getDoc(groupRef);
          if (!groupDoc.exists()) {
            console.error('Group not found');
            await updateDoc(inviteRef, { status: 'error', errorMessage: 'Group not found' });
            return rejectWithValue('Group not found');
          }

          console.log('Group exists, adding member');

          // First, update the main group document to include the member
          // This resolves the permission issue because the security rules check for member existence
          // in the main group document first
          const groupData = groupDoc.data();
          const updatedMembers = {
            ...groupData.members,
            [userId]: {
              id: userId,
              role: 'member',
              joinedAt: Timestamp.now(),
            },
          };

          // Update the group document with the new member
          await updateDoc(groupRef, {
            members: updatedMembers,
          });

          console.log('Updated group document with new member');

          // Now create a members subcollection document for the user
          const memberDocRef = doc(firestore, `groups/${inviteData.groupId}/members/${userId}`);
          await setDoc(memberDocRef, {
            id: userId,
            role: 'member',
            joinedAt: Timestamp.now(),
          });

          console.log('Member added to group subcollection');

          // Update invitation status
          await updateDoc(inviteRef, { status: 'accepted' });
          console.log('Invitation accepted');

          // Fetch the updated group to refresh the UI
          dispatch(fetchGroupById(inviteData.groupId) as any);
          return {
            id: invitationId,
            accepted: true,
            groupId: inviteData.groupId,
          };
        } catch (error) {
          console.error('Error accepting invitation:', error);
          await updateDoc(inviteRef, {
            status: 'error',
            errorMessage: error instanceof Error ? error.message : 'Unknown error',
          });
          return rejectWithValue(error instanceof Error ? error.message : 'Failed to join group');
        }
      } else {
        // Decline the invitation
        await updateDoc(inviteRef, { status: 'declined' });
        return { id: invitationId, accepted: false };
      }
    } catch (error) {
      console.error('Error responding to invitation:', error);
      return rejectWithValue(error instanceof Error ? error.message : 'An unknown error occurred');
    }
  }
);

// Initial state
const initialState: NotificationsState = {
  invitations: [],
  status: 'idle',
  error: null,
};

// Create slice
const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    clearNotificationsError: state => {
      state.error = null;
    },
  },
  extraReducers: builder => {
    // Fetch group invitations
    builder
      .addCase(fetchGroupInvitations.pending, state => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchGroupInvitations.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.invitations = action.payload;
        state.error = null;
      })
      .addCase(fetchGroupInvitations.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });

    // Respond to group invitation
    builder
      .addCase(respondToGroupInvitation.pending, state => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(respondToGroupInvitation.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // Remove the invitation from the list or update its status
        state.invitations = state.invitations.filter(
          invitation => invitation.id !== action.payload.id
        );
        state.error = null;
      })
      .addCase(respondToGroupInvitation.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

export const { clearNotificationsError } = notificationsSlice.actions;
export default notificationsSlice.reducer;
