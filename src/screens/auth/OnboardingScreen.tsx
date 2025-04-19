import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Image,
  Animated,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation';

type OnboardingScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Onboarding'>;

interface OnboardingScreenProps {
  navigation: OnboardingScreenNavigationProp;
}

interface OnboardingSlide {
  id: string;
  title: string;
  description: string;
  image: string; // This would be a local image path in a real app
}

const { width, height } = Dimensions.get('window');

const slides: OnboardingSlide[] = [
  {
    id: '1',
    title: 'Welcome to Glimpse',
    description: 'Share authentic moments with the people who matter most in your life.',
    image: 'welcome',
  },
  {
    id: '2',
    title: 'Private Groups',
    description:
      'Create private groups with friends, family, or partners to share your moments securely.',
    image: 'groups',
  },
  {
    id: '3',
    title: 'Video Updates',
    description: 'Share short video updates (up to 90 seconds) to keep your connections strong.',
    image: 'video',
  },
  {
    id: '4',
    title: 'Daily Prompts',
    description: 'Get inspired with optional daily prompts to share meaningful moments.',
    image: 'prompts',
  },
];

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ navigation }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const viewableItemsChanged = useRef(({ viewableItems }: any) => {
    setCurrentIndex(viewableItems[0]?.index || 0);
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const renderItem = ({ item }: { item: OnboardingSlide }) => {
    return (
      <View style={styles.slide}>
        <View style={styles.imageContainer}>
          {/* Placeholder for image */}
          <View
            style={[
              styles.imagePlaceholder,
              {
                backgroundColor:
                  item.id === '1'
                    ? '#4ECDC4'
                    : item.id === '2'
                      ? '#FF6B6B'
                      : item.id === '3'
                        ? '#F7B801'
                        : '#1A535C',
              },
            ]}
          >
            <Text style={styles.imagePlaceholderText}>{item.image}</Text>
          </View>
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description}>{item.description}</Text>
        </View>
      </View>
    );
  };

  const renderDots = () => {
    const dotPosition = Animated.divide(scrollX, width);

    return (
      <View style={styles.dotsContainer}>
        {slides.map((_, i) => {
          const opacity = dotPosition.interpolate({
            inputRange: [i - 1, i, i + 1],
            outputRange: [0.3, 1, 0.3],
            extrapolate: 'clamp',
          });

          const dotWidth = dotPosition.interpolate({
            inputRange: [i - 1, i, i + 1],
            outputRange: [10, 20, 10],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View key={i.toString()} style={[styles.dot, { opacity, width: dotWidth }]} />
          );
        })}
      </View>
    );
  };

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      handleGetStarted();
    }
  };

  const handleGetStarted = () => {
    // In a real app, we would set a flag in AsyncStorage or Redux to indicate that onboarding is complete
    navigation.navigate('Auth');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
          useNativeDriver: false,
        })}
        onViewableItemsChanged={viewableItemsChanged}
        viewabilityConfig={viewConfig}
        scrollEventThrottle={32}
      />

      {renderDots()}

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.skipButton} onPress={handleGetStarted}>
          <Text style={styles.skipButtonText}>Skip</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>
            {currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    bottom: 80,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    position: 'absolute',
    width: '100%',
  },
  container: {
    alignItems: 'center',
    backgroundColor: '#fff',
    flex: 1,
    justifyContent: 'center',
  },
  description: {
    color: '#666',
    fontSize: 18,
    lineHeight: 26,
    textAlign: 'center',
  },
  dot: {
    backgroundColor: '#4ECDC4',
    borderRadius: 5,
    height: 10,
    marginHorizontal: 5,
  },
  dotsContainer: {
    bottom: 150,
    flexDirection: 'row',
    position: 'absolute',
  },
  imageContainer: {
    alignItems: 'center',
    flex: 0.6,
    justifyContent: 'center',
  },
  imagePlaceholder: {
    alignItems: 'center',
    borderRadius: 20,
    height: width * 0.8,
    justifyContent: 'center',
    width: width * 0.8,
  },
  imagePlaceholderText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  nextButton: {
    backgroundColor: '#4ECDC4',
    borderRadius: 8,
    paddingHorizontal: 30,
    paddingVertical: 15,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  skipButton: {
    padding: 15,
  },
  skipButtonText: {
    color: '#666',
    fontSize: 16,
  },
  slide: {
    alignItems: 'center',
    height,
    padding: 20,
    width,
  },
  textContainer: {
    alignItems: 'center',
    flex: 0.4,
    paddingHorizontal: 20,
  },
  title: {
    color: '#333',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
});

export default OnboardingScreen;
