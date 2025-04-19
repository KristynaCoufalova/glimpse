import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation';

type PrivacyPolicyScreenNavigationProp = StackNavigationProp<RootStackParamList, 'PrivacyPolicy'>;

interface PrivacyPolicyScreenProps {
  navigation: PrivacyPolicyScreenNavigationProp;
}

const PrivacyPolicyScreen: React.FC<PrivacyPolicyScreenProps> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={styles.emptyRight} />
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={true}>
        <View style={styles.section}>
          <Text style={styles.title}>Privacy Policy for Glimpse</Text>
          <Text style={styles.date}>Last updated: April 19, 2025</Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Introduction</Text>
          <Text style={styles.paragraph}>
            Welcome to Glimpse ("we," "our," or "us"). We respect your privacy and are 
            committed to protecting the personal information you share with us. This Privacy 
            Policy explains how we collect, use, disclose, and safeguard your information 
            when you use our Glimpse mobile application (the "App").
          </Text>
          <Text style={styles.paragraph}>
            Please read this Privacy Policy carefully. By accessing or using the App, you 
            acknowledge that you have read, understood, and agree to be bound by the terms 
            of this Privacy Policy.
          </Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Information We Collect</Text>
          
          <Text style={styles.subSectionTitle}>Personal Information</Text>
          <Text style={styles.paragraph}>
            We may collect personal information that you voluntarily provide when you:
          </Text>
          <View style={styles.bulletPoints}>
            <Text style={styles.bulletPoint}>• Create an account (email address, display name)</Text>
            <Text style={styles.bulletPoint}>• Complete your profile (profile picture, timezone)</Text>
            <Text style={styles.bulletPoint}>• Upload content (videos, captions)</Text>
            <Text style={styles.bulletPoint}>• Interact with other users (comments, likes)</Text>
            <Text style={styles.bulletPoint}>• Send invitations to join groups</Text>
          </View>
          
          <Text style={styles.subSectionTitle}>Automatically Collected Information</Text>
          <Text style={styles.paragraph}>
            When you use our App, we may automatically collect certain information, including:
          </Text>
          <View style={styles.bulletPoints}>
            <Text style={styles.bulletPoint}>• Device information (device type, operating system)</Text>
            <Text style={styles.bulletPoint}>• App usage data (features used, time spent in the app)</Text>
            <Text style={styles.bulletPoint}>• IP address and approximate location</Text>
            <Text style={styles.bulletPoint}>• Log data (app crashes, performance issues)</Text>
          </View>
          
          <Text style={styles.subSectionTitle}>Content</Text>
          <Text style={styles.paragraph}>
            The primary purpose of our App is to allow you to create and share video content 
            with designated groups of people. We collect and store:
          </Text>
          <View style={styles.bulletPoints}>
            <Text style={styles.bulletPoint}>• Videos you record or upload</Text>
            <Text style={styles.bulletPoint}>• Captions you provide</Text>
            <Text style={styles.bulletPoint}>• Group membership information</Text>
            <Text style={styles.bulletPoint}>• Interaction data (likes, comments, views)</Text>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How We Use Your Information</Text>
          <Text style={styles.paragraph}>
            We use the information we collect to:
          </Text>
          <View style={styles.bulletPoints}>
            <Text style={styles.bulletPoint}>• Provide, maintain, and improve the App</Text>
            <Text style={styles.bulletPoint}>• Create and manage your account</Text>
            <Text style={styles.bulletPoint}>• Process and deliver your content to designated recipients</Text>
            <Text style={styles.bulletPoint}>• Send notifications about activity relevant to you</Text>
            <Text style={styles.bulletPoint}>• Respond to your requests and inquiries</Text>
            <Text style={styles.bulletPoint}>• Monitor and analyze usage patterns and trends</Text>
            <Text style={styles.bulletPoint}>• Detect, prevent, and address technical issues</Text>
            <Text style={styles.bulletPoint}>• Enforce our Terms of Service</Text>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sharing Your Information</Text>
          
          <Text style={styles.subSectionTitle}>With Other Users</Text>
          <View style={styles.bulletPoints}>
            <Text style={styles.bulletPoint}>• Your videos and captions are shared only with members of the groups you select</Text>
            <Text style={styles.bulletPoint}>• Your profile information is visible to users in your groups</Text>
            <Text style={styles.bulletPoint}>• Your activity (likes, comments) is visible to relevant group members</Text>
          </View>
          
          <Text style={styles.subSectionTitle}>Service Providers</Text>
          <Text style={styles.paragraph}>
            We may share information with third-party service providers who perform services on our behalf, such as:
          </Text>
          <View style={styles.bulletPoints}>
            <Text style={styles.bulletPoint}>• Cloud storage providers</Text>
            <Text style={styles.bulletPoint}>• Analytics providers</Text>
            <Text style={styles.bulletPoint}>• Customer support services</Text>
            <Text style={styles.bulletPoint}>• Email service providers</Text>
          </View>
          <Text style={styles.paragraph}>
            These service providers are contractually obligated to use your information only to provide 
            services to us and in accordance with this Privacy Policy.
          </Text>
          
          <Text style={styles.subSectionTitle}>Legal Requirements</Text>
          <Text style={styles.paragraph}>
            We may disclose your information if required to do so by law or in response to valid requests 
            by public authorities (e.g., a court or government agency).
          </Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Security</Text>
          <Text style={styles.paragraph}>
            We implement appropriate technical and organizational measures to protect your personal 
            information against unauthorized access, alteration, disclosure, or destruction. However, 
            no method of transmission over the Internet or electronic storage is 100% secure, and we 
            cannot guarantee absolute security.
          </Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Rights and Choices</Text>
          
          <Text style={styles.subSectionTitle}>Account Information</Text>
          <Text style={styles.paragraph}>
            You can access, update, or delete your account information at any time through the App settings. 
            If you need assistance, please contact us using the information below.
          </Text>
          
          <Text style={styles.subSectionTitle}>Videos and Content</Text>
          <Text style={styles.paragraph}>
            You maintain control over the videos you share and can delete them at any time. However, 
            copies of your content may remain viewable elsewhere if others have shared or saved them.
          </Text>
          
          <Text style={styles.subSectionTitle}>Push Notifications</Text>
          <Text style={styles.paragraph}>
            You can opt out of receiving push notifications through your device settings.
          </Text>
          
          <Text style={styles.subSectionTitle}>Do Not Track</Text>
          <Text style={styles.paragraph}>
            We do not track users across third-party websites, and therefore do not respond to Do Not Track signals.
          </Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Children's Privacy</Text>
          <Text style={styles.paragraph}>
            The App is not intended for children under the age of 13. We do not knowingly collect personal 
            information from children under 13. If you believe we have collected information from a child 
            under 13, please contact us so that we can promptly address the issue.
          </Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Changes to This Privacy Policy</Text>
          <Text style={styles.paragraph}>
            We may update this Privacy Policy from time to time. We will notify you of any changes by 
            posting the new Privacy Policy on this page and updating the "Last updated" date. You are 
            advised to review this Privacy Policy periodically for any changes.
          </Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          <Text style={styles.paragraph}>
            If you have any questions about this Privacy Policy, please contact us at:
          </Text>
          <Text style={styles.contactInfo}>Glimpse App</Text>
          <Text style={styles.contactInfo}>Email: privacy@glimpseapp.com</Text>
          <Text style={styles.contactInfo}>Address: 123 App Street, San Francisco, CA 94107</Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Consent</Text>
          <Text style={styles.paragraph}>
            By using our App, you consent to our Privacy Policy and agree to its terms.
          </Text>
        </View>
        
        <View style={styles.footer} />
      </ScrollView>
    </SafeAreaView>
  );
};

