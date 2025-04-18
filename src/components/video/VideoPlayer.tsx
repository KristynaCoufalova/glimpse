import React, { useState, useRef, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  TouchableOpacity, 
  Text,
  ActivityIndicator,
  Dimensions,
  Image
} from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';

interface VideoPlayerProps {
  uri: string;
  thumbnailUri?: string;
  isActive: boolean;
  onVideoEnd?: () => void;
  onVideoPress?: () => void;
  onDoubleTap?: () => void;
}

const { width, height } = Dimensions.get('window');

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  uri,
  thumbnailUri,
  isActive,
  onVideoEnd,
  onVideoPress,
  onDoubleTap
}) => {
  const videoRef = useRef<Video>(null);
  const [status, setStatus] = useState<AVPlaybackStatus | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPlayIcon, setShowPlayIcon] = useState(false);
  const [showLikeAnimation, setShowLikeAnimation] = useState(false);
  const lastTap = useRef<number>(0);

  // Handle double tap
  const handleVideoPress = () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    
    if (now - lastTap.current < DOUBLE_TAP_DELAY) {
      // Double tap detected
      setShowLikeAnimation(true);
      setTimeout(() => setShowLikeAnimation(false), 1000);
      if (onDoubleTap) onDoubleTap();
    } else {
      // Single tap
      if (onVideoPress) onVideoPress();
      
      // Toggle play/pause
      if (status?.isLoaded) {
        if (status.isPlaying) {
          videoRef.current?.pauseAsync();
          setShowPlayIcon(true);
          setTimeout(() => setShowPlayIcon(false), 1500);
        } else {
          videoRef.current?.playAsync();
        }
      }
    }
    
    lastTap.current = now;
  };

  // Toggle mute
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  // Handle playback status updates
  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    setStatus(status);
    
    if (status.isLoaded) {
      setIsLoading(false);
      
      // Handle video end
      if (status.didJustFinish && onVideoEnd) {
        onVideoEnd();
      }
    }
  };

  // Handle errors
  const handleError = (error: string) => {
    console.error('Video playback error:', error);
    setError('Failed to load video');
    setIsLoading(false);
  };

  // Play/pause based on active state
  useEffect(() => {
    if (!videoRef.current) return;
    
    if (isActive) {
      videoRef.current.playAsync();
    } else {
      videoRef.current.pauseAsync();
    }
  }, [isActive]);

  // Load video when component mounts
  useEffect(() => {
    if (!videoRef.current) return;
    
    const loadVideo = async () => {
      try {
        await videoRef.current?.loadAsync(
          { uri },
          { shouldPlay: isActive, isMuted }
        );
      } catch (err) {
        handleError(err instanceof Error ? err.message : 'Unknown error');
      }
    };
    
    loadVideo();
    
    // Cleanup when component unmounts
    return () => {
      if (videoRef.current) {
        videoRef.current.unloadAsync();
      }
    };
  }, [uri]);

  return (
    <View style={styles.container}>
      {/* Thumbnail (shown while video is loading) */}
      {isLoading && thumbnailUri && (
        <Image 
          source={{ uri: thumbnailUri }} 
          style={styles.thumbnail}
          resizeMode="cover"
        />
      )}
      
      {/* Video */}
      <TouchableOpacity 
        activeOpacity={1}
        style={styles.videoContainer}
        onPress={handleVideoPress}
      >
        <Video
          ref={videoRef}
          style={styles.video}
          resizeMode={ResizeMode.COVER}
          isLooping
          onPlaybackStatusUpdate={onPlaybackStatusUpdate}
          onError={() => handleError('Video playback error')}
          isMuted={isMuted}
        />
        
        {/* Loading indicator */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#fff" />
          </View>
        )}
        
        {/* Error message */}
        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={40} color="#FF6B6B" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
        
        {/* Play/Pause icon (shown briefly when toggling) */}
        {showPlayIcon && (
          <View style={styles.playIconContainer}>
            <Ionicons 
              name={status?.isLoaded && !status.isPlaying ? "play" : "pause"} 
              size={70} 
              color="rgba(255, 255, 255, 0.8)" 
            />
          </View>
        )}
        
        {/* Like animation (shown on double tap) */}
        {showLikeAnimation && (
          <View style={styles.likeAnimationContainer}>
            <Ionicons name="heart" size={100} color="#FF6B6B" />
          </View>
        )}
      </TouchableOpacity>
      
      {/* Mute/Unmute button */}
      <TouchableOpacity 
        style={styles.muteButton}
        onPress={toggleMute}
      >
        <Ionicons 
          name={isMuted ? "volume-mute" : "volume-high"} 
          size={24} 
          color="white" 
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width,
    height,
    backgroundColor: '#000',
    position: 'relative',
  },
  videoContainer: {
    width: '100%',
    height: '100%',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  thumbnail: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 1,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  errorContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    zIndex: 2,
  },
  errorText: {
    color: 'white',
    marginTop: 10,
    fontSize: 16,
    textAlign: 'center',
  },
  playIconContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 3,
  },
  likeAnimationContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 3,
  },
  muteButton: {
    position: 'absolute',
    bottom: 120,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
    zIndex: 4,
  },
});

export default VideoPlayer;