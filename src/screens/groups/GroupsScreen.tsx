import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeScreen } from '../../components/common';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MainTabParamList, RootStackParamList } from '../../navigation';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { fetchUserGroups } from '../../store/slices/groupsSlice';
import { COLORS } from '../../constants';

type GroupsScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Groups'>,
  StackNavigationProp<RootStackParamList>
>;

const GroupsScreen: React.FC = () => {
  const navigation = useNavigation<GroupsScreenNavigationProp>();
  const dispatch = useDispatch();
  
  // Get groups from Redux store
  const { groups, status, error } = useSelector((state: RootState) => state.groups);
  const { user } = useSelector((state: RootState) => state.auth);
  
  const loading = status === 'loading';
  
  // Fetch groups when component mounts
  useEffect(() => {
    if (user) {
      dispatch(fetchUserGroups(user.uid) as any);
    }
  }, [dispatch, user]);
  
  // Handle errors
  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
    }
  }, [error]);

  const handleGroupPress = (groupId: string) => {
    navigation.navigate('GroupDetail', { groupId });
  };

  const handleCreateGroup = () => {
    navigation.navigate('CreateGroup');
  };

  const renderGroupItem = ({ item }: { item: any }) => {
    // Get first two initials if no photo
    const getGroupInitials = (name: string) => {
      return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .substring(0, 2)
        .toUpperCase();
    };
    
    // Format date
    const formatDate = (timestamp: any) => {
      if (!timestamp) return 'Recently';
      
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString();
    };
    
    // Get member count
    const memberCount = item.members ? Object.keys(item.members).length : 0;
    
    return (
      <TouchableOpacity style={styles.groupCard} onPress={() => handleGroupPress(item.id)}>
        {/* Group cover photo */}
        <View style={styles.coverPhoto}>
          {item.photoURL ? (
            <Image source={{ uri: item.photoURL }} style={styles.coverPhotoImage} />
          ) : (
            <Text style={styles.coverPhotoText}>{getGroupInitials(item.name)}</Text>
          )}
        </View>

        <View style={styles.groupInfo}>
          <Text style={styles.groupName}>{item.name}</Text>
          <Text style={styles.groupDescription} numberOfLines={2}>
            {item.description || 'No description'}
          </Text>

          {/* Member avatars */}
          <View style={styles.membersContainer}>
            <Text style={styles.membersTitle}>Members ({memberCount})</Text>
            <View style={styles.avatarRow}>
              {memberCount > 0 ? (
                Object.values(item.members)
                  .slice(0, 4)
                  .map((member: any, index: number) => (
                    <View
                      key={member.id}
                      style={[
                        styles.memberAvatar,
                        { zIndex: 5 - index, marginLeft: index > 0 ? -10 : 0 },
                      ]}
                    />
                  ))
              ) : (
                <Text style={styles.noMembersText}>No members yet</Text>
              )}

              {memberCount > 4 && (
                <View style={[styles.memberAvatar, styles.memberAvatarMore]}>
                  <Text style={styles.memberAvatarMoreText}>+{memberCount - 4}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Last activity */}
          <View style={styles.activityContainer}>
            <Ionicons name="time-outline" size={16} color="#666" />
            <Text style={styles.activityText}>
              Last activity: {formatDate(item.lastActivity)}
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
          <ActivityIndicator size="large" color={COLORS.primary} />
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
    backgroundColor: COLORS.primary,
    height: 120,
    justifyContent: 'center',
  },
  coverPhotoImage: {
    height: '100%',
    width: '100%',
  },
  coverPhotoText: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
  },
  createButton: {
    alignItems: 'center',
    backgroundColor: COLORS.primary,
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
    backgroundColor: COLORS.primary,
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
  noMembersText: {
    color: '#999',
    fontSize: 12,
    fontStyle: 'italic',
  }
});

export default GroupsScreen;