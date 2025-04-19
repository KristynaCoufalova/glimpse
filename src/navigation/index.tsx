import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';

// Import screens
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';
import FeedScreen from '../screens/feed/FeedScreen';
import GroupsScreen from '../screens/groups/GroupsScreen';
import GroupDetailScreen from '../screens/groups/GroupDetailScreen';
import CreateGroupScreen from '../screens/groups/CreateGroupScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import RecordingScreen from '../screens/recording/RecordingScreen';
import OnboardingScreen from '../screens/auth/OnboardingScreen';
import PrivacyPolicyScreen from '../screens/legal/PrivacyPolicyScreen';
import TermsOfServiceScreen from '../screens/legal/TermsOfServiceScreen';
import HelpSupportScreen from '../screens/support/HelpSupportScreen';

// Define types for navigation
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Recording: undefined;
  GroupDetail: { groupId: string };
  CreateGroup: undefined;
  EditProfile: undefined;
  Onboarding: undefined;
  PrivacyPolicy: undefined;
  TermsOfService: undefined;
  HelpSupport: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
};

export type MainTabParamList = {
  Feed: undefined;
  Groups: undefined;
  Profile: undefined;
};

// Create navigators
const RootStack = createStackNavigator<RootStackParamList>();
const AuthStack = createStackNavigator<AuthStackParamList>();
const MainTab = createBottomTabNavigator<MainTabParamList>();

// Auth navigator
const AuthNavigator = () => {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Signup" component={SignupScreen} />
    </AuthStack.Navigator>
  );
};

// Main tab navigator
const MainTabNavigator = () => {
  return (
    <MainTab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';
          
          if (route.name === 'Feed') {
            iconName = focused ? 'play-circle' : 'play-circle-outline';
          } else if (route.name === 'Groups') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }
          
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4ECDC4', // Soft teal primary color
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <MainTab.Screen name="Feed" component={FeedScreen} />
      <MainTab.Screen name="Groups" component={GroupsScreen} />
      <MainTab.Screen name="Profile" component={ProfileScreen} />
    </MainTab.Navigator>
  );
};

// Root navigator
const Navigation = () => {
  // Get auth state from Redux
  const { user } = useSelector((state: any) => state.auth);
  const isAuthenticated = !!user;
  const hasCompletedOnboarding = user?.hasCompletedOnboarding || false;

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <>
            {!hasCompletedOnboarding && (
              <RootStack.Screen name="Onboarding" component={OnboardingScreen} />
            )}
            <RootStack.Screen name="Auth" component={AuthNavigator} />
          </>
        ) : (
          <>
            <RootStack.Screen name="Main" component={MainTabNavigator} />
            <RootStack.Screen 
              name="Recording" 
              component={RecordingScreen} 
              options={{ 
                presentation: 'modal',
                gestureEnabled: true,
              }}
            />
            <RootStack.Screen 
              name="GroupDetail" 
              component={GroupDetailScreen}
              options={{ headerShown: true, title: 'Group' }}
            />
            <RootStack.Screen 
              name="CreateGroup" 
              component={CreateGroupScreen}
              options={{ headerShown: true, title: 'Create Group' }}
            />
            <RootStack.Screen 
              name="EditProfile" 
              component={EditProfileScreen}
              options={{ 
                headerShown: false,
                presentation: 'card',
                animationTypeForReplace: 'push',
              }}
            />
            <RootStack.Screen
              name="PrivacyPolicy"
              component={PrivacyPolicyScreen}
              options={{
                headerShown: false,
                presentation: 'card',
              }}
            />
            <RootStack.Screen
              name="TermsOfService"
              component={TermsOfServiceScreen}
              options={{
                headerShown: false,
                presentation: 'card',
              }}
            />
            <RootStack.Screen
              name="HelpSupport"
              component={HelpSupportScreen}
              options={{
                headerShown: false,
                presentation: 'card',
              }}
            />
          </>
        )}
      </RootStack.Navigator>
  );
};

export default Navigation;