// Get screen dimensions
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Base dimensions (based on standard mobile screen)
const baseWidth = 375;
const baseHeight = 812;

// Scaling functions
const scale = (size: number) => (SCREEN_WIDTH / baseWidth) * size;
const verticalScale = (size: number) => (SCREEN_HEIGHT / baseHeight) * size;
const moderateScale = (size: number, factor = 0.5) => size + (scale(size) - size) * factor;
const scaleFont = (size: number) => moderateScale(size, 0.3);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: verticalScale(15),
    paddingHorizontal: scale(20),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: scale(5),
  },
  headerTitle: {
    fontSize: scaleFont(18),
    fontWeight: 'bold',
    color: '#333',
  },
  emptyRight: {
    width: scale(24),
  },
  content: {
    flex: 1,
    padding: scale(20),
  },
  section: {
    marginBottom: verticalScale(24),
  },
  title: {
    fontSize: scaleFont(22),
    fontWeight: 'bold',
    color: '#333',
    marginBottom: verticalScale(5),
  },
  date: {
    fontSize: scaleFont(14),
    color: '#666',
    marginBottom: verticalScale(10),
  },
  sectionTitle: {
    fontSize: scaleFont(18),
    fontWeight: 'bold',
    color: '#333',
    marginBottom: verticalScale(10),
  },
  subSectionTitle: {
    fontSize: scaleFont(16),
    fontWeight: 'bold',
    color: '#333',
    marginTop: verticalScale(15),
    marginBottom: verticalScale(8),
  },
  paragraph: {
    fontSize: scaleFont(15),
    color: '#444',
    lineHeight: verticalScale(22),
    marginBottom: verticalScale(12),
  },
  bulletPoints: {
    marginBottom: verticalScale(15),
  },
  bulletPoint: {
    fontSize: scaleFont(15),
    color: '#444',
    lineHeight: verticalScale(22),
    marginBottom: verticalScale(5),
    paddingLeft: scale(5),
  },
  contactInfo: {
    fontSize: scaleFont(15),
    color: '#444',
    lineHeight: verticalScale(22),
    marginBottom: verticalScale(5),
    fontWeight: '500',
  },
  footer: {
    height: verticalScale(40),
  },
});

export default PrivacyPolicyScreen;