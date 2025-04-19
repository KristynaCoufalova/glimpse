import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../../navigation';

type ProfileScreenNavigationProp = BottomTabNavigationProp<MainTabParamList, 'Profile'>;

interface ProfileScreenProps {
  navigation: ProfileScreenNavigationProp;
}

// Mock user data
const mockUser = {
  id: 'user1',
  name: 'Sarah Johnson',
  email: 'sarah.johnson@example.com',
  photoUrl: null,
  timezone: 'America/New_York',
  createdAt: '2023-05-01T10:00:00Z',
  notificationSettings: {
    newVideos: true,
    comments: true,
    likes: true,
    groupInvites: true,
    dailyPrompts: true,
  },
};

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const [user, setUser] = useState(mockUser);
  const [loading, setLoading] = useState(false);

  // Handle notification toggle
  const handleToggleNotification = (setting: keyof typeof user.notificationSettings) => {
    setUser(prevUser => ({
      ...prevUser,
      notificationSettings: {
        ...prevUser.notificationSettings,
        [setting]: !prevUser.notificationSettings[setting],
      },
    }));

    // In a real app, this would update the user's settings in Firebase
    console.log(`Toggled ${setting} to ${!user.notificationSettings[setting]}`);
  };

  // Handle logout
  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => {
          setLoading(true);

          // Simulate logout process
          setTimeout(() => {
            setLoading(false);
            // In a real app, this would clear the auth state and navigate to the login screen
            console.log('User logged out');
          }, 1000);
        },
      },
    ]);
  };

  // Handle edit profile
  const handleEditProfile = () => {
    // In a real app, this would navigate to an edit profile screen
    console.log('Navigate to edit profile');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4ECDC4" />
        </View>
      ) : (
        <ScrollView>
          {/* Profile section */}
          <View style={styles.profileSection}>
            <View style={styles.profileHeader}>
              <View style={styles.avatarContainer}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {user.name
                      .split(' ')
                      .map(n => n[0])
                      .join('')}
                  </Text>
                </View>
                <TouchableOpacity style={styles.editAvatarButton}>
                  <Ionicons name="camera" size={18} color="#fff" />
                </TouchableOpacity>
              </View>

              <View style={styles.profileInfo}>
                <Text style={styles.userName}>{user.name}</Text>
                <Text style={styles.userEmail}>{user.email}</Text>
                <Text style={styles.userTimezone}>
                  <Ionicons name="time-outline" size={14} color="#666" /> {user.timezone}
                </Text>
              </View>
            </View>

            <TouchableOpacity style={styles.editProfileButton} onPress={handleEditProfile}>
              <Text style={styles.editProfileButtonText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>

          {/* Notification settings section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notification Settings</Text>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>New Videos</Text>
                <Text style={styles.settingDescription}>
                  Get notified when someone posts a new video
                </Text>
              </View>
              <Switch
                value={user.notificationSettings.newVideos}
                onValueChange={() => handleToggleNotification('newVideos')}
                trackColor={{ false: '#ddd', true: '#4ECDC4' }}
                thumbColor="#fff"
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Comments</Text>
                <Text style={styles.settingDescription}>
                  Get notified when someone comments on your video
                </Text>
              </View>
              <Switch
                value={user.notificationSettings.comments}
                onValueChange={() => handleToggleNotification('comments')}
                trackColor={{ false: '#ddd', true: '#4ECDC4' }}
                thumbColor="#fff"
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Likes</Text>
                <Text style={styles.settingDescription}>
                  Get notified when someone likes your video
                </Text>
              </View>
              <Switch
                value={user.notificationSettings.likes}
                onValueChange={() => handleToggleNotification('likes')}
                trackColor={{ false: '#ddd', true: '#4ECDC4' }}
                thumbColor="#fff"
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Group Invites</Text>
                <Text style={styles.settingDescription}>
                  Get notified when you're invited to a group
                </Text>
              </View>
              <Switch
                value={user.notificationSettings.groupInvites}
                onValueChange={() => handleToggleNotification('groupInvites')}
                trackColor={{ false: '#ddd', true: '#4ECDC4' }}
                thumbColor="#fff"
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Daily Prompts</Text>
                <Text style={styles.settingDescription}>
                  Receive daily prompts to inspire your videos
                </Text>
              </View>
              <Switch
                value={user.notificationSettings.dailyPrompts}
                onValueChange={() => handleToggleNotification('dailyPrompts')}
                trackColor={{ false: '#ddd', true: '#4ECDC4' }}
                thumbColor="#fff"
              />
            </View>
          </View>

          {/* Account section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>

            <TouchableOpacity style={styles.accountOption}>
              <Ionicons name="help-circle-outline" size={24} color="#666" />
              <Text style={styles.accountOptionText}>Help & Support</Text>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.accountOption}>
              <Ionicons name="document-text-outline" size={24} color="#666" />
              <Text style={styles.accountOptionText}>Privacy Policy</Text>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.accountOption}>
              <Ionicons name="information-circle-outline" size={24} color="#666" />
              <Text style={styles.accountOptionText}>Terms of Service</Text>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.accountOption, styles.logoutOption]}
              onPress={handleLogout}
            >
              <Ionicons name="log-out-outline" size={24} color="#FF6B6B" />
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.versionInfo}>
            <Text style={styles.versionText}>Glimpse v1.0.0</Text>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  accountOption: {
    alignItems: 'center',
    borderBottomColor: '#f0f0f0',
    borderBottomWidth: 1,
    flexDirection: 'row',
    paddingVertical: 15,
  },
  accountOptionText: {
    color: '#333',
    flex: 1,
    fontSize: 16,
    marginLeft: 15,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: '#4ECDC4',
    borderRadius: 40,
    height: 80,
    justifyContent: 'center',
    width: 80,
  },
  avatarContainer: {
    marginRight: 20,
    position: 'relative',
  },
  avatarText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  container: {
    backgroundColor: '#fff',
    flex: 1,
  },
  editAvatarButton: {
    alignItems: 'center',
    backgroundColor: '#FF6B6B',
    borderColor: '#fff',
    borderRadius: 15,
    borderWidth: 2,
    bottom: 0,
    height: 30,
    justifyContent: 'center',
    position: 'absolute',
    right: 0,
    width: 30,
  },
  editProfileButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  editProfileButtonText: {
    color: '#333',
    fontWeight: 'bold',
  },
  header: {
    alignItems: 'center',
    borderBottomColor: '#f0f0f0',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 15,
  },
  headerTitle: {
    color: '#333',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  logoutOption: {
    borderBottomWidth: 0,
  },
  logoutText: {
    color: '#FF6B6B',
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 15,
  },
  profileHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 20,
  },
  profileInfo: {
    flex: 1,
  },
  profileSection: {
    borderBottomColor: '#f0f0f0',
    borderBottomWidth: 1,
    padding: 20,
  },
  section: {
    borderBottomColor: '#f0f0f0',
    borderBottomWidth: 1,
    padding: 20,
  },
  sectionTitle: {
    color: '#333',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  settingDescription: {
    color: '#666',
    fontSize: 14,
  },
  settingInfo: {
    flex: 1,
    marginRight: 10,
  },
  settingItem: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  settingTitle: {
    color: '#333',
    fontSize: 16,
    marginBottom: 5,
  },
  userEmail: {
    color: '#666',
    fontSize: 14,
    marginBottom: 5,
  },
  userName: {
    color: '#333',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  userTimezone: {
    color: '#666',
    fontSize: 14,
  },
  versionInfo: {
    alignItems: 'center',
    padding: 20,
  },
  versionText: {
    color: '#999',
    fontSize: 14,
  },
});

export default ProfileScreen;
