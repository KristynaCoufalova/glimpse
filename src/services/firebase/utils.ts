import { 
    collection, 
    doc, 
    getDocs, 
    query, 
    where, 
    getDoc, 
    setDoc, 
    updateDoc, 
    arrayUnion, 
    orderBy, 
    limit, 
    serverTimestamp,
    Timestamp 
  } from 'firebase/firestore';
  import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
  import { firestore, storage } from './config';
  
  /**
   * Converts a local file URI to a blob for upload
   */
  export const uriToBlob = async (uri: string): Promise<Blob> => {
    const response = await fetch(uri);
    return await response.blob();
  };
  
  /**
   * Uploads an image to Firebase Storage
   * @param uri Local file URI
   * @param path Storage path (e.g., 'group_photos/123')
   * @returns Download URL of the uploaded image
   */
  export const uploadImage = async (uri: string, path: string): Promise<string> => {
    try {
      const blob = await uriToBlob(uri);
      const imageRef = ref(storage, `${path}_${Date.now()}.jpg`);
      await uploadBytes(imageRef, blob);
      const downloadURL = await getDownloadURL(imageRef);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };
  
  /**
   * Uploads a video to Firebase Storage
   * @param uri Local file URI
   * @param path Storage path (e.g., 'videos/123')
   * @returns Download URL of the uploaded video
   */
  export const uploadVideo = async (uri: string, path: string): Promise<string> => {
    try {
      const blob = await uriToBlob(uri);
      const videoRef = ref(storage, `${path}_${Date.now()}.mp4`);
      await uploadBytes(videoRef, blob);
      const downloadURL = await getDownloadURL(videoRef);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading video:', error);
      throw error;
    }
  };
  
  /**
   * Creates a thumbnail from a video
   * In a real app, this would be done server-side
   * This is a placeholder that returns the video URL with a modified path
   */
  export const generateThumbnail = (videoURL: string): string => {
    // This is a placeholder. In a real app, you would generate a real thumbnail
    return videoURL.replace('.mp4', '_thumbnail.jpg');
  };
  
  /**
   * Formats a timestamp for display
   */
  export const formatTimestamp = (timestamp: Timestamp | Date | null): string => {
    if (!timestamp) return 'Recently';
    
    const date = timestamp instanceof Timestamp ? timestamp.toDate() : timestamp;
    
    // For recent timestamps (within 24 hours), show "X hours ago"
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const diffHours = Math.floor(diff / (1000 * 60 * 60));
    
    if (diffHours < 24) {
      if (diffHours < 1) {
        const diffMinutes = Math.floor(diff / (1000 * 60));
        return diffMinutes < 1 ? 'Just now' : `${diffMinutes}m ago`;
      }
      return `${diffHours}h ago`;
    }
    
    const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (diffDays < 7) {
      return `${diffDays}d ago`;
    }
    
    // For older timestamps, show the date
    return date.toLocaleDateString();
  };
  
  /**
   * Checks if a user is an admin of a group
   */
  export const isGroupAdmin = (group: any, userId: string): boolean => {
    return group?.members?.[userId]?.role === 'admin';
  };
  
  /**
   * Gets user details from Firestore
   */
  export const getUserDetails = async (userId: string): Promise<any> => {
    try {
      const userDoc = await getDoc(doc(firestore, 'users', userId));
      if (userDoc.exists()) {
        return { id: userDoc.id, ...userDoc.data() };
      }
      return null;
    } catch (error) {
      console.error('Error getting user details:', error);
      throw error;
    }
  };
  
  /**
   * Updates a group's last activity timestamp
   */
  export const updateGroupLastActivity = async (groupId: string): Promise<void> => {
    try {
      const groupRef = doc(firestore, 'groups', groupId);
      await updateDoc(groupRef, {
        lastActivity: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating group activity:', error);
      throw error;
    }
  };