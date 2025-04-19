import React, { useState, useEffect } from 'react';
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
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MainTabParamList, RootStackParamList } from '../../navigation';
import { useDispatch } from 'react-redux';
import { signOut } from '../../store/slices/authSlice';
import { useProfile } from '../../hooks/useProfile';

type ProfileScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Profile'>,
  StackNavigationProp<RootStackParamList>
>;

// Notification settings default values
const DEFAULT_NOTIFICATION_SETTINGS = {
  newVideos: true,
  comments: true,
  likes: true,
  groupInvites: true,
  dailyPrompts: true,
};

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  
  // Use our custom hook to get profile data and refresh it when screen comes into focus
  const { user, isLoading } = useProfile(true);
  
  // Initialize notification settings
  const [notificationSettings, setNotificationSettings] = useState(DEFAULT_NOTIFICATION_SETTINGS);

  // Format date for display
  const formatBirthday = (dateString: string | null) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };
  
  // Handle notification toggle
  const handleToggleNotification = (setting: keyof typeof DEFAULT_NOTIFICATION_SETTINGS) => {
    setNotificationSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
    // In a real app, this would update user settings in Firebase
    console.log(`Toggled ${setting} to ${!notificationSettings[setting]}`);
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
            
            // Dispatch the signOut action
            dispatch(signOut())
              .finally(() => {
                setLoading(false);
              });
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
      
      {isLoading || loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4ECDC4" />
        </View>
      ) : (
        <ScrollView>
          {/* Profile section */}
          <View style={styles.profileSection}>
            <View style={styles.profileHeader}>
              <View style={styles.avatarContainer}>
                {user?.photoURL ? (
                  <Image source={{ uri: user.photoURL }} style={styles.avatar} />
                ) : (
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {user?.displayName?.split(' ').map(n => n[0]).join('') || 'SJ'}
                    </Text>
                  </View>
                )}
              </View>
              
              <View style={styles.profileInfo}>
                <Text style={styles.userName}>{user?.displayName || 'User'}</Text>
                <Text style={styles.userEmail}>{user?.email}</Text>
                <Text style={styles.userTimezone}>
                  <Ionicons name="time-outline" size={14} color="#666" /> {user?.timezone || 'Unknown timezone'}
                </Text>
                {user?.birthday && (
                  <Text style={styles.userBirthday}>
                    <Ionicons name="calendar-outline" size={14} color="#666" /> {formatBirthday(user.birthday)}
                  </Text>
                )}
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
                value={notificationSettings.newVideos}
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
                value={notificationSettings.comments}
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
                value={notificationSettings.likes}
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
                value={notificationSettings.groupInvites}
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
                value={notificationSettings.dailyPrompts}
                onValueChange={() => handleToggleNotification('dailyPrompts')}
                trackColor={{ false: '#ddd', true: '#4ECDC4' }}
                thumbColor="#fff"
              />
            </View>
          </View>
          
          {/* Account section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>
            
            <TouchableOpacity 
              style={styles.accountOption}
              onPress={() => navigation.navigate('HelpSupport')}
            >
              <Ionicons name="help-circle-outline" size={24} color="#666" />
              <Text style={styles.accountOptionText}>Help & Support</Text>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.accountOption}
              onPress={() => navigation.navigate('PrivacyPolicy')}
            >
              <Ionicons name="document-text-outline" size={24} color="#666" />
              <Text style={styles.accountOptionText}>Privacy Policy</Text>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.accountOption}
              onPress={() => navigation.navigate('TermsOfService')}
            >
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
    marginBottom: 3,
  },
  userBirthday: {
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