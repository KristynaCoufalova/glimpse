// src/store/slices/userSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  updateProfile as updateFirebaseProfile,
  User as FirebaseUser 
} from 'firebase/auth';
import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, firestore, storage } from '../../services/firebase/config';

// Define types
export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  timezone?: string;
  birthday?: string | null;
}

interface UserState {
  user: User | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

interface ProfileUpdateData {
  displayName?: string | null;
  photoURL?: string | null;
  timezone?: string;
  birthday?: string | null;
}

// Helper to convert local image URI to blob
const uriToBlob = async (uri: string): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    fetch(uri)
      .then(response => response.blob())
      .then(blob => resolve(blob))
      .catch(error => reject(error));
  });
};

// Async thunk for updating profile
// Fetch user profile from Firestore
export const fetchUserProfile = createAsyncThunk(
  'user/fetchUserProfile',
  async (userId: string, { rejectWithValue }) => {
    try {
      const userRef = doc(firestore, 'users', userId);
      const userSnapshot = await getDoc(userRef);
      
      if (!userSnapshot.exists()) {
        return rejectWithValue('User profile not found');
      }
      
      const userData = userSnapshot.data();
      
      return {
        uid: userId,
        email: userData.email,
        displayName: userData.displayName,
        photoURL: userData.photoURL,
        timezone: userData.timezone,
        birthday: userData.birthday,
      } as User;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('An unknown error occurred');
    }
  }
);

// Update user profile
export const updateProfile = createAsyncThunk(
  'user/updateProfile',
  async (profileData: ProfileUpdateData, { getState, rejectWithValue }) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        return rejectWithValue('User not authenticated');
      }

      let photoURL = profileData.photoURL;

      // If photoURL starts with 'file://' or 'content://', it's a local file
      if (photoURL && (photoURL.startsWith('file://') || photoURL.startsWith('content://'))) {
        try {
          // Upload image to Firebase Storage
          const blob = await uriToBlob(photoURL);
          const imageRef = ref(storage, `profile_pictures/${currentUser.uid}/${Date.now()}.jpg`);
          await uploadBytes(imageRef, blob);
          photoURL = await getDownloadURL(imageRef);
        } catch (error) {
          console.error('Error uploading profile picture:', error);
          // Continue without updating photo if upload fails
          photoURL = currentUser.photoURL;
        }
      }

      // Update Firebase Auth profile
      await updateFirebaseProfile(currentUser, {
        displayName: profileData.displayName || currentUser.displayName,
        photoURL: photoURL || currentUser.photoURL,
      });

      // Get current user data from Firestore to ensure we don't overwrite existing fields
      const userRef = doc(firestore, 'users', currentUser.uid);
      const userSnapshot = await getDoc(userRef);
      const existingUserData = userSnapshot.exists() ? userSnapshot.data() : {};

      // Update Firestore user document with both auth fields and additional profile fields
      await updateDoc(userRef, {
        displayName: profileData.displayName || currentUser.displayName,
        photoURL: photoURL || currentUser.photoURL,
        ...(profileData.timezone && { timezone: profileData.timezone }),
        ...(profileData.birthday !== undefined && { birthday: profileData.birthday }),
        updatedAt: new Date(),
      });

      // Return updated user data
      return {
        uid: currentUser.uid,
        email: currentUser.email,
        displayName: profileData.displayName || currentUser.displayName,
        photoURL: photoURL || currentUser.photoURL,
        timezone: profileData.timezone || existingUserData.timezone,
        birthday: profileData.birthday !== undefined ? profileData.birthday : existingUserData.birthday,
      };
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('An unknown error occurred');
    }
  }
);

// Initial state
const initialState: UserState = {
  user: null,
  status: 'idle',
  error: null,
};

// Create slice
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.status = 'succeeded';
      state.error = null;
    },
    clearUserError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Update profile
    builder
      .addCase(updateProfile.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload as User;
        state.error = null;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
      
    // Fetch user profile
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
        state.error = null;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

export const { setUser, clearUserError } = userSlice.actions;
export default userSlice.reducer;