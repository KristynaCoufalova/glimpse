import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  serverTimestamp,
  FieldValue,
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { firestore, storage } from '../../services/firebase/config';

// Define types
export interface VideoViewer {
  userId: string;
  viewedAt: Timestamp | FieldValue;
}

export interface VideoReaction {
  type: 'like';
  userId: string;
  createdAt: Timestamp | FieldValue;
}

export interface VideoComment {
  id: string;
  userId: string;
  content: string;
  createdAt: Timestamp | FieldValue;
  videoReplyId?: string; // If this comment is a video reply
}

export interface Video {
  id: string;
  creator: string;
  groupIds: string[];
  caption: string;
  videoURL: string;
  thumbnailURL: string;
  duration: number;
  promptId?: string;
  createdAt: Timestamp | FieldValue;
  viewers: Record<string, VideoViewer>;
  reactions: {
    likes: number;
    comments: number;
  };
}

interface VideosState {
  videos: Video[];
  feedVideos: Video[];
  currentVideo: Video | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  uploadProgress: number;
  error: string | null;
}

interface UploadVideoData {
  videoUri: string;
  caption: string;
  groupIds: string[];
  userId: string;
  duration: number;
  promptId?: string;
}

interface FetchVideosForGroupData {
  groupId: string;
  limit?: number;
}

interface FetchFeedVideosData {
  userId: string;
  limit?: number;
}

// Helper function to generate a thumbnail URL from a video URL
// In a real app, this would be done server-side or with a cloud function
const generateThumbnailURL = (videoURL: string): string => {
  // This is a placeholder. In a real app, we would generate a thumbnail
  return videoURL.replace('.mp4', '_thumbnail.jpg');
};

// Async thunks
export const uploadVideo = createAsyncThunk(
  'videos/uploadVideo',
  async (data: UploadVideoData, { dispatch, rejectWithValue }) => {
    try {
      // Create a reference to the video file in Firebase Storage
      const videoFileName = `videos/${data.userId}/${Date.now()}.mp4`;
      const videoRef = ref(storage, videoFileName);

      // Convert video URI to blob
      const response = await fetch(data.videoUri);
      const blob = await response.blob();

      // Upload video to Firebase Storage with progress tracking
      const uploadTask = uploadBytesResumable(videoRef, blob);

      // Return a promise that resolves when the upload is complete
      return new Promise<Video>((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          snapshot => {
            // Track upload progress
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            dispatch(setUploadProgress(progress));
          },
          error => {
            // Handle upload error
            reject(error);
          },
          async () => {
            // Upload completed successfully, get download URL
            try {
              const videoURL = await getDownloadURL(uploadTask.snapshot.ref);
              const thumbnailURL = generateThumbnailURL(videoURL);

              // Create video document in Firestore
              const videoRef = doc(collection(firestore, 'videos'));
              const now = serverTimestamp();

              const newVideo: Omit<Video, 'id'> = {
                creator: data.userId,
                groupIds: data.groupIds,
                caption: data.caption,
                videoURL,
                thumbnailURL,
                duration: data.duration,
                promptId: data.promptId,
                createdAt: now,
                viewers: {
                  [data.userId]: {
                    userId: data.userId,
                    viewedAt: now,
                  },
                },
                reactions: {
                  likes: 0,
                  comments: 0,
                },
              };

              await setDoc(videoRef, newVideo);

              // Update group lastActivity
              for (const groupId of data.groupIds) {
                dispatch(updateGroupLastActivity(groupId));
              }

              // Get the created video with its ID
              const videoSnapshot = await getDoc(videoRef);
              const videoData = videoSnapshot.data() as Omit<Video, 'id'>;

              resolve({
                id: videoRef.id,
                ...videoData,
              } as Video);
            } catch (error) {
              reject(error);
            }
          }
        );
      });
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('An unknown error occurred');
    }
  }
);

export const fetchVideosForGroup = createAsyncThunk(
  'videos/fetchVideosForGroup',
  async (data: FetchVideosForGroupData, { rejectWithValue }) => {
    try {
      const { groupId, limit: queryLimit = 20 } = data;

      // Query videos for the specified group
      const videosQuery = query(
        collection(firestore, 'videos'),
        where('groupIds', 'array-contains', groupId),
        orderBy('createdAt', 'desc'),
        limit(queryLimit)
      );

      const videosSnapshot = await getDocs(videosQuery);
      const videos: Video[] = [];

      videosSnapshot.forEach(doc => {
        videos.push({
          id: doc.id,
          ...doc.data(),
        } as Video);
      });

      return videos;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('An unknown error occurred');
    }
  }
);

