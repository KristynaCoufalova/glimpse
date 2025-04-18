import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList, 
  TouchableOpacity, 
  SafeAreaView,
  Image,
  ActivityIndicator
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
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
      <TouchableOpacity 
        style={styles.groupCard}
        onPress={() => handleGroupPress(item.id)}
      >
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
                    { zIndex: 5 - index, marginLeft: index > 0 ? -10 : 0 }
                  ]}
                />
              ))}
              
              {item.members.length > 4 && (
                <View style={[styles.memberAvatar, styles.memberAvatarMore]}>
                  <Text style={styles.memberAvatarMoreText}>
                    +{item.members.length - 4}
                  </Text>
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
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Groups</Text>
        <TouchableOpacity 
          style={styles.createButton}
          onPress={handleCreateGroup}
        >
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
              <TouchableOpacity 
                style={styles.emptyCreateButton}
                onPress={handleCreateGroup}
              >
                <Text style={styles.emptyCreateButtonText}>Create a Group</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4ECDC4',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  createButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  groupsList: {
    padding: 15,
  },
  groupCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  coverPhoto: {
    height: 120,
    backgroundColor: '#4ECDC4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverPhotoText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  groupInfo: {
    padding: 15,
  },
  groupName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  groupDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  membersContainer: {
    marginBottom: 15,
  },
  membersTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ddd',
    borderWidth: 2,
    borderColor: '#fff',
  },
  memberAvatarMore: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberAvatarMoreText: {
    fontSize: 12,
    color: '#666',
    fontWeight: 'bold',
  },
  activityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 5,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    marginTop: 50,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  emptyCreateButton: {
    backgroundColor: '#4ECDC4',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  emptyCreateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default GroupsScreen;