import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { SafeScreen } from '../../components/common';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { fetchGroupById, inviteMember, deleteGroup } from '../../store/slices/groupsSlice';
import { fetchVideosForGroup } from '../../store/slices/videosSlice';
import { isValidEmail } from '../../utils';
import { COLORS } from '../../constants';
import { collection, getDocs, query } from 'firebase/firestore';
import { firestore } from '../../services/firebase/config';
import { User } from '../../store/slices/userSlice';

type GroupDetailScreenRouteProp = RouteProp<RootStackParamList, 'GroupDetail'>;
type GroupDetailScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const GroupDetailScreen: React.FC = () => {
  const route = useRoute<GroupDetailScreenRouteProp>();
  const navigation = useNavigation<GroupDetailScreenNavigationProp>();
  const dispatch = useDispatch();
  const { groupId } = route.params;

  // Get group and videos from Redux
  const { currentGroup: group, status: groupStatus } = useSelector((state: RootState) => state.groups);
  const { videos, status: videosStatus } = useSelector((state: RootState) => state.videos);
  const { user } = useSelector((state: RootState) => state.auth);

  // Local state
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteModalVisible, setInviteModalVisible] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [groupMembers, setGroupMembers] = useState<any[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [userProfiles, setUserProfiles] = useState<{[key: string]: User}>({});

  const loading = groupStatus === 'loading' || videosStatus === 'loading';

  // Fetch group and videos when component mounts
  useEffect(() => {
    if (groupId && user) {
      dispatch(fetchGroupById(groupId) as any);
      dispatch(fetchVideosForGroup({ groupId }) as any);
    }
  }, [dispatch, groupId, user]);

  // Get merged member data from Redux store when group changes
  useEffect(() => {
    const getMemberDataFromGroup = async () => {
      if (!group || !group.members) return;
      
      setMembersLoading(true);
      try {
        // Convert the members object from group to array for rendering
        const membersArray = Object.entries(group.members).map(([id, memberData]) => ({
          id,
          ...memberData
        }));
        
        setGroupMembers(membersArray);
        
        // Fetch user profiles for each member
        const userIds = membersArray.map(member => member.id);
        await fetchUserProfiles(userIds);
      } catch (error) {
        console.error('Error processing group members:', error);
      } finally {
        setMembersLoading(false);
      }
    };
    
    if (group) {
      getMemberDataFromGroup();
    }
  }, [group]);

  // Fetch user profiles for members
  const fetchUserProfiles = async (userIds: string[]) => {
    try {
      const profiles: {[key: string]: User} = {};
      
      for (const userId of userIds) {
        const userRef = collection(firestore, 'users');
        const userQuery = query(userRef);
        const userSnapshot = await getDocs(userQuery);
        
        userSnapshot.forEach(doc => {
          if (doc.id === userId) {
            profiles[userId] = {
              uid: doc.id,
              ...doc.data()
            } as User;
          }
        });
      }
      
      setUserProfiles(profiles);
    } catch (error) {
      console.error('Error fetching user profiles:', error);
    }
  };

  const handleRecordVideo = () => {
    // Pass the current group ID to the recording screen
    navigation.navigate('Recording', { groupId });
  };

  const handleInviteMember = () => {
    setInviteModalVisible(true);
  };

  const handleSendInvite = async () => {
    // Validate email
    if (!inviteEmail.trim()) {
      setInviteError('Please enter an email address');
      return;
    }

    if (!isValidEmail(inviteEmail.trim())) {
      setInviteError('Please enter a valid email address');
      return;
    }

    if (!user) {
      setInviteError('You must be logged in to invite members');
      return;
    }

    setInviteLoading(true);
    setInviteError(null);

    try {
      await dispatch(
        inviteMember({ 
          groupId, 
          email: inviteEmail.trim(),
          userId: user.uid
        }) as any
      );
      
      setInviteModalVisible(false);
      setInviteEmail('');
      Alert.alert('Success', 'Invitation sent successfully');
    } catch (error) {
      if (error instanceof Error) {
        setInviteError(error.message);
      } else {
        setInviteError('Failed to send invitation');
      }
    } finally {
      setInviteLoading(false);
    }
  };

  // Format date
  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Recently';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString();
  };

  // Check if current user is admin (using merged data from Redux)
  const isCurrentUserAdmin = () => {
    if (!user || !group || !group.members) return false;
    
    // The group.members in Redux already contains merged data from both sources
    return !!(group.members[user.uid] && group.members[user.uid].role === 'admin');
  };

  // Handle edit group navigation
  const handleEditGroup = () => {
    if (!group) return;
    navigation.navigate('CreateGroup', { groupId: group.id });
  };

  // Handle delete group with confirmation
  const handleDeleteGroup = () => {
    Alert.alert(
      'Delete Group',
      'Are you sure you want to delete this group? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (!user || !groupId) return;
            
            try {
              // Show loading indicator
              setMembersLoading(true);
              
              // Call the deleteGroup thunk
              const resultAction = await dispatch(deleteGroup({ 
                groupId, 
                userId: user.uid 
              }) as any);
              
              if (deleteGroup.fulfilled.match(resultAction)) {
                // Success - navigate back to groups screen
                Alert.alert('Success', 'Group deleted successfully');
                navigation.navigate('Main');
              } else if (deleteGroup.rejected.match(resultAction)) {
                // Error handling
                Alert.alert('Error', resultAction.payload as string || 'Failed to delete group');
              }
            } catch (error) {
              console.error('Error deleting group:', error);
              Alert.alert('Error', 'An unexpected error occurred while deleting the group');
            } finally {
              setMembersLoading(false);
            }
          },
        },
      ]
    );
  };

  const renderVideoItem = ({ item }: { item: any }) => {
    return (
      <TouchableOpacity 
        style={styles.videoCard}
        onPress={() => {
          // In a real app, this would navigate to the video player
          console.log('Navigate to video player for video ID:', item.id);
        }}
      >
        {/* Video thumbnail */}
        <View style={styles.thumbnailContainer}>
          {item.thumbnailURL ? (
            <Image source={{ uri: item.thumbnailURL }} style={styles.thumbnail} />
          ) : (
            <View style={styles.thumbnail}>
              <Text style={styles.thumbnailText}>Video</Text>
            </View>
          )}
          <View style={styles.durationBadge}>
            <Text style={styles.durationText}>
              {Math.floor(item.duration / 60)}:{(item.duration % 60).toString().padStart(2, '0')}
            </Text>
          </View>
        </View>

        <View style={styles.videoInfo}>
          {/* Creator info */}
          <View style={styles.creatorContainer}>
            <View style={styles.creatorAvatar} />
            <Text style={styles.creatorName}>
              {/* In a real app, you would fetch the creator's name from Firestore */}
              {item.creator === user?.uid ? 'You' : 'Group Member'}
            </Text>
            <Text style={styles.videoDate}>{formatDate(item.createdAt)}</Text>
          </View>

          {/* Caption */}
          <Text style={styles.videoCaption}>{item.caption}</Text>

          {/* Engagement stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Ionicons name="eye-outline" size={16} color="#666" />
              <Text style={styles.statText}>
                {item.viewers ? Object.keys(item.viewers).length : 0}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="heart-outline" size={16} color="#666" />
              <Text style={styles.statText}>{item.reactions?.likes || 0}</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="chatbubble-outline" size={16} color="#666" />
              <Text style={styles.statText}>{item.reactions?.comments || 0}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Function to render members
  const renderMembers = () => {
    if (membersLoading) {
      return (
        <View style={styles.loadingMembersContainer}>
          <ActivityIndicator size="small" color={COLORS.primary} />
          <Text style={styles.loadingMembersText}>Loading members...</Text>
        </View>
      );
    }
    
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.membersScrollContent}
      >
        {groupMembers.map((member: any) => {
          const memberProfile = userProfiles[member.id];
          const displayName = memberProfile?.displayName || 'Member';
          const photoURL = memberProfile?.photoURL;
          const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase();
          
          return (
            <View key={member.id} style={styles.memberItem}>
              {photoURL ? (
                <Image source={{ uri: photoURL }} style={styles.memberAvatar} />
              ) : (
                <View style={styles.memberAvatarPlaceholder}>
                  <Text style={styles.memberAvatarInitials}>{initials}</Text>
                </View>
              )}
              <Text style={styles.memberName}>
                {member.id === user?.uid ? 'You' : displayName}
              </Text>
              {member.role === 'admin' && (
                <View style={styles.adminBadge}>
                  <Text style={styles.adminBadgeText}>Admin</Text>
                </View>
              )}
            </View>
          );
        })}
        
        {isCurrentUserAdmin() && (
          <TouchableOpacity 
            style={styles.addMemberItem} 
            onPress={handleInviteMember}
          >
            <View style={styles.addMemberIcon}>
              <Ionicons name="person-add" size={24} color={COLORS.primary} />
            </View>
            <Text style={styles.addMemberText}>Invite</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    );
  };

  if (loading) {
    return (
      <SafeScreen style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeScreen>
    );
  }

  if (!group) {
    return (
      <SafeScreen style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={60} color={COLORS.secondary} />
          <Text style={styles.errorText}>Group not found</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeScreen>
    );
  }

  return (
    <SafeScreen style={styles.container}>
      <ScrollView>
        {/* Group header */}
        <View style={styles.groupHeader}>
          <View style={styles.coverPhoto}>
            {group.photoURL ? (
              <Image source={{ uri: group.photoURL }} style={styles.coverPhotoImage} />
            ) : (
              <Text style={styles.coverPhotoText}>{group.name}</Text>
            )}
          </View>

        <View style={styles.groupInfo}>
          <Text style={styles.groupName}>{group.name}</Text>
          <Text style={styles.groupDescription}>{group.description || 'No description'}</Text>

          <View style={styles.groupActions}>
            <TouchableOpacity style={styles.actionButton} onPress={handleRecordVideo}>
              <Ionicons name="videocam" size={20} color={COLORS.primary} />
              <Text style={styles.actionButtonText}>Record</Text>
            </TouchableOpacity>

            {isCurrentUserAdmin() && (
              <>
                <TouchableOpacity style={styles.actionButton} onPress={handleInviteMember}>
                  <Ionicons name="person-add" size={20} color={COLORS.primary} />
                  <Text style={styles.actionButtonText}>Invite</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.actionButton} onPress={handleEditGroup}>
                  <Ionicons name="create-outline" size={20} color={COLORS.primary} />
                  <Text style={styles.actionButtonText}>Edit</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
        </View>

        {/* Members section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>
            Members ({group.members ? Object.keys(group.members).length : 0})
          </Text>
          {renderMembers()}
        </View>
        
        {/* Admin Controls */}
        {isCurrentUserAdmin() && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Admin Controls</Text>
            <View style={styles.adminControlsContainer}>
              <Text style={styles.adminControlsDescription}>
                As an admin, you can manage this group's settings and members.
              </Text>
              
              <View style={styles.adminButtonsRow}>
                <TouchableOpacity
                  style={styles.adminButton}
                  onPress={handleEditGroup}
                >
                  <Ionicons name="create-outline" size={20} color={COLORS.primary} />
                  <Text style={styles.adminButtonText}>Edit Group</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.adminButton, styles.dangerButton]}
                  onPress={handleDeleteGroup}
                >
                  <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
                  <Text style={[styles.adminButtonText, styles.dangerButtonText]}>Delete Group</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Videos section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Videos ({videos.length})</Text>

          {videos.length > 0 ? (
            <FlatList
              data={videos}
              renderItem={renderVideoItem}
              keyExtractor={item => item.id}
              scrollEnabled={false}
            />
          ) : (
            <View style={styles.emptyVideosContainer}>
              <Ionicons name="videocam-outline" size={50} color="#ccc" />
              <Text style={styles.emptyVideosText}>No videos yet</Text>
              <Text style={styles.emptyVideosSubtext}>
                Be the first to share a video with this group
              </Text>
              <TouchableOpacity style={styles.recordVideoButton} onPress={handleRecordVideo}>
                <Text style={styles.recordVideoButtonText}>Record Video</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Invite modal */}
      <Modal
        visible={inviteModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setInviteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Invite Member</Text>
              <TouchableOpacity onPress={() => setInviteModalVisible(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.modalText}>
              Enter the email address of the person you want to invite to join this group.
            </Text>
            
            {inviteError && <Text style={styles.modalError}>{inviteError}</Text>}
            
            <TextInput
              style={styles.modalInput}
              value={inviteEmail}
              onChangeText={setInviteEmail}
              placeholder="Email address"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            
            <TouchableOpacity 
              style={styles.modalButton}
              onPress={handleSendInvite}
              disabled={inviteLoading}
            >
              {inviteLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.modalButtonText}>Send Invite</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeScreen>
  );
};

const styles = StyleSheet.create({
  adminButton: {
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    flexDirection: 'row',
    marginRight: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    width: '48%',
  },
  adminButtonText: {
    color: COLORS.primary,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  adminButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  adminControlsContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginTop: 10,
    padding: 15,
  },
  adminControlsDescription: {
    color: '#666',
    fontSize: 14,
    lineHeight: 20,
  },
  dangerButton: {
    backgroundColor: '#FFF0F0',
  },
  dangerButtonText: {
    color: '#FF6B6B',
  },
  actionButton: {
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    flexDirection: 'row',
    marginRight: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  actionButtonText: {
    color: COLORS.primary,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  addMemberIcon: {
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 30,
    height: 60,
    justifyContent: 'center',
    marginBottom: 8,
    width: 60,
  },
  addMemberItem: {
    alignItems: 'center',
    marginRight: 20,
    width: 70,
  },
  addMemberText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  adminBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    marginTop: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  adminBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  backButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  container: {
    backgroundColor: '#fff',
    flex: 1,
  },
  coverPhoto: {
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    height: 150,
    justifyContent: 'center',
    width: '100%',
  },
  coverPhotoImage: {
    height: '100%',
    width: '100%',
  },
  coverPhotoText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  creatorAvatar: {
    backgroundColor: '#ddd',
    borderRadius: 15,
    height: 30,
    marginRight: 10,
    width: 30,
  },
  creatorContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 10,
  },
  creatorName: {
    color: '#333',
    flex: 1,
    fontSize: 14,
    fontWeight: 'bold',
  },
  durationBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 4,
    bottom: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    position: 'absolute',
    right: 10,
  },
  durationText: {
    color: '#fff',
    fontSize: 12,
  },
  emptyVideosContainer: {
    alignItems: 'center',
    padding: 30,
  },
  emptyVideosSubtext: {
    color: '#666',
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
  },
  emptyVideosText: {
    color: '#333',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    marginTop: 15,
  },
  errorContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {
    color: '#333',
    fontSize: 18,
    marginBottom: 20,
    marginTop: 20,
    textAlign: 'center',
  },
  groupActions: {
    flexDirection: 'row',
  },
  groupDescription: {
    color: '#666',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  groupHeader: {
    marginBottom: 20,
  },
  groupInfo: {
    padding: 20,
  },
  groupName: {
    color: '#333',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  loadingMembersContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 20,
  },
  loadingMembersText: {
    color: '#666',
    fontSize: 14,
    marginLeft: 10,
  },
  memberAvatar: {
    backgroundColor: '#ddd',
    borderRadius: 30,
    height: 60,
    marginBottom: 8,
    width: 60,
  },
  memberAvatarPlaceholder: {
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 30,
    height: 60,
    justifyContent: 'center',
    marginBottom: 8,
    width: 60,
  },
  memberAvatarInitials: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  memberItem: {
    alignItems: 'center',
    marginRight: 20,
    width: 70,
  },
  memberName: {
    color: '#333',
    fontSize: 12,
    textAlign: 'center',
  },
  membersScrollContent: {
    paddingBottom: 10,
  },
  modalButton: {
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    marginTop: 15,
    paddingHorizontal: 20,
    paddingVertical: 12,
    width: '100%',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    maxWidth: 400,
    padding: 20,
    width: '90%',
  },
  modalError: {
    color: COLORS.secondary,
    fontSize: 14,
    marginBottom: 15,
  },
  modalHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  modalInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    fontSize: 16,
    marginVertical: 10,
    padding: 15,
    width: '100%',
  },
  modalOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  modalText: {
    color: '#666',
    fontSize: 14,
    marginBottom: 10,
  },
  modalTitle: {
    color: '#333',
    fontSize: 18,
    fontWeight: 'bold',
  },
  recordVideoButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  recordVideoButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionContainer: {
    borderTopColor: '#f0f0f0',
    borderTopWidth: 1,
    padding: 20,
  },
  sectionTitle: {
    color: '#333',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  statItem: {
    alignItems: 'center',
    flexDirection: 'row',
    marginRight: 15,
  },
  statText: {
    color: '#666',
    fontSize: 12,
    marginLeft: 5,
  },
  statsContainer: {
    flexDirection: 'row',
  },
  thumbnail: {
    alignItems: 'center',
    backgroundColor: '#eee',
    height: 180,
    justifyContent: 'center',
  },
  thumbnailContainer: {
    position: 'relative',
  },
  thumbnailText: {
    color: '#999',
    fontSize: 18,
    fontWeight: 'bold',
  },
  videoCaption: {
    color: '#333',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 10,
  },
  videoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 2,
    marginBottom: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  videoDate: {
    color: '#999',
    fontSize: 12,
  },
  videoInfo: {
    padding: 15,
  },
});

export default GroupDetailScreen;