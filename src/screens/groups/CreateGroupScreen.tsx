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
} from 'react-native';
import { SafeScreen } from '../../components/common';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation';

type CreateGroupScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const CreateGroupScreen: React.FC = () => {
  const navigation = useNavigation<CreateGroupScreenNavigationProp>();

  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [inviteEmails, setInviteEmails] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateGroup = async () => {
    // Validate inputs
    if (!groupName.trim()) {
      setError('Please enter a group name');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Simulate API call to create group
      setTimeout(() => {
        setLoading(false);

        // In a real app, we would create the group in Firebase and navigate to the new group
        Alert.alert('Group Created', `"${groupName}" has been created successfully.`, [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]);
      }, 1500);
    } catch (err) {
      setLoading(false);
      setError('Failed to create group. Please try again.');
      console.error('Create group error:', err);
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
              Add email addresses of people you'd like to invite (optional)
            </Text>

            <View style={styles.inputGroup}>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={inviteEmails}
                onChangeText={setInviteEmails}
                placeholder="Enter email addresses, separated by commas"
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
