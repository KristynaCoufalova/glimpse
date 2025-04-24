import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  Timestamp,
  serverTimestamp,
  FieldValue,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { firestore, storage } from '../../services/firebase/config';

// Define types
export interface GroupMember {
  id: string;
  role: 'admin' | 'member';
  joinedAt: Timestamp | FieldValue;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  photoURL: string | null;
  createdBy: string;
  createdAt: Timestamp | FieldValue;
  lastActivity: Timestamp | FieldValue;
  members: Record<string, GroupMember>;
}

interface GroupsState {
  groups: Group[];
  currentGroup: Group | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

interface CreateGroupData {
  name: string;
  description: string;
  userId: string;
  imageUri?: string | null;
  inviteEmails?: string[];
}

interface InviteMemberData {
  groupId: string;
  email: string;
  userId: string;
}

// Helper function to convert image URI to blob
const uriToBlob = async (uri: string): Promise<Blob> => {
  return fetch(uri).then(response => response.blob());
};

// Async thunks
export const createGroup = createAsyncThunk(
  'groups/createGroup',
  async (data: CreateGroupData, { rejectWithValue }) => {
    try {
      // Create a new group document reference
      const groupRef = doc(collection(firestore, 'groups'));
      const now = serverTimestamp();
      
      // Upload image if provided
      let photoURL = null;
      if (data.imageUri) {
        try {
          // Upload image to Firebase Storage
          const blob = await uriToBlob(data.imageUri);
          const imageRef = ref(storage, `group_photos/${groupRef.id}/${Date.now()}.jpg`);
          await uploadBytes(imageRef, blob);
          photoURL = await getDownloadURL(imageRef);
        } catch (error) {
          console.error('Error uploading group photo:', error);
          // Continue without photo if upload fails
        }
      }

      // Create the group data
      const newGroup: Omit<Group, 'id'> = {
        name: data.name,
        description: data.description,
        photoURL,
        createdBy: data.userId,
        createdAt: now,
        lastActivity: now,
        members: {
          [data.userId]: {
            id: data.userId,
            role: 'admin',
            joinedAt: now,
          },
        },
      };

      // Save the group to Firestore with embedded members approach
      console.log('Creating new group with embedded member:', data.userId);
      await setDoc(groupRef, newGroup);
      
      // Also create a document in the members subcollection for backward compatibility
      console.log('Creating member subcollection entry for backward compatibility');
      const memberDocRef = doc(firestore, `groups/${groupRef.id}/members/${data.userId}`);
      await setDoc(memberDocRef, {
        id: data.userId,
        role: 'admin',
        joinedAt: now,
      });

      // Create invitations if emails are provided
      if (data.inviteEmails && data.inviteEmails.length > 0) {
        const invitesCollection = collection(firestore, 'invites');

        for (const email of data.inviteEmails) {
          const inviteRef = doc(invitesCollection);
          await setDoc(inviteRef, {
            groupId: groupRef.id,
            email: email.trim().toLowerCase(),
            invitedBy: data.userId,
            createdAt: now,
            status: 'pending',
          });
        }
      }

      // Get the created group with its ID
      const groupSnapshot = await getDoc(groupRef);
      const groupData = groupSnapshot.data() as Omit<Group, 'id'>;

      return {
        id: groupRef.id,
        ...groupData,
      } as Group;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('An unknown error occurred');
    }
  }
);

export const fetchUserGroups = createAsyncThunk(
  'groups/fetchUserGroups',
  async (userId: string, { rejectWithValue }) => {
    try {
      console.log('Fetching groups for user:', userId);
      const groups: Group[] = [];
      
      // Query groups directly where the user is a member in the embedded members map
      const groupsCollection = collection(firestore, 'groups');
      // We can't directly query on map fields in Firestore, so we have to get all groups
      // and filter them in the client
      const groupsSnapshot = await getDocs(groupsCollection);
      
      groupsSnapshot.forEach(doc => {
        const groupData = doc.data();
        // Check if this user is in the members map
        if (groupData.members && groupData.members[userId]) {
          groups.push({
            id: doc.id,
            ...groupData,
          } as Group);
        }
      });
      
      console.log(`Found ${groups.length} groups for user ${userId}`);
      return groups;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('An unknown error occurred');
    }
  }
);

export const fetchGroupById = createAsyncThunk(
  'groups/fetchGroupById',
  async (groupId: string, { rejectWithValue }) => {
    try {
      console.log(`Fetching group by ID: ${groupId}`);
      // Fetch group document
      const groupRef = doc(firestore, 'groups', groupId);
      const groupSnapshot = await getDoc(groupRef);

      if (!groupSnapshot.exists()) {
        console.log(`Group not found: ${groupId}`);
        return rejectWithValue('Group not found');
      }
      
      // Use only the embedded members data from the group document
      const groupData = groupSnapshot.data();
      console.log(`Found group: ${groupId}, has members:`, !!groupData.members);
      
      return {
        id: groupSnapshot.id,
        ...groupData,
      } as Group;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('An unknown error occurred');
    }
  }
);

export const inviteMember = createAsyncThunk(
  'groups/inviteMember',
  async (data: InviteMemberData, { rejectWithValue }) => {
    try {
      // Check if user is already a member or has been invited
      const existingInvitesQuery = query(
        collection(firestore, 'invites'),
        where('groupId', '==', data.groupId),
        where('email', '==', data.email.toLowerCase())
      );
      
      const existingInvitesSnapshot = await getDocs(existingInvitesQuery);
      
      if (!existingInvitesSnapshot.empty) {
        return rejectWithValue('This person has already been invited to this group');
      }
      
      // Create the invitation
      const inviteRef = doc(collection(firestore, 'invites'));
      
      await setDoc(inviteRef, {
        groupId: data.groupId,
        email: data.email.trim().toLowerCase(),
        invitedBy: data.userId,
        createdAt: serverTimestamp(),
        status: 'pending',
      });

      return { groupId: data.groupId, email: data.email };
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('An unknown error occurred');
    }
  }
);

// Initial state
const initialState: GroupsState = {
  groups: [],
  currentGroup: null,
  status: 'idle',
  error: null,
};

// Create slice
const groupsSlice = createSlice({
  name: 'groups',
  initialState,
  reducers: {
    setCurrentGroup: (state, action: PayloadAction<Group | null>) => {
      state.currentGroup = action.payload;
    },
    clearGroupsError: state => {
      state.error = null;
    },
    updateGroupLastActivity: (state, action: PayloadAction<string>) => {
      const groupId = action.payload;
      const groupIndex = state.groups.findIndex(group => group.id === groupId);

      if (groupIndex !== -1) {
        state.groups[groupIndex].lastActivity = Timestamp.now();
      }

      if (state.currentGroup && state.currentGroup.id === groupId) {
        state.currentGroup.lastActivity = Timestamp.now();
      }
    },
    resetGroups: state => {
      // Reset groups state when user logs out
      state.groups = [];
      state.currentGroup = null;
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: builder => {
    // Create group
    builder
      .addCase(createGroup.pending, state => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(createGroup.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.groups.push(action.payload);
        state.currentGroup = action.payload;
        state.error = null;
      })
      .addCase(createGroup.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });

    // Fetch user groups
    builder
      .addCase(fetchUserGroups.pending, state => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchUserGroups.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.groups = action.payload;
        state.error = null;
      })
      .addCase(fetchUserGroups.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });

    // Fetch group by ID
    builder
      .addCase(fetchGroupById.pending, state => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchGroupById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.currentGroup = action.payload;

        // Update the group in the groups array if it exists
        const groupIndex = state.groups.findIndex(group => group.id === action.payload.id);
        if (groupIndex !== -1) {
          state.groups[groupIndex] = action.payload;
        } else {
          state.groups.push(action.payload);
        }

        state.error = null;
      })
      .addCase(fetchGroupById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });

    // Invite member
    builder
      .addCase(inviteMember.pending, state => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(inviteMember.fulfilled, state => {
        state.status = 'succeeded';
        state.error = null;
      })
      .addCase(inviteMember.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

export const { 
  setCurrentGroup, 
  clearGroupsError, 
  updateGroupLastActivity, 
  resetGroups 
} = groupsSlice.actions;
export default groupsSlice.reducer;