export const fetchFeedVideos = createAsyncThunk(
  'videos/fetchFeedVideos',
  async (data: FetchFeedVideosData, { rejectWithValue }) => {
    try {
      const { userId, limit: queryLimit = 20 } = data;

      // First, get the user's groups
      const userGroupsQuery = query(
        collection(firestore, 'groups'),
        where(`members.${userId}.id`, '==', userId)
      );

      const userGroupsSnapshot = await getDocs(userGroupsQuery);
      const groupIds: string[] = [];

      userGroupsSnapshot.forEach(doc => {
        groupIds.push(doc.id);
      });

      if (groupIds.length === 0) {
        return [];
      }

      // Query videos for the user's groups
      // Note: Firestore doesn't support OR queries with array-contains
      // In a real app, we might need a more complex solution or use a cloud function
      const videos: Video[] = [];

      for (const groupId of groupIds) {
        const videosQuery = query(
          collection(firestore, 'videos'),
          where('groupIds', 'array-contains', groupId),
          orderBy('createdAt', 'desc'),
          limit(queryLimit)
        );

        const videosSnapshot = await getDocs(videosQuery);

        videosSnapshot.forEach(doc => {
          // Check if we already have this video (from another group)
          if (!videos.some(v => v.id === doc.id)) {
            videos.push({
              id: doc.id,
              ...doc.data(),
            } as Video);
          }
        });
      }

      // Sort by createdAt (newest first)
      videos.sort((a, b) => {
        const aTime = a.createdAt as Timestamp;
        const bTime = b.createdAt as Timestamp;
        return bTime.seconds - aTime.seconds;
      });

      // Limit to the requested number of videos
      return videos.slice(0, queryLimit);
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('An unknown error occurred');
    }
  }
);

export const fetchVideoById = createAsyncThunk(
  'videos/fetchVideoById',
  async (videoId: string, { rejectWithValue }) => {
    try {
      const videoRef = doc(firestore, 'videos', videoId);
      const videoSnapshot = await getDoc(videoRef);

      if (!videoSnapshot.exists()) {
        return rejectWithValue('Video not found');
      }

      return {
        id: videoSnapshot.id,
        ...videoSnapshot.data(),
      } as Video;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('An unknown error occurred');
    }
  }
);

// Initial state
const initialState: VideosState = {
  videos: [],
  feedVideos: [],
  currentVideo: null,
  status: 'idle',
  uploadProgress: 0,
  error: null,
};

// Create slice
const videosSlice = createSlice({
  name: 'videos',
  initialState,
  reducers: {
    setCurrentVideo: (state, action: PayloadAction<Video | null>) => {
      state.currentVideo = action.payload;
    },
    clearVideosError: state => {
      state.error = null;
    },
    setUploadProgress: (state, action: PayloadAction<number>) => {
      state.uploadProgress = action.payload;
    },
    resetUploadProgress: state => {
      state.uploadProgress = 0;
    },
    updateGroupLastActivity: (state, action: PayloadAction<string>) => {
      // This is a no-op in this slice, but we need it for the uploadVideo thunk
      // The actual implementation is in the groupsSlice
    },
  },
  extraReducers: builder => {
    // Upload video
    builder
      .addCase(uploadVideo.pending, state => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(uploadVideo.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.videos.unshift(action.payload);
        state.feedVideos.unshift(action.payload);
        state.currentVideo = action.payload;
        state.uploadProgress = 0;
        state.error = null;
      })
      .addCase(uploadVideo.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
        state.uploadProgress = 0;
      });

    // Fetch videos for group
    builder
      .addCase(fetchVideosForGroup.pending, state => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchVideosForGroup.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.videos = action.payload;
        state.error = null;
      })
      .addCase(fetchVideosForGroup.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });

    // Fetch feed videos
    builder
      .addCase(fetchFeedVideos.pending, state => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchFeedVideos.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.feedVideos = action.payload;
        state.error = null;
      })
      .addCase(fetchFeedVideos.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });

    // Fetch video by ID
    builder
      .addCase(fetchVideoById.pending, state => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchVideoById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.currentVideo = action.payload;

        // Update the video in the videos array if it exists
        const videoIndex = state.videos.findIndex(video => video.id === action.payload.id);
        if (videoIndex !== -1) {
          state.videos[videoIndex] = action.payload;
        }

        // Update the video in the feedVideos array if it exists
        const feedVideoIndex = state.feedVideos.findIndex(video => video.id === action.payload.id);
        if (feedVideoIndex !== -1) {
          state.feedVideos[feedVideoIndex] = action.payload;
        }

        state.error = null;
      })
      .addCase(fetchVideoById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

export const {
  setCurrentVideo,
  clearVideosError,
  setUploadProgress,
  resetUploadProgress,
  updateGroupLastActivity,
} = videosSlice.actions;

export default videosSlice.reducer;
