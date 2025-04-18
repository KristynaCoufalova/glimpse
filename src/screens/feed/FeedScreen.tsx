import React, { useState, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  FlatList, 
  Dimensions, 
  TouchableOpacity,
  Text,
  ActivityIndicator,
  SafeAreaView
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../../navigation';

// This will be a component we'll create later
import VideoPlayer from '../../components/video/VideoPlayer';

type FeedScreenNavigationProp = BottomTabNavigationProp<MainTabParamList, 'Feed'>;

interface FeedScreenProps {
  navigation: FeedScreenNavigationProp;
}

// Mock data for videos
interface VideoItem {
  id: string;
  videoUrl: string;
  thumbnailUrl: string;
  caption: string;
  creator: {
    id: string;
    name: string;
    avatarUrl: string;
  };
  groupId: string;
  groupName: string;
  createdAt: string;
  likes: number;
  comments: number;
  duration: number;
}

const { width, height } = Dimensions.get('window');

// Mock data
const mockVideos: VideoItem[] = [
  {
    id: '1',
    videoUrl: 'https://example.com/video1.mp4',
    thumbnailUrl: 'https://example.com/thumbnail1.jpg',
    caption: 'Enjoying a beautiful sunset at the beach! #sunset #beach',
    creator: {
      id: 'user1',
      name: 'Sarah Johnson',
      avatarUrl: 'https://example.com/avatar1.jpg',
    },
    groupId: 'group1',
    groupName: 'Family',
    createdAt: '2023-06-15T14:30:00Z',
    likes: 12,
    comments: 3,
    duration: 45,
  },
  {
    id: '2',
    videoUrl: 'https://example.com/video2.mp4',
    thumbnailUrl: 'https://example.com/thumbnail2.jpg',
    caption: 'First day at my new job! So excited for this opportunity.',
    creator: {
      id: 'user2',
      name: 'Michael Chen',
      avatarUrl: 'https://example.com/avatar2.jpg',
    },
    groupId: 'group2',
    groupName: 'College Friends',
    createdAt: '2023-06-14T09:15:00Z',
    likes: 24,
    comments: 8,
    duration: 60,
  },
  {
    id: '3',
    videoUrl: 'https://example.com/video3.mp4',
    thumbnailUrl: 'https://example.com/thumbnail3.jpg',
    caption: 'Making pasta from scratch for the first time!',
    creator: {
      id: 'user3',
      name: 'Emma Wilson',
      avatarUrl: 'https://example.com/avatar3.jpg',
    },
    groupId: 'group1',
    groupName: 'Family',
    createdAt: '2023-06-13T18:45:00Z',
    likes: 18,
    comments: 5,
    duration: 75,
  },
];

// Group filter options
const groupFilters = [
  { id: 'all', name: 'All Groups' },
  { id: 'group1', name: 'Family' },
  { id: 'group2', name: 'College Friends' },
  { id: 'group3', name: 'Work Team' },
];

const FeedScreen: React.FC<FeedScreenProps> = ({ navigation }) => {
  const [videos, setVideos] = useState<VideoItem[]>(mockVideos);
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedGroup, setSelectedGroup] = useState('all');
  const flatListRef = useRef<FlatList>(null);

  // Filter videos based on selected group
  const filteredVideos = selectedGroup === 'all' 
    ? videos 
    : videos.filter(video => video.groupId === selectedGroup);

  const handleViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50
  }).current;

  const renderVideo = ({ item, index }: { item: VideoItem; index: number }) => {
    return (
      <View style={styles.videoContainer}>
        {/* This will be replaced with an actual VideoPlayer component */}
        <View style={styles.videoPlaceholder}>
          <Text style={styles.videoPlaceholderText}>Video {index + 1}</Text>
          <Text style={styles.videoPlaceholderCaption}>{item.caption}</Text>
          <Text style={styles.videoPlaceholderGroup}>Group: {item.groupName}</Text>
        </View>
        
        {/* Video controls */}
        <View style={styles.videoControls}>
          <View style={styles.creatorInfo}>
            <View style={styles.creatorAvatar} />
            <Text style={styles.creatorName}>{item.creator.name}</Text>
            <Text style={styles.videoCaption}>{item.caption}</Text>
          </View>
          
          <View style={styles.interactionControls}>
            <TouchableOpacity style={styles.interactionButton}>
              <Ionicons name="heart-outline" size={28} color="white" />
              <Text style={styles.interactionCount}>{item.likes}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.interactionButton}>
              <Ionicons name="chatbubble-outline" size={28} color="white" />
              <Text style={styles.interactionCount}>{item.comments}</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Progress indicator */}
        <View style={styles.progressContainer}>
          <View 
            style={[
              styles.progressBar, 
              { width: `${(index === currentIndex ? 100 : 0)}%` }
            ]} 
          />
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
                selectedGroup === item.id && styles.groupFilterItemSelected
              ]}
              onPress={() => setSelectedGroup(item.id)}
            >
              <Text 
                style={[
                  styles.groupFilterText,
                  selectedGroup === item.id && styles.groupFilterTextSelected
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Group filters at top */}
      {renderGroupFilter()}
      
      {loading ? (
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
              <Text style={styles.emptySubtext}>
                Videos from your groups will appear here
              </Text>
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoContainer: {
    width,
    height,
    backgroundColor: '#111',
    position: 'relative',
  },
  videoPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#222',
  },
  videoPlaceholderText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  videoPlaceholderCaption: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 40,
    marginBottom: 10,
  },
  videoPlaceholderGroup: {
    color: '#4ECDC4',
    fontSize: 14,
  },
  videoControls: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  creatorInfo: {
    flex: 1,
    marginRight: 20,
  },
  creatorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4ECDC4',
    marginBottom: 10,
  },
  creatorName: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5,
  },
  videoCaption: {
    color: 'white',
    fontSize: 14,
  },
  interactionControls: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  interactionButton: {
    alignItems: 'center',
    marginBottom: 15,
  },
  interactionCount: {
    color: 'white',
    marginTop: 5,
  },
  progressContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4ECDC4',
  },
  groupFilterContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingTop: 10,
  },
  groupFilterList: {
    paddingHorizontal: 10,
  },
  groupFilterItem: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  groupFilterItemSelected: {
    backgroundColor: '#4ECDC4',
  },
  groupFilterText: {
    color: 'white',
    fontSize: 14,
  },
  groupFilterTextSelected: {
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    height,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  emptySubtext: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
    textAlign: 'center',
  },
  recordButton: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    zIndex: 10,
  },
});

export default FeedScreen;