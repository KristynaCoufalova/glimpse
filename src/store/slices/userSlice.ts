import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  updateProfile as updateFirebaseProfile,
  User as FirebaseUser 
} from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, firestore, storage } from '../../services/firebase/config';

// Define types
export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  timezone?: string;
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

      // Update Firestore user document
      const userRef = doc(firestore, 'users', currentUser.uid);
      await updateDoc(userRef, {
        displayName: profileData.displayName || currentUser.displayName,
        photoURL: photoURL || currentUser.photoURL,
        ...(profileData.timezone && { timezone: profileData.timezone }),
        updatedAt: new Date(),
      });

      // Return updated user data
      return {
        uid: currentUser.uid,
        email: currentUser.email,
        displayName: profileData.displayName || currentUser.displayName,
        photoURL: photoURL || currentUser.photoURL,
        timezone: profileData.timezone,
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
  },
});

export const { setUser, clearUserError } = userSlice.actions;
export default userSlice.reducer;