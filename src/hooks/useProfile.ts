// src/hooks/useProfile.ts
import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { fetchUserProfile } from '../store/slices/userSlice';
import { auth } from '../services/firebase/config';

/**
 * Custom hook to manage user profile data
 */
export const useProfile = () => {
  const dispatch = useDispatch();
  const { user, status, error } = useSelector((state: RootState) => state.user);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Use useCallback to prevent the function from being recreated on each render
  const refreshProfile = useCallback(() => {
    if (auth?.currentUser && !hasInitialized) {
      // Use type assertion to resolve dispatch type issues
      dispatch(fetchUserProfile(auth.currentUser.uid) as any);
      setHasInitialized(true);
    }
  }, [dispatch, hasInitialized]);

  // Only fetch profile data once when the component mounts
  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  return {
    user,
    isLoading: status === 'loading',
    error,
    refreshProfile: () => {
      if (auth?.currentUser) {
        // Reset initialization flag to allow refresh
        setHasInitialized(false);
      }
    },
  };
};