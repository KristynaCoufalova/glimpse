import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ScrollView,
  Switch,
  Alert,
  ActivityIndicator,
  Image
} from 'react-native';
import { SafeScreen } from '../../components/common';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MainTabParamList, RootStackParamList } from '../../navigation';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';

type ProfileScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Profile'>,
  StackNavigationProp<RootStackParamList>
>;

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const dispatch = useDispatch();
  
  // Get user from Redux store
  const { user } = useSelector((state: RootState) => state.user);
  const [loading, setLoading] = useState(false);
  
  // Use mock data if user is not available
  const userData = user || {
    id: 'user1',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@example.com',
    photoUrl: null,
    timezone: 'America/New_York',
    displayName: 'Sarah Johnson',
    notificationSettings: {
      newVideos: true,
      comments: true,
      likes: true,
      groupInvites: true,
      dailyPrompts: true,
    }
  };
  
  // Handle notification toggle
  const handleToggleNotification = (setting: keyof typeof userData.notificationSettings) => {
    // In a real app, this would update user settings in Firebase
    console.log(`Toggled ${setting} to ${!userData.notificationSettings[setting]}`);
  };
  
  // Handle logout
  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
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
          }
        }
      ]
    );
  };
  
  // Handle edit profile
  const handleEditProfile = () => {
    navigation.navigate('EditProfile');
  };
  
  return (
    <SafeScreen style={styles.container}>
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
                {userData.photoURL ? (
                  <Image source={{ uri: userData.photoURL }} style={styles.avatar} />
                ) : (
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {userData.displayName?.split(' ').map(n => n[0]).join('') || 'SJ'}
                    </Text>
                  </View>
                )}
              </View>
              
              <View style={styles.profileInfo}>
                <Text style={styles.userName}>{userData.displayName || 'User'}</Text>
                <Text style={styles.userEmail}>{userData.email}</Text>
                <Text style={styles.userTimezone}>
                  <Ionicons name="time-outline" size={14} color="#666" /> {userData.timezone}
                </Text>
              </View>
            </View>
            
            <TouchableOpacity 
              style={styles.editProfileButton}
              onPress={handleEditProfile}
            >
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
                value={userData.notificationSettings.newVideos}
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
                value={userData.notificationSettings.comments}
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
                value={userData.notificationSettings.likes}
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
                value={userData.notificationSettings.groupInvites}
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
                value={userData.notificationSettings.dailyPrompts}
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
    </SafeScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4ECDC4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  userTimezone: {
    fontSize: 14,
    color: '#666',
  },
  editProfileButton: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  editProfileButtonText: {
    color: '#333',
    fontWeight: 'bold',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  settingInfo: {
    flex: 1,
    marginRight: 10,
  },
  settingTitle: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
  },
  accountOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  accountOptionText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 15,
  },
  logoutOption: {
    borderBottomWidth: 0,
  },
  logoutText: {
    flex: 1,
    fontSize: 16,
    color: '#FF6B6B',
    marginLeft: 15,
    fontWeight: 'bold',
  },
  versionInfo: {
    padding: 20,
    alignItems: 'center',
  },
  versionText: {
    fontSize: 14,
    color: '#999',
  },
});

export default ProfileScreen;