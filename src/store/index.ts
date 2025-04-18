import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import groupsReducer from './slices/groupsSlice';
import videosReducer from './slices/videosSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    groups: groupsReducer,
    videos: videosReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['auth/login/fulfilled', 'auth/signup/fulfilled'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['payload.user', 'meta.arg'],
        // Ignore these paths in the state
        ignoredPaths: ['auth.user'],
      },
    }),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;