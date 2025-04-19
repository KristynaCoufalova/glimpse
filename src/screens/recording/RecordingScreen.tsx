import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { SafeScreen } from '../../components/common';
import { Ionicons } from '@expo/vector-icons';
import * as ExpoCamera from 'expo-camera';
import { CameraView } from 'expo-camera';
import { useNavigation, StackActions } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation';
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
const dailyPrompt = 'Share something that made you smile today';

const MAX_DURATION = 90; // 90 seconds max recording duration

const RecordingScreen: React.FC = () => {
  const navigation = useNavigation<RecordingScreenNavigationProp>();
  const cameraRef = useRef<any>(null);

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [cameraType, setCameraType] = useState('front');
  const [flashMode, setFlashMode] = useState('off');
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
      const { status } = await ExpoCamera.Camera.requestCameraPermissionsAsync();
      const { status: micStatus } = await ExpoCamera.Camera.requestMicrophonePermissionsAsync();
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
    setCameraType(current => (current === 'back' ? 'front' : 'back'));
  };

  // Toggle flash mode
  const toggleFlashMode = () => {
    setFlashMode(current => (current === 'off' ? 'torch' : 'off'));
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

        Alert.alert('Success', 'Your video has been shared successfully!', [
          {
            text: 'OK',
            onPress: () => navigation.dispatch(StackActions.popToTop()),
          },
        ]);
      }, 2000);
    } catch (error) {
      setIsUploading(false);
      Alert.alert('Error', 'Failed to share video. Please try again.');
      console.error('Error sharing video:', error);
    }
  };

  // Handle discard video
  const handleDiscardVideo = () => {
    Alert.alert('Discard Video', 'Are you sure you want to discard this video?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Discard',
        style: 'destructive',
        onPress: () => {
          setVideoUri(null);
          setCaption('');
          setSelectedGroups([]);
        },
      },
    ]);
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
      <SafeScreen style={styles.container} statusBarStyle="light-content" statusBarColor="#000">
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4ECDC4" />
          <Text style={styles.loadingText}>Requesting camera permission...</Text>
        </View>
      </SafeScreen>
    );
  }

  if (hasPermission === false) {
    return (
      <SafeScreen style={styles.container} statusBarStyle="light-content" statusBarColor="#000">
        <View style={styles.permissionContainer}>
          <Ionicons name="videocam-off" size={60} color="#FF6B6B" />
          <Text style={styles.permissionTitle}>Camera Permission Required</Text>
          <Text style={styles.permissionText}>
            We need camera and microphone permissions to record videos. Please enable them in your
            device settings.
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={() => navigation.goBack()}>
            <Text style={styles.permissionButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeScreen>
    );
  }

  return (
    <SafeScreen style={styles.container} statusBarStyle="light-content" statusBarColor="#000">

      {/* Camera preview or video preview */}
      {!videoUri ? (
        <View style={styles.cameraContainer}>
          <View style={styles.camera}>
            {/* Using a div-like approach since CameraView props differ */}
            <View style={{ flex: 1 }}>
              {/* Camera component will be properly rendered in actual app */}
              <Text style={styles.previewText}>Camera Preview</Text>
              <Text style={styles.previewSubtext}>(Camera will show here in the actual app)</Text>
            </View>
          </View>

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
                  { width: `${(recordingDuration / MAX_DURATION) * 100}%` },
                ]}
              />
            </View>
          )}

          {/* Camera controls */}
          <View style={styles.cameraControls}>
            <TouchableOpacity style={styles.controlButton} onPress={handleClose}>
              <Ionicons name="close" size={28} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.controlButton} onPress={toggleFlashMode}>
              <Ionicons name={flashMode === 'off' ? 'flash-off' : 'flash'} size={28} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.controlButton} onPress={toggleCameraType}>
              <Ionicons name="camera-reverse" size={28} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.controlButton} onPress={() => setShowPrompt(true)}>
              <Ionicons name="help-circle" size={28} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Record button */}
          <View style={styles.recordButtonContainer}>
            <TouchableOpacity
              style={[styles.recordButton, isRecording && styles.recordingButton]}
              onPress={isRecording ? stopRecording : startRecording}
            >
              {isRecording ? <View style={styles.stopIcon} /> : <View style={styles.recordIcon} />}
            </TouchableOpacity>
            <Text style={styles.recordText}>{isRecording ? 'Tap to stop' : 'Tap to record'}</Text>
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
              <Text style={styles.characterCount}>{caption.length}/200</Text>
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
                      selectedGroups.includes(group.id) && styles.groupItemSelected,
                    ]}
                    onPress={() => toggleGroupSelection(group.id)}
                  >
                    <Text
                      style={[
                        styles.groupItemText,
                        selectedGroups.includes(group.id) && styles.groupItemTextSelected,
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
                  (selectedGroups.length === 0 || isUploading) && styles.shareButtonDisabled,
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

            <TouchableOpacity style={styles.usePromptButton} onPress={usePromptAsCaption}>
              <Text style={styles.usePromptButtonText}>Use This Prompt</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeScreen>
  );
};

