import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import groupsReducer from './slices/groupsSlice';
import videosReducer from './slices/videosSlice';
import userReducer from './slices/userSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    groups: groupsReducer,
    videos: videosReducer,
    user: userReducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: [
          'auth/login/fulfilled',
          'auth/signup/fulfilled',
          'user/updateProfile/fulfilled',
          'groups/createGroup/fulfilled',
          'groups/fetchGroupById/fulfilled',
          'groups/fetchUserGroups/fulfilled',
          'videos/uploadVideo/fulfilled',
          'videos/fetchVideosForGroup/fulfilled',
          'videos/fetchFeedVideos/fulfilled',
        ],
        // Ignore these field paths in all actions
        ignoredActionPaths: [
          'payload.user',
          'meta.arg',
          'payload.photoURL',
          'payload.createdAt',
          'payload.lastActivity',
          'payload.members',
          'payload.joinedAt',
        ],
        // Ignore these paths in the state
        ignoredPaths: [
          'auth.user',
          'user.user.photoURL',
          'groups.groups',
          'groups.currentGroup',
          'videos.videos',
          'videos.feedVideos',
          'videos.currentVideo',
        ],
      },
    }),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;