import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeScreen } from '../../components/common';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MainTabParamList, RootStackParamList } from '../../navigation';

type GroupsScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Groups'>,
  StackNavigationProp<RootStackParamList>
>;

// Mock data for groups
interface GroupMember {
  id: string;
  name: string;
  avatarUrl: string;
}

interface Group {
  id: string;
  name: string;
  description: string;
  coverPhotoUrl: string;
  members: GroupMember[];
  createdAt: string;
  lastActivity: string;
}

// Mock data
const mockGroups: Group[] = [
  {
    id: 'group1',
    name: 'Family',
    description: 'Stay connected with family members',
    coverPhotoUrl: 'https://example.com/family.jpg',
    members: [
      { id: 'user1', name: 'Sarah Johnson', avatarUrl: 'https://example.com/avatar1.jpg' },
      { id: 'user2', name: 'Michael Chen', avatarUrl: 'https://example.com/avatar2.jpg' },
      { id: 'user3', name: 'Emma Wilson', avatarUrl: 'https://example.com/avatar3.jpg' },
      { id: 'user4', name: 'David Kim', avatarUrl: 'https://example.com/avatar4.jpg' },
    ],
    createdAt: '2023-05-10T14:30:00Z',
    lastActivity: '2023-06-15T09:45:00Z',
  },
  {
    id: 'group2',
    name: 'College Friends',
    description: 'Keeping up with college buddies',
    coverPhotoUrl: 'https://example.com/college.jpg',
    members: [
      { id: 'user2', name: 'Michael Chen', avatarUrl: 'https://example.com/avatar2.jpg' },
      { id: 'user5', name: 'Jessica Taylor', avatarUrl: 'https://example.com/avatar5.jpg' },
      { id: 'user6', name: 'Ryan Garcia', avatarUrl: 'https://example.com/avatar6.jpg' },
    ],
    createdAt: '2023-04-22T11:15:00Z',
    lastActivity: '2023-06-14T18:20:00Z',
  },
  {
    id: 'group3',
    name: 'Work Team',
    description: 'Casual updates from the work team',
    coverPhotoUrl: 'https://example.com/work.jpg',
    members: [
      { id: 'user1', name: 'Sarah Johnson', avatarUrl: 'https://example.com/avatar1.jpg' },
      { id: 'user7', name: 'Alex Brown', avatarUrl: 'https://example.com/avatar7.jpg' },
      { id: 'user8', name: 'Olivia Martinez', avatarUrl: 'https://example.com/avatar8.jpg' },
      { id: 'user9', name: 'James Wilson', avatarUrl: 'https://example.com/avatar9.jpg' },
      { id: 'user10', name: 'Sophia Lee', avatarUrl: 'https://example.com/avatar10.jpg' },
    ],
    createdAt: '2023-03-15T09:00:00Z',
    lastActivity: '2023-06-13T14:10:00Z',
  },
];

const GroupsScreen: React.FC = () => {
  const navigation = useNavigation<GroupsScreenNavigationProp>();
  const [groups, setGroups] = useState<Group[]>(mockGroups);
  const [loading, setLoading] = useState(false);

  const handleGroupPress = (groupId: string) => {
    navigation.navigate('GroupDetail', { groupId });
  };

  const handleCreateGroup = () => {
    navigation.navigate('CreateGroup');
  };

  const renderGroupItem = ({ item }: { item: Group }) => {
    return (
      <TouchableOpacity style={styles.groupCard} onPress={() => handleGroupPress(item.id)}>
        {/* Group cover photo (placeholder) */}
        <View style={styles.coverPhoto}>
          <Text style={styles.coverPhotoText}>{item.name}</Text>
        </View>

        <View style={styles.groupInfo}>
          <Text style={styles.groupName}>{item.name}</Text>
          <Text style={styles.groupDescription}>{item.description}</Text>

          {/* Member avatars */}
          <View style={styles.membersContainer}>
            <Text style={styles.membersTitle}>Members</Text>
            <View style={styles.avatarRow}>
              {item.members.slice(0, 4).map((member, index) => (
                <View
                  key={member.id}
                  style={[
                    styles.memberAvatar,
                    { zIndex: 5 - index, marginLeft: index > 0 ? -10 : 0 },
                  ]}
                />
              ))}

              {item.members.length > 4 && (
                <View style={[styles.memberAvatar, styles.memberAvatarMore]}>
                  <Text style={styles.memberAvatarMoreText}>+{item.members.length - 4}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Last activity */}
          <View style={styles.activityContainer}>
            <Ionicons name="time-outline" size={16} color="#666" />
            <Text style={styles.activityText}>
              Last activity: {new Date(item.lastActivity).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeScreen style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Groups</Text>
        <TouchableOpacity style={styles.createButton} onPress={handleCreateGroup}>
          <Ionicons name="add" size={24} color="#fff" />
          <Text style={styles.createButtonText}>Create</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4ECDC4" />
        </View>
      ) : (
        <FlatList
          data={groups}
          renderItem={renderGroupItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.groupsList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="people" size={60} color="#ccc" />
              <Text style={styles.emptyTitle}>No Groups Yet</Text>
              <Text style={styles.emptyDescription}>
                Create a group to start sharing moments with your friends, family, or colleagues.
              </Text>
              <TouchableOpacity style={styles.emptyCreateButton} onPress={handleCreateGroup}>
                <Text style={styles.emptyCreateButtonText}>Create a Group</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </SafeScreen>
  );
};

const styles = StyleSheet.create({
  activityContainer: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  activityText: {
    color: '#666',
    fontSize: 12,
    marginLeft: 5,
  },
  avatarRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  container: {
    backgroundColor: '#fff',
    flex: 1,
  },
  coverPhoto: {
    alignItems: 'center',
    backgroundColor: '#4ECDC4',
    height: 120,
    justifyContent: 'center',
  },
  coverPhotoText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  createButton: {
    alignItems: 'center',
    backgroundColor: '#4ECDC4',
    borderRadius: 20,
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  createButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 5,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
    padding: 30,
  },
  emptyCreateButton: {
    backgroundColor: '#4ECDC4',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  emptyCreateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyDescription: {
    color: '#666',
    fontSize: 16,
    marginBottom: 30,
    textAlign: 'center',
  },
  emptyTitle: {
    color: '#333',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 20,
  },
  groupCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 3,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  groupDescription: {
    color: '#666',
    fontSize: 14,
    marginBottom: 15,
  },
  groupInfo: {
    padding: 15,
  },
  groupName: {
    color: '#333',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  groupsList: {
    padding: 15,
  },
  header: {
    alignItems: 'center',
    borderBottomColor: '#f0f0f0',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: {
    color: '#333',
    fontSize: 24,
    fontWeight: 'bold',
  },
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  memberAvatar: {
    backgroundColor: '#ddd',
    borderColor: '#fff',
    borderRadius: 18,
    borderWidth: 2,
    height: 36,
    width: 36,
  },
  memberAvatarMore: {
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
  },
  memberAvatarMoreText: {
    color: '#666',
    fontSize: 12,
    fontWeight: 'bold',
  },
  membersContainer: {
    marginBottom: 15,
  },
  membersTitle: {
    color: '#333',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
});

export default GroupsScreen;
