import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
} from 'react-native';
import { SafeScreen } from '../../components/common';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation';
import { useDispatch, useSelector } from 'react-redux';
import { createGroup } from '../../store/slices/groupsSlice';
import { RootState } from '../../store';
import * as ImagePicker from 'expo-image-picker';

type CreateGroupScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const CreateGroupScreen: React.FC = () => {
  const navigation = useNavigation<CreateGroupScreenNavigationProp>();
  const dispatch = useDispatch();
  const { status, error } = useSelector((state: RootState) => state.groups);
  const { user } = useSelector((state: RootState) => state.auth);

  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [inviteEmails, setInviteEmails] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const loading = status === 'loading';

  // Handle image picker
  const pickImage = async () => {
    try {
      // No permissions request is necessary for launching the image library
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      // Safe check for both older and newer ImagePicker API results
      if (!result.canceled) {
        // Handle newer API (SDK 46+) with assets array
        if (result.assets && result.assets.length > 0) {
          setImage(result.assets[0].uri);
        }
        // For backward compatibility with older API versions
        else if ((result as any).uri) {
          setImage((result as any).uri);
        }
      }
    } catch (error) {
      console.error('Error picking an image:', error);
      Alert.alert('Error', 'Failed to pick an image. Please try again.');
    }
  };

  const handleCreateGroup = async () => {
    // Validate inputs
    if (!groupName.trim()) {
      Alert.alert('Error', 'Please enter a group name');
      return;
    }

    if (!user || !user.uid) {
      Alert.alert('Error', 'You must be logged in to create a group');
      return;
    }

    try {
      // Parse emails if provided
      const emails = inviteEmails
        .split(',')
        .map(email => email.trim())
        .filter(email => email.length > 0);

      // Create group data
      const groupData = {
        name: groupName.trim(),
        description: groupDescription.trim(),
        userId: user.uid,
        imageUri: image,
        inviteEmails: emails.length > 0 ? emails : undefined,
      };

      // Dispatch create group action
      await dispatch(createGroup(groupData) as any);
      // Navigate back to groups list on success
      if (status !== 'failed') {
        navigation.goBack();
        Alert.alert('Success', `Group "${groupName}" has been created successfully.`);
      }
    } catch (err) {
      console.error('Error creating group:', err);
      Alert.alert('Error', 'Failed to create group. Please try again.');
    }
  };

  return (
    <SafeScreen style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Group Photo */}
          <TouchableOpacity style={styles.coverPhotoContainer} onPress={pickImage}>
            {image ? (
              <Image source={{ uri: image }} style={styles.coverPhoto} />
            ) : (
              <View style={styles.coverPhotoPlaceholder}>
                <Ionicons name="image-outline" size={40} color="#999" />
                <Text style={styles.coverPhotoText}>Add Group Cover Photo</Text>
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.formContainer}>
            <Text style={styles.sectionTitle}>Group Information</Text>

            {error && <Text style={styles.errorText}>{error}</Text>}

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Group Name*</Text>
              <TextInput
                style={styles.input}
                value={groupName}
                onChangeText={setGroupName}
                placeholder="Enter group name"
                maxLength={30}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={groupDescription}
                onChangeText={setGroupDescription}
                placeholder="Describe what this group is about"
                multiline
                numberOfLines={4}
                maxLength={200}
              />
              <Text style={styles.characterCount}>{groupDescription.length}/200</Text>
            </View>

            <Text style={styles.sectionTitle}>Invite Members</Text>
            <Text style={styles.sectionSubtitle}>
              Add email addresses of people you&apos;d like to invite (separated by commas)
            </Text>

            <View style={styles.inputGroup}>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={inviteEmails}
                onChangeText={setInviteEmails}
                placeholder="e.g. friend@example.com, family@example.com"
                multiline
                numberOfLines={3}
              />
              <Text style={styles.helperText}>
                You can also invite members after creating the group
              </Text>
            </View>

            <View style={styles.privacyInfo}>
              <Ionicons name="lock-closed" size={20} color="#4ECDC4" />
              <Text style={styles.privacyText}>
                All groups are private. Only invited members can see and join the group.
              </Text>
            </View>
          </View>
        </ScrollView>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
            disabled={loading}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.createButton,
              (!groupName.trim() || loading) && styles.createButtonDisabled,
            ]}
            onPress={handleCreateGroup}
            disabled={!groupName.trim() || loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.createButtonText}>Create Group</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeScreen>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    backgroundColor: '#fff',
    borderTopColor: '#f0f0f0',
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
  },
  cancelButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
  },
  characterCount: {
    color: '#999',
    fontSize: 12,
    marginTop: 5,
    textAlign: 'right',
  },
  container: {
    backgroundColor: '#fff',
    flex: 1,
  },
  coverPhoto: {
    borderRadius: 12,
    height: 150,
    width: '100%',
  },
  coverPhotoContainer: {
    marginBottom: 20,
    width: '100%',
  },
  coverPhotoPlaceholder: {
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderColor: '#ddd',
    borderRadius: 12,
    borderStyle: 'dashed',
    borderWidth: 1,
    height: 150,
    justifyContent: 'center',
    width: '100%',
  },
  coverPhotoText: {
    color: '#999',
    fontSize: 16,
    marginTop: 8,
  },
  createButton: {
    alignItems: 'center',
    backgroundColor: '#4ECDC4',
    borderRadius: 8,
    minWidth: 150,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  createButtonDisabled: {
    backgroundColor: '#ccc',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#FF6B6B',
    marginBottom: 15,
  },
  formContainer: {
    marginBottom: 20,
  },
  helperText: {
    color: '#666',
    fontSize: 12,
    marginTop: 5,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    color: '#333',
    fontSize: 16,
    padding: 15,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    color: '#333',
    fontSize: 16,
    marginBottom: 8,
  },
  keyboardAvoidingContainer: {
    flex: 1,
  },
  privacyInfo: {
    backgroundColor: '#f0f9f8',
    borderRadius: 8,
    flexDirection: 'row',
    marginTop: 10,
    padding: 15,
  },
  privacyText: {
    color: '#333',
    flex: 1,
    fontSize: 14,
    marginLeft: 10,
  },
  scrollContent: {
    padding: 20,
  },
  sectionSubtitle: {
    color: '#666',
    fontSize: 14,
    marginBottom: 15,
  },
  sectionTitle: {
    color: '#333',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
});

export default CreateGroupScreen;