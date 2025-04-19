import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Image,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation';

type GroupDetailScreenRouteProp = RouteProp<RootStackParamList, 'GroupDetail'>;
type GroupDetailScreenNavigationProp = StackNavigationProp<RootStackParamList>;

// Mock data types
interface GroupMember {
  id: string;
  name: string;
  avatarUrl: string;
  role: 'admin' | 'member';
}

interface VideoItem {
  id: string;
  thumbnailUrl: string;
  caption: string;
  creator: {
    id: string;
    name: string;
    avatarUrl: string;
  };
  createdAt: string;
  duration: number;
  views: number;
  likes: number;
  comments: number;
}

interface Group {
  id: string;
  name: string;
  description: string;
  coverPhotoUrl: string;
  members: GroupMember[];
  createdAt: string;
  lastActivity: string;
  videos: VideoItem[];
}

// Mock data
const mockGroups: Record<string, Group> = {
  group1: {
    id: 'group1',
    name: 'Family',
    description:
      'Stay connected with family members near and far. Share your daily moments and keep everyone updated on your life.',
    coverPhotoUrl: 'https://example.com/family.jpg',
    members: [
      {
        id: 'user1',
        name: 'Sarah Johnson',
        avatarUrl: 'https://example.com/avatar1.jpg',
        role: 'admin',
      },
      {
        id: 'user2',
        name: 'Michael Chen',
        avatarUrl: 'https://example.com/avatar2.jpg',
        role: 'member',
      },
      {
        id: 'user3',
        name: 'Emma Wilson',
        avatarUrl: 'https://example.com/avatar3.jpg',
        role: 'member',
      },
      {
        id: 'user4',
        name: 'David Kim',
        avatarUrl: 'https://example.com/avatar4.jpg',
        role: 'member',
      },
    ],
    createdAt: '2023-05-10T14:30:00Z',
    lastActivity: '2023-06-15T09:45:00Z',
    videos: [
      {
        id: 'video1',
        thumbnailUrl: 'https://example.com/thumbnail1.jpg',
        caption: 'Enjoying a beautiful sunset at the beach! #sunset #beach',
        creator: {
          id: 'user1',
          name: 'Sarah Johnson',
          avatarUrl: 'https://example.com/avatar1.jpg',
        },
        createdAt: '2023-06-15T14:30:00Z',
        duration: 45,
        views: 12,
        likes: 5,
        comments: 3,
      },
      {
        id: 'video2',
        thumbnailUrl: 'https://example.com/thumbnail2.jpg',
        caption: 'Making pasta from scratch for the first time!',
        creator: {
          id: 'user3',
          name: 'Emma Wilson',
          avatarUrl: 'https://example.com/avatar3.jpg',
        },
        createdAt: '2023-06-13T18:45:00Z',
        duration: 75,
        views: 18,
        likes: 7,
        comments: 5,
      },
    ],
  },
  group2: {
    id: 'group2',
    name: 'College Friends',
    description:
      'Keeping up with college buddies across the country. Share your adventures and life updates!',
    coverPhotoUrl: 'https://example.com/college.jpg',
    members: [
      {
        id: 'user2',
        name: 'Michael Chen',
        avatarUrl: 'https://example.com/avatar2.jpg',
        role: 'admin',
      },
      {
        id: 'user5',
        name: 'Jessica Taylor',
        avatarUrl: 'https://example.com/avatar5.jpg',
        role: 'member',
      },
      {
        id: 'user6',
        name: 'Ryan Garcia',
        avatarUrl: 'https://example.com/avatar6.jpg',
        role: 'member',
      },
    ],
    createdAt: '2023-04-22T11:15:00Z',
    lastActivity: '2023-06-14T18:20:00Z',
    videos: [
      {
        id: 'video3',
        thumbnailUrl: 'https://example.com/thumbnail3.jpg',
        caption: 'First day at my new job! So excited for this opportunity.',
        creator: {
          id: 'user2',
          name: 'Michael Chen',
          avatarUrl: 'https://example.com/avatar2.jpg',
        },
        createdAt: '2023-06-14T09:15:00Z',
        duration: 60,
        views: 24,
        likes: 10,
        comments: 8,
      },
    ],
  },
};

