import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
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
        Alert.alert(
          'Group Created',
          `"${groupName}" has been created successfully.`,
          [
            { 
              text: 'OK', 
              onPress: () => navigation.goBack() 
            }
          ]
        );
      }, 1500);
    } catch (err) {
      setLoading(false);
      setError('Failed to create group. Please try again.');
      console.error('Create group error:', err);
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
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
              <Text style={styles.characterCount}>
                {groupDescription.length}/200
              </Text>
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
              (!groupName.trim() || loading) && styles.createButtonDisabled
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
  formContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 5,
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  privacyInfo: {
    flexDirection: 'row',
    backgroundColor: '#f0f9f8',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  privacyText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 10,
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
  },
  createButton: {
    backgroundColor: '#4ECDC4',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 150,
    alignItems: 'center',
  },
  createButtonDisabled: {
    backgroundColor: '#ccc',
  },
  createButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  errorText: {
    color: '#FF6B6B',
    marginBottom: 15,
  },
});

export default CreateGroupScreen;