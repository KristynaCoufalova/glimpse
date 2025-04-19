import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  updateDoc,
  arrayUnion,
  Timestamp,
  serverTimestamp,
  FieldValue,
} from 'firebase/firestore';
import { firestore } from '../../services/firebase/config';

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
  inviteEmails?: string[];
}

interface InviteMemberData {
  groupId: string;
  email: string;
  userId: string;
}

// Async thunks
export const createGroup = createAsyncThunk(
  'groups/createGroup',
  async (data: CreateGroupData, { rejectWithValue }) => {
    try {
      // Create a new group document
      const groupRef = doc(collection(firestore, 'groups'));
      const now = serverTimestamp();

      const newGroup: Omit<Group, 'id'> = {
        name: data.name,
        description: data.description,
        photoURL: null,
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

      await setDoc(groupRef, newGroup);

      // If invite emails are provided, create invitations
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
      // Query groups where the user is a member
      const groupsQuery = query(
        collection(firestore, 'groups'),
        where(`members.${userId}.id`, '==', userId)
      );

      const groupsSnapshot = await getDocs(groupsQuery);
      const groups: Group[] = [];

      groupsSnapshot.forEach(doc => {
        groups.push({
          id: doc.id,
          ...doc.data(),
        } as Group);
      });

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
      const groupRef = doc(firestore, 'groups', groupId);
      const groupSnapshot = await getDoc(groupRef);

      if (!groupSnapshot.exists()) {
        return rejectWithValue('Group not found');
      }

      return {
        id: groupSnapshot.id,
        ...groupSnapshot.data(),
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
      const invitesCollection = collection(firestore, 'invites');
      const inviteRef = doc(invitesCollection);

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

export const { setCurrentGroup, clearGroupsError, updateGroupLastActivity } = groupsSlice.actions;
export default groupsSlice.reducer;
