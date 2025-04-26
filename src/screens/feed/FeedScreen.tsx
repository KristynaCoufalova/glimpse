import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Text,
  ActivityIndicator,
} from 'react-native';
import { SafeScreen } from '../../components/common';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../../navigation';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { fetchFeedVideos, Video } from '../../store/slices/videosSlice';
import { useFocusEffect } from '@react-navigation/native';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { firestore } from '../../services/firebase/config';

import VideoPlayer from '../../components/video/VideoPlayer';

type FeedScreenNavigationProp = BottomTabNavigationProp<MainTabParamList, 'Feed'>;

interface FeedScreenProps {
  navigation: FeedScreenNavigationProp;
}

// For storing group names mapped by ID
interface GroupMap {
  [groupId: string]: string;
}

const { width, height } = Dimensions.get('window');

const FeedScreen: React.FC<FeedScreenProps> = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { feedVideos, status } = useSelector((state: RootState) => state.videos);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [groupNames, setGroupNames] = useState<GroupMap>({});
  const [groupFilters, setGroupFilters] = useState<{ id: string; name: string }[]>([
    { id: 'all', name: 'All Groups' },
  ]);
  const flatListRef = useRef<FlatList>(null);

  // Fetch videos when the screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      const loadFeedData = async () => {
        if (user) {
          // Fetch videos for the current user's groups
          dispatch(fetchFeedVideos({ userId: user.uid }) as any);
          // Fetch group names for filtering
          await fetchGroupNamesForUser(user.uid);
        }
      };
      
      loadFeedData();
    }, [dispatch, user])
  );

  // Fetch group names for the user
  const fetchGroupNamesForUser = async (userId: string) => {
    try {
      // Query groups where the user is a member
      const userGroupsQuery = query(
        collection(firestore, 'groups'),
        where(`members.${userId}.id`, '==', userId)
      );
      
      const userGroupsSnapshot = await getDocs(userGroupsQuery);
      const groups: { id: string; name: string }[] = [{ id: 'all', name: 'All Groups' }];
      const groupNameMap: GroupMap = {};
      
      userGroupsSnapshot.forEach(doc => {
        const groupData = doc.data();
        groups.push({ id: doc.id, name: groupData.name });
        groupNameMap[doc.id] = groupData.name;
      });
      
      setGroupFilters(groups);
      setGroupNames(groupNameMap);
    } catch (error) {
      console.error('Error fetching group names:', error);
    }
  };

  // Handle liking a video
  const handleLikeVideo = (videoId: string) => {
    console.log('Like video:', videoId);
    // TODO: Implement like functionality
  };

  // Filter videos based on selected group
  const filteredVideos =
    selectedGroup === 'all'
      ? feedVideos
      : feedVideos.filter(video => video.groupIds.includes(selectedGroup));

  const handleViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const renderVideo = ({ item, index }: { item: Video; index: number }) => {
    // Get the group name for display
    const groupName = item.groupIds.length > 0 ? groupNames[item.groupIds[0]] || 'Group'
      : 'Unknown Group';

    return (
      <View style={styles.videoContainer}>
        {/* Video Player */}
        <VideoPlayer
          uri={item.videoURL}
          thumbnailUri={item.thumbnailURL}
          isActive={index === currentIndex}
          onVideoEnd={() => {
            // Optionally handle video end
          }}
          onDoubleTap={() => handleLikeVideo(item.id)}
        />

        {/* Video controls */}
        <View style={styles.videoControls}>
          <View style={styles.creatorInfo}>
            <View style={styles.creatorAvatar} />
            <Text style={styles.creatorName}>
              {item.creator === user?.uid ? 'You' : 'Group Member'}
            </Text>
            <Text style={styles.videoCaption}>{item.caption}</Text>
            <Text style={styles.groupName}>Group: {groupName}</Text>
          </View>

          <View style={styles.interactionControls}>
            <TouchableOpacity
              style={styles.interactionButton}
              onPress={() => handleLikeVideo(item.id)}
            >
              <Ionicons name="heart-outline" size={28} color="white" />
              <Text style={styles.interactionCount}>{item.reactions?.likes || 0}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.interactionButton}>
              <Ionicons name="chatbubble-outline" size={28} color="white" />
              <Text style={styles.interactionCount}>{item.reactions?.comments || 0}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Progress indicator */}
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: `${index === currentIndex ? 100 : 0}%` }]} />
        </View>
      </View>
    );
  };

  const renderGroupFilter = () => {
    return (
      <View style={styles.groupFilterContainer}>
        <FlatList
          data={groupFilters}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.groupFilterItem,
                selectedGroup === item.id && styles.groupFilterItemSelected,
              ]}
              onPress={() => setSelectedGroup(item.id)}
            >
              <Text
                style={[
                  styles.groupFilterText,
                  selectedGroup === item.id && styles.groupFilterTextSelected,
                ]}
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          )}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.groupFilterList}
        />
      </View>
    );
  };

  const isLoading = status === 'loading';

  return (
    <SafeScreen style={styles.container} statusBarStyle="light-content" statusBarColor="#000">
      {/* Header with notification icon */}
      <View style={styles.headerContainer}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Feed</Text>
          <TouchableOpacity
            style={styles.notificationIcon}
            onPress={() => navigation.navigate('Notifications' as any)}
          >
            <Ionicons name="notifications-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        {/* Group filters */}
        {renderGroupFilter()}
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4ECDC4" />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={filteredVideos}
          renderItem={renderVideo}
          keyExtractor={item => item.id}
          pagingEnabled
          showsVerticalScrollIndicator={false}
          snapToInterval={height}
          snapToAlignment="start"
          decelerationRate="fast"
          onViewableItemsChanged={handleViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          initialNumToRender={2}
          maxToRenderPerBatch={3}
          windowSize={5}
          getItemLayout={(_, index) => ({
            length: height,
            offset: height * index,
            index,
          })}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No videos found</Text>
              <Text style={styles.emptySubtext}>Videos from your groups will appear here</Text>
            </View>
          }
        />
      )}

      {/* Record button */}
      <TouchableOpacity
        style={styles.recordButton}
        onPress={() => navigation.navigate('Recording' as any)}
      >
        <Ionicons name="add-circle" size={60} color="#4ECDC4" />
      </TouchableOpacity>
    </SafeScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000',
    flex: 1,
  },
  creatorAvatar: {
    backgroundColor: '#4ECDC4',
    borderRadius: 20,
    height: 40,
    marginBottom: 10,
    width: 40,
  },
  creatorInfo: {
    flex: 1,
    marginRight: 20,
  },
  creatorName: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  emptyContainer: {
    alignItems: 'center',
    flex: 1,
    height,
    justifyContent: 'center',
    padding: 20,
  },
  emptySubtext: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
    textAlign: 'center',
  },
  emptyText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  groupFilterContainer: {
    paddingTop: 5,
    zIndex: 10,
  },
  groupFilterItem: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    marginHorizontal: 5,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  groupFilterItemSelected: {
    backgroundColor: '#4ECDC4',
  },
  groupFilterList: {
    paddingHorizontal: 10,
  },
  groupFilterText: {
    color: 'white',
    fontSize: 14,
  },
  groupFilterTextSelected: {
    fontWeight: 'bold',
  },
  groupName: {
    color: '#4ECDC4',
    fontSize: 12,
    marginTop: 5,
  },
  headerContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingTop: 10,
    zIndex: 10,
  },
  headerContent: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  interactionButton: {
    alignItems: 'center',
    marginBottom: 15,
  },
  interactionControls: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  interactionCount: {
    color: 'white',
    marginTop: 5,
  },
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  notificationIcon: {
    padding: 5,
  },
  progressBar: {
    backgroundColor: '#4ECDC4',
    height: '100%',
  },
  progressContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    bottom: 0,
    height: 3,
    left: 0,
    position: 'absolute',
    right: 0,
  },
  recordButton: {
    alignSelf: 'center',
    bottom: 20,
    position: 'absolute',
    zIndex: 10,
  },
  videoCaption: {
    color: 'white',
    fontSize: 14,
  },
  videoContainer: {
    backgroundColor: '#111',
    height,
    position: 'relative',
    width,
  },
  videoControls: {
    bottom: 80,
    flexDirection: 'row',
    justifyContent: 'space-between',
    left: 0,
    padding: 20,
    position: 'absolute',
    right: 0,
  },
});

export default FeedScreen;