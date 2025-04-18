import React, { useState, useRef, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  SafeAreaView,
  Dimensions,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Camera } from 'expo-camera';
import { useNavigation, StackActions } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation';

// Define camera types and flash modes as constants
const CAMERA_TYPES = {
  front: 'front',
  back: 'back'
};

const FLASH_MODES = {
  off: 'off',
  on: 'on',
  auto: 'auto',
  torch: 'torch'
};

type RecordingScreenNavigationProp = StackNavigationProp<RootStackParamList>;

// Mock data for groups
interface Group {
  id: string;
  name: string;
}

const mockGroups: Group[] = [
  { id: 'group1', name: 'Family' },
  { id: 'group2', name: 'College Friends' },
  { id: 'group3', name: 'Work Team' },
];

// Daily prompt
const dailyPrompt = "Share something that made you smile today";

const MAX_DURATION = 90; // 90 seconds max recording duration

const RecordingScreen: React.FC = () => {
  const navigation = useNavigation<RecordingScreenNavigationProp>();
  const cameraRef = useRef<any>(null);
  
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [cameraType, setCameraType] = useState<string>(CAMERA_TYPES.front);
  const [flashMode, setFlashMode] = useState<string>(FLASH_MODES.off);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordingTimer, setRecordingTimer] = useState<NodeJS.Timeout | null>(null);
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  
  // Request camera permissions
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      const { status: micStatus } = await Camera.requestMicrophonePermissionsAsync();
      setHasPermission(status === 'granted' && micStatus === 'granted');
    })();
  }, []);
  
  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (recordingTimer) {
        clearInterval(recordingTimer);
      }
    };
  }, [recordingTimer]);
  
  // Toggle camera type (front/back)
  const toggleCameraType = () => {
    setCameraType((current: string) => (
      current === CAMERA_TYPES.back ? CAMERA_TYPES.front : CAMERA_TYPES.back
    ));
  };
  
  // Toggle flash mode
  const toggleFlashMode = () => {
    setFlashMode((current: string) => (
      current === FLASH_MODES.off ? FLASH_MODES.torch : FLASH_MODES.off
    ));
  };
  
  // Start recording
  const startRecording = async () => {
    if (!cameraRef.current) return;
    
    try {
      setIsRecording(true);
      setRecordingDuration(0);
      
      // Start timer
      const timer = setInterval(() => {
        setRecordingDuration(prev => {
          if (prev >= MAX_DURATION) {
            stopRecording();
            return MAX_DURATION;
          }
          return prev + 1;
        });
      }, 1000);
      
      setRecordingTimer(timer);
      
      // Start recording
      const video = await cameraRef.current.recordAsync({
        maxDuration: MAX_DURATION,
        quality: '720p',
      });
      
      setVideoUri(video.uri);
    } catch (error) {
      console.error('Error recording video:', error);
      Alert.alert('Error', 'Failed to record video. Please try again.');
      setIsRecording(false);
    }
  };
  
  // Stop recording
  const stopRecording = () => {
    if (!cameraRef.current) return;
    
    cameraRef.current.stopRecording();
    setIsRecording(false);
    
    if (recordingTimer) {
      clearInterval(recordingTimer);
      setRecordingTimer(null);
    }
  };
  
  // Toggle group selection
  const toggleGroupSelection = (groupId: string) => {
    setSelectedGroups(prev => {
      if (prev.includes(groupId)) {
        return prev.filter(id => id !== groupId);
      } else {
        return [...prev, groupId];
      }
    });
  };
  
  // Handle share video
  const handleShareVideo = async () => {
    if (!videoUri) {
      Alert.alert('Error', 'No video recorded. Please record a video first.');
      return;
    }
    
    if (selectedGroups.length === 0) {
      Alert.alert('Error', 'Please select at least one group to share with.');
      return;
    }
    
    setIsUploading(true);
    
    try {
      // Simulate upload delay
      setTimeout(() => {
        setIsUploading(false);
        
        // In a real app, we would upload the video to Firebase Storage
        // and create a document in Firestore with the video details
        
        Alert.alert(
          'Success',
          'Your video has been shared successfully!',
          [
            { 
              text: 'OK', 
              onPress: () => navigation.dispatch(StackActions.popToTop())
            }
          ]
        );
      }, 2000);
    } catch (error) {
      setIsUploading(false);
      Alert.alert('Error', 'Failed to share video. Please try again.');
      console.error('Error sharing video:', error);
    }
  };
  
  // Handle discard video
  const handleDiscardVideo = () => {
    Alert.alert(
      'Discard Video',
      'Are you sure you want to discard this video?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: () => {
            setVideoUri(null);
            setCaption('');
            setSelectedGroups([]);
          }
        }
      ]
    );
  };
  
  // Handle close
  const handleClose = () => {
    if (videoUri) {
      handleDiscardVideo();
    } else {
      navigation.goBack();
    }
  };
  
  // Use prompt
  const usePromptAsCaption = () => {
    setCaption(dailyPrompt);
    setShowPrompt(false);
  };
  
  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  if (hasPermission === null) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4ECDC4" />
          <Text style={styles.loadingText}>Requesting camera permission...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  if (hasPermission === false) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.permissionContainer}>
          <Ionicons name="videocam-off" size={60} color="#FF6B6B" />
          <Text style={styles.permissionTitle}>Camera Permission Required</Text>
          <Text style={styles.permissionText}>
            We need camera and microphone permissions to record videos.
            Please enable them in your device settings.
          </Text>
          <TouchableOpacity 
            style={styles.permissionButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.permissionButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Camera preview or video preview */}
      {!videoUri ? (
        <View style={styles.cameraContainer}>
          {/* @ts-ignore - Camera component type issue */}
          <Camera
            ref={cameraRef}
            style={styles.camera}
            type={cameraType}
            flashMode={flashMode}
          />
          
          {/* Recording timer */}
          {isRecording && (
            <View style={styles.timerContainer}>
              <View style={styles.timerBadge}>
                <Text style={styles.timerText}>
                  {formatTime(recordingDuration)} / {formatTime(MAX_DURATION)}
                </Text>
              </View>
              <View 
                style={[
                  styles.progressBar,
                  { width: `${(recordingDuration / MAX_DURATION) * 100}%` }
                ]} 
              />
            </View>
          )}
          
          {/* Camera controls */}
          <View style={styles.cameraControls}>
            <TouchableOpacity 
              style={styles.controlButton}
              onPress={handleClose}
            >
              <Ionicons name="close" size={28} color="#fff" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.controlButton}
              onPress={toggleFlashMode}
            >
              <Ionicons 
                name={flashMode === FLASH_MODES.off ? "flash-off" : "flash"} 
                size={28} 
                color="#fff" 
              />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.controlButton}
              onPress={toggleCameraType}
            >
              <Ionicons name="camera-reverse" size={28} color="#fff" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.controlButton}
              onPress={() => setShowPrompt(true)}
            >
              <Ionicons name="help-circle" size={28} color="#fff" />
            </TouchableOpacity>
          </View>
          
          {/* Record button */}
          <View style={styles.recordButtonContainer}>
            <TouchableOpacity
              style={[
                styles.recordButton,
                isRecording && styles.recordingButton
              ]}
              onPress={isRecording ? stopRecording : startRecording}
            >
              {isRecording ? (
                <View style={styles.stopIcon} />
              ) : (
                <View style={styles.recordIcon} />
              )}
            </TouchableOpacity>
            <Text style={styles.recordText}>
              {isRecording ? 'Tap to stop' : 'Tap to record'}
            </Text>
          </View>
        </View>
      ) : (
        <View style={styles.previewContainer}>
          {/* Video preview placeholder */}
          <View style={styles.videoPreview}>
            <Text style={styles.previewText}>Video Preview</Text>
            <Text style={styles.previewSubtext}>
              (In a real app, this would show the recorded video)
            </Text>
          </View>
          
          <ScrollView style={styles.previewForm}>
            {/* Caption input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Caption</Text>
              <TextInput
                style={styles.captionInput}
                value={caption}
                onChangeText={setCaption}
                placeholder="Add a caption to your video..."
                multiline
                maxLength={200}
              />
              <Text style={styles.characterCount}>
                {caption.length}/200
              </Text>
            </View>
            
            {/* Group selection */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Share with</Text>
              <Text style={styles.inputSubLabel}>
                Select the groups you want to share this video with
              </Text>
              
              <View style={styles.groupsContainer}>
                {mockGroups.map(group => (
                  <TouchableOpacity
                    key={group.id}
                    style={[
                      styles.groupItem,
                      selectedGroups.includes(group.id) && styles.groupItemSelected
                    ]}
                    onPress={() => toggleGroupSelection(group.id)}
                  >
                    <Text 
                      style={[
                        styles.groupItemText,
                        selectedGroups.includes(group.id) && styles.groupItemTextSelected
                      ]}
                    >
                      {group.name}
                    </Text>
                    {selectedGroups.includes(group.id) && (
                      <Ionicons name="checkmark" size={16} color="#fff" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            {/* Action buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={styles.discardButton}
                onPress={handleDiscardVideo}
                disabled={isUploading}
              >
                <Text style={styles.discardButtonText}>Discard</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.shareButton,
                  (selectedGroups.length === 0 || isUploading) && styles.shareButtonDisabled
                ]}
                onPress={handleShareVideo}
                disabled={selectedGroups.length === 0 || isUploading}
              >
                {isUploading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.shareButtonText}>Share</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      )}
      
      {/* Daily prompt modal */}
      <Modal
        visible={showPrompt}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowPrompt(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.promptModal}>
            <View style={styles.promptHeader}>
              <Text style={styles.promptTitle}>Daily Prompt</Text>
              <TouchableOpacity onPress={() => setShowPrompt(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.promptText}>{dailyPrompt}</Text>
            
            <TouchableOpacity 
              style={styles.usePromptButton}
              onPress={usePromptAsCaption}
            >
              <Text style={styles.usePromptButtonText}>Use This Prompt</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    color: '#fff',
    marginTop: 20,
    fontSize: 16,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  permissionTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  permissionText: {
    color: '#fff',
    textAlign: 'center',
    marginBottom: 30,
    fontSize: 16,
  },
  permissionButton: {
    backgroundColor: '#4ECDC4',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  cameraControls: {
    position: 'absolute',
    top: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordButtonContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  recordButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  recordingButton: {
    backgroundColor: '#FF6B6B',
  },
  recordIcon: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#FF6B6B',
  },
  stopIcon: {
    width: 30,
    height: 30,
    backgroundColor: '#fff',
    borderRadius: 3,
  },
  recordText: {
    color: '#fff',
    fontSize: 14,
  },
  timerContainer: {
    position: 'absolute',
    top: 80,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  timerBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 15,
    marginBottom: 10,
  },
  timerText: {
    color: '#fff',
    fontSize: 14,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#FF6B6B',
    position: 'absolute',
    top: 40,
    left: 0,
  },
  previewContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  videoPreview: {
    height: 300,
    backgroundColor: '#222',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  previewSubtext: {
    color: '#ccc',
    fontSize: 14,
  },
  previewForm: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  inputSubLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  captionInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 5,
  },
  groupsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  groupItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
  },
  groupItemSelected: {
    backgroundColor: '#4ECDC4',
  },
  groupItemText: {
    color: '#333',
    marginRight: 5,
  },
  groupItemTextSelected: {
    color: '#fff',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  discardButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    width: '45%',
    alignItems: 'center',
  },
  discardButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: 'bold',
  },
  shareButton: {
    backgroundColor: '#4ECDC4',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: '45%',
    alignItems: 'center',
  },
  shareButtonDisabled: {
    backgroundColor: '#ccc',
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  promptModal: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  promptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  promptTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  promptText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  usePromptButton: {
    backgroundColor: '#4ECDC4',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  usePromptButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default RecordingScreen;