const styles = StyleSheet.create({
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  camera: {
    flex: 1,
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  cameraControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    left: 0,
    paddingHorizontal: 20,
    position: 'absolute',
    right: 0,
    top: 20,
  },
  captionInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    fontSize: 16,
    minHeight: 100,
    padding: 15,
    textAlignVertical: 'top',
  },
  characterCount: {
    color: '#999',
    fontSize: 12,
    marginTop: 5,
    textAlign: 'right',
  },
  container: {
    backgroundColor: '#000',
    flex: 1,
  },
  controlButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  discardButton: {
    alignItems: 'center',
    borderColor: '#ccc',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 12,
    width: '45%',
  },
  discardButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: 'bold',
  },
  groupItem: {
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    flexDirection: 'row',
    marginBottom: 10,
    marginRight: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
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
  groupsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  inputSubLabel: {
    color: '#666',
    fontSize: 14,
    marginBottom: 12,
  },
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 20,
  },
  modalOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  permissionButton: {
    backgroundColor: '#4ECDC4',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  permissionContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  permissionText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 30,
    textAlign: 'center',
  },
  permissionTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 20,
  },
  previewContainer: {
    backgroundColor: '#fff',
    flex: 1,
  },
  previewForm: {
    flex: 1,
    padding: 20,
  },
  previewSubtext: {
    color: '#ccc',
    fontSize: 14,
  },
  previewText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  progressBar: {
    backgroundColor: '#FF6B6B',
    height: 4,
    left: 0,
    position: 'absolute',
    top: 40,
  },
  promptHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  promptModal: {
    backgroundColor: '#fff',
    borderRadius: 12,
    maxWidth: 400,
    padding: 20,
    width: '90%',
  },
  promptText: {
    color: '#333',
    fontSize: 16,
    fontStyle: 'italic',
    marginBottom: 20,
    textAlign: 'center',
  },
  promptTitle: {
    color: '#333',
    fontSize: 18,
    fontWeight: 'bold',
  },
  recordButton: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 35,
    height: 70,
    justifyContent: 'center',
    marginBottom: 10,
    width: 70,
  },
  recordButtonContainer: {
    alignItems: 'center',
    bottom: 40,
    left: 0,
    position: 'absolute',
    right: 0,
  },
  recordIcon: {
    backgroundColor: '#FF6B6B',
    borderRadius: 27,
    height: 54,
    width: 54,
  },
  recordText: {
    color: '#fff',
    fontSize: 14,
  },
  recordingButton: {
    backgroundColor: '#FF6B6B',
  },
  shareButton: {
    alignItems: 'center',
    backgroundColor: '#4ECDC4',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    width: '45%',
  },
  shareButtonDisabled: {
    backgroundColor: '#ccc',
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  stopIcon: {
    backgroundColor: '#fff',
    borderRadius: 3,
    height: 30,
    width: 30,
  },
  timerBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 15,
    marginBottom: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  timerContainer: {
    alignItems: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 80,
  },
  timerText: {
    color: '#fff',
    fontSize: 14,
  },
  usePromptButton: {
    alignItems: 'center',
    backgroundColor: '#4ECDC4',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  usePromptButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  videoPreview: {
    alignItems: 'center',
    backgroundColor: '#222',
    height: 300,
    justifyContent: 'center',
  },
});

export default RecordingScreen;
