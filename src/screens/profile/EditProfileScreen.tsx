// src/screens/profile/EditProfileScreen.tsx
import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  SafeAreaView, 
  TouchableOpacity, 
  Image, 
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { updateProfile } from '../../store/slices/userSlice';
import { Header, Button } from '../../components/common';
import DateTimePicker from '@react-native-community/datetimepicker';

type EditProfileScreenNavigationProp = StackNavigationProp<RootStackParamList, 'EditProfile'>;

const EditProfileScreen: React.FC = () => {
  const navigation = useNavigation<EditProfileScreenNavigationProp>();
  const dispatch = useDispatch();
  
  // Get user state from Redux
  const { user, status } = useSelector((state: RootState) => state.user);
  
  // Local state
  const [name, setName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [imageUri, setImageUri] = useState<string | null>(user?.photoURL || null);
  const [birthday, setBirthday] = useState<Date | null>(user?.birthday ? new Date(user.birthday) : null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [timezone, setTimezone] = useState(user?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [loading, setLoading] = useState(false);
  
  // Set the detected timezone on component mount if not already set
  useEffect(() => {
    if (!user?.timezone) {
      setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    }
  }, [user?.timezone]);
  
  // Request permission for accessing photo library
  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Sorry, we need camera roll permissions to upload profile pictures.');
      }
    })();
  }, []);
  
  // Handle profile picture selection
  const handleSelectImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error selecting image:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };
  
  // Handle taking a new photo
  const handleTakePhoto = async () => {
    try {
      // Check for camera permissions
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Sorry, we need camera permissions to take photos.');
        return;
      }
      
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };
  
  // Handle image selection options
  const handleChangeProfilePicture = () => {
    Alert.alert(
      'Change Profile Picture',
      'Choose how you want to update your profile picture',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Take Photo',
          onPress: handleTakePhoto,
        },
        {
          text: 'Choose from Library',
          onPress: handleSelectImage,
        },
      ]
    );
  };
  
  // Handle birthday date change
  const onChangeBirthday = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setBirthday(selectedDate);
    }
  };
  
  // Format date for display
  const formatBirthday = (date: Date | null) => {
    if (!date) return 'Not set';
    return date.toLocaleDateString();
  };
  
  // Handle save profile
  const handleSaveProfile = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }
    
    setLoading(true);
    
    try {
      // Prepare the update data
      const updateData = {
        displayName: name,
        photoURL: imageUri,
        timezone: timezone,
        birthday: birthday ? birthday.toISOString() : null
      };
      
      try {
        // Dispatch the update action
        // Add type assertion to avoid dispatch type issues
        const resultAction = await dispatch(updateProfile(updateData) as any);
        
        // Check if the action was fulfilled
        if (updateProfile.fulfilled.match(resultAction)) {
          setLoading(false);
          Alert.alert(
            'Success',
            'Your profile has been updated successfully',
            [
              {
                text: 'OK',
                onPress: () => navigation.goBack()
              }
            ]
          );
        } else if (resultAction.error) {
          console.error('Error details:', resultAction.error);
          console.error('Error in resultAction:', JSON.stringify(resultAction.error, null, 2));
          throw new Error('Failed to update profile: ' + (resultAction.error.toString() || 'Unknown error'));
        } else {
          throw new Error('Failed to update profile');
        }
      } catch (error) {
        console.error('Error in profile update dispatch:', error);
        throw error; // Re-throw to be caught by outer catch block
      }
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
      console.error('Error updating profile:', error);
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <Header
        title="Edit Profile"
        showBackButton
        onLeftPress={() => navigation.goBack()}
      />
      
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Profile picture */}
          <View style={styles.profilePictureContainer}>
            <View style={styles.avatarContainer}>
              {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>{name.split(' ').map(n => n[0]).join('')}</Text>
                </View>
              )}
              
              <TouchableOpacity 
                style={styles.editAvatarButton}
                onPress={handleChangeProfilePicture}
              >
                <Ionicons name="camera" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity onPress={handleChangeProfilePicture}>
              <Text style={styles.changePictureText}>Change Profile Picture</Text>
            </TouchableOpacity>
          </View>
          
          {/* Form fields */}
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Name</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Your name"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={[styles.input, styles.disabledInput]}
                value={email}
                editable={false}
              />
              <Text style={styles.helperText}>Email cannot be changed</Text>
            </View>
            
            {/* Birthday field */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Birthday</Text>
              <TouchableOpacity 
                style={styles.input} 
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={birthday ? styles.dateText : styles.dateTextPlaceholder}>
                  {birthday ? formatBirthday(birthday) : 'Select your birthday'}
                </Text>
              </TouchableOpacity>
              
              {showDatePicker && (
                <DateTimePicker
                  value={birthday || new Date()}
                  mode="date"
                  display="default"
                  onChange={onChangeBirthday}
                  maximumDate={new Date()} // Prevent future dates
                />
              )}
            </View>
            
            {/* Timezone field */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Timezone</Text>
              <TextInput
                style={[styles.input, styles.disabledInput]}
                value={timezone}
                editable={false}
              />
              <Text style={styles.helperText}>Detected from your device</Text>
            </View>
          </View>
        </ScrollView>
        
        <View style={styles.buttonContainer}>
          <Button
            title="Cancel"
            onPress={() => navigation.goBack()}
            type="outline"
            style={styles.cancelButton}
            disabled={loading}
          />
          
          <Button
            title="Save Changes"
            onPress={handleSaveProfile}
            loading={loading}
            style={styles.saveButton}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardAvoidingContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  profilePictureContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#4ECDC4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 40,
    fontWeight: 'bold',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FF6B6B',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  changePictureText: {
    color: '#4ECDC4',
    fontSize: 16,
    fontWeight: '600',
  },
  formContainer: {
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
  },
  disabledInput: {
    backgroundColor: '#e5e5e5',
    color: '#888',
  },
  helperText: {
    fontSize: 12,
    color: '#888',
    marginTop: 5,
  },
  dateText: {
    color: '#333',
    fontSize: 16,
  },
  dateTextPlaceholder: {
    color: '#999',
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  cancelButton: {
    width: '48%',
  },
  saveButton: {
    width: '48%',
  },
});

export default EditProfileScreen;