const GroupDetailScreen: React.FC = () => {
  const route = useRoute<GroupDetailScreenRouteProp>();
  const navigation = useNavigation<GroupDetailScreenNavigationProp>();
  const { groupId } = route.params;

  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch group data
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const fetchedGroup = mockGroups[groupId];
      if (fetchedGroup) {
        setGroup(fetchedGroup);
        setLoading(false);
      } else {
        setError('Group not found');
        setLoading(false);
      }
    }, 1000);
  }, [groupId]);

  const handleRecordVideo = () => {
    navigation.navigate('Recording');
  };

  const handleInviteMember = () => {
    // This would navigate to an invite screen in a real app
    console.log('Invite member to group:', groupId);
  };

  const renderVideoItem = ({ item }: { item: VideoItem }) => {
    return (
      <TouchableOpacity style={styles.videoCard}>
        {/* Video thumbnail */}
        <View style={styles.thumbnailContainer}>
          <View style={styles.thumbnail}>
            <Text style={styles.thumbnailText}>Video</Text>
          </View>
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
            <Text style={styles.creatorName}>{item.creator.name}</Text>
            <Text style={styles.videoDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
          </View>

          {/* Caption */}
          <Text style={styles.videoCaption}>{item.caption}</Text>

          {/* Engagement stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Ionicons name="eye-outline" size={16} color="#666" />
              <Text style={styles.statText}>{item.views}</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="heart-outline" size={16} color="#666" />
              <Text style={styles.statText}>{item.likes}</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="chatbubble-outline" size={16} color="#666" />
              <Text style={styles.statText}>{item.comments}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4ECDC4" />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !group) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={60} color="#FF6B6B" />
          <Text style={styles.errorText}>{error || 'An error occurred'}</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <ScrollView>
        {/* Group header */}
        <View style={styles.groupHeader}>
          <View style={styles.coverPhoto}>
            <Text style={styles.coverPhotoText}>{group.name}</Text>
          </View>

          <View style={styles.groupInfo}>
            <Text style={styles.groupName}>{group.name}</Text>
            <Text style={styles.groupDescription}>{group.description}</Text>

            <View style={styles.groupActions}>
              <TouchableOpacity style={styles.actionButton} onPress={handleRecordVideo}>
                <Ionicons name="videocam" size={20} color="#4ECDC4" />
                <Text style={styles.actionButtonText}>Record</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton} onPress={handleInviteMember}>
                <Ionicons name="person-add" size={20} color="#4ECDC4" />
                <Text style={styles.actionButtonText}>Invite</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Members section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Members ({group.members.length})</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.membersScrollContent}
          >
            {group.members.map(member => (
              <View key={member.id} style={styles.memberItem}>
                <View style={styles.memberAvatar} />
                <Text style={styles.memberName}>{member.name}</Text>
                {member.role === 'admin' && (
                  <View style={styles.adminBadge}>
                    <Text style={styles.adminBadgeText}>Admin</Text>
                  </View>
                )}
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Videos section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Videos ({group.videos.length})</Text>

          {group.videos.length > 0 ? (
            <FlatList
              data={group.videos}
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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
    color: '#4ECDC4',
    fontWeight: 'bold',
    marginLeft: 5,
  },
  adminBadge: {
    backgroundColor: '#4ECDC4',
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
    backgroundColor: '#4ECDC4',
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
    backgroundColor: '#4ECDC4',
    height: 150,
    justifyContent: 'center',
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
  memberAvatar: {
    backgroundColor: '#ddd',
    borderRadius: 30,
    height: 60,
    marginBottom: 8,
    width: 60,
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
  recordVideoButton: {
    backgroundColor: '#4ECDC4',
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
