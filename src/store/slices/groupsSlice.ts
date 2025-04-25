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
  writeBatch,
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

interface DeleteGroupData {
  groupId: string;
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
      // Members subcollection is deprecated according to firestore rules

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
      const groupsMap = new Map<string, any>();
      // Query for groups where user is in embedded members map
      console.log('Querying for membership in embedded members map');
      const groupsRef = collection(firestore, 'groups');
      const groupsSnapshot = await getDocs(groupsRef);
      // Check each group for embedded membership
      groupsSnapshot.forEach(doc => {
        const groupId = doc.id;
        // Skip if already added from subcollection
        if (groupsMap.has(groupId)) {
          return;
        }
        const groupData = doc.data();
        // Carefully check for embedded membership - handle potential undefined
        if (
          groupData.members &&
          typeof groupData.members === 'object' &&
          groupData.members[userId]
        ) {
          console.log(`User is member of group ${groupId} in embedded members map`);
          groupsMap.set(groupId, {
            id: groupId,
            ...groupData,
          });
        }
      });
      // Members subcollection is deprecated, use only embedded members
      const finalGroups = Array.from(groupsMap.values());
      console.log(`Found ${finalGroups.length} total groups for user ${userId}`);
      return finalGroups;
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
      // Get group data with embedded members map
      const groupData = groupSnapshot.data();
      console.log(`Found group: ${groupId}, has embedded members:`, !!groupData.members);
      // Members subcollection is deprecated, only use embedded members
      const members = groupData.members || {};
      console.log(`Group has ${Object.keys(members).length} members`);
      return {
        id: groupSnapshot.id,
        ...groupData,
        members,
      } as Group;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('An unknown error occurred');
    }
  }
);

export const deleteGroup = createAsyncThunk(
  'groups/deleteGroup',
  async (data: DeleteGroupData, { rejectWithValue }) => {
    try {
      // Get group document to check if user is admin
      const groupRef = doc(firestore, 'groups', data.groupId);
      const groupSnapshot = await getDoc(groupRef);

      if (!groupSnapshot.exists()) {
        return rejectWithValue('Group not found');
      }

      const groupData = groupSnapshot.data();
      // Check if user is admin in the main group document (primary source)
      const isAdminInMainDoc =
        groupData.members &&
        groupData.members[data.userId] &&
        groupData.members[data.userId].role === 'admin';
      if (!isAdminInMainDoc) {
        // Members subcollection is deprecated according to firestore rules
        return rejectWithValue('Only group admins can delete groups');
      }
      // User is confirmed as admin - Delete the group
      // Delete the main group document directly (members subcollection is deprecated)
      const batch = writeBatch(firestore);
      batch.delete(groupRef);
      // Execute the batch
      await batch.commit();
      return data.groupId;
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
    // Delete group
    builder
      .addCase(deleteGroup.pending, state => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(deleteGroup.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // Remove the deleted group from the array
        state.groups = state.groups.filter(group => group.id !== action.payload);
        // Clear current group if it was the one deleted
        if (state.currentGroup && state.currentGroup.id === action.payload) {
          state.currentGroup = null;
        }
        state.error = null;
      })
      .addCase(deleteGroup.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

export const { setCurrentGroup, clearGroupsError, updateGroupLastActivity, resetGroups } =
  groupsSlice.actions;
export default groupsSlice.reducer;