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

type TermsOfServiceScreenNavigationProp = StackNavigationProp<RootStackParamList, 'TermsOfService'>;

interface TermsOfServiceScreenProps {
  navigation: TermsOfServiceScreenNavigationProp;
}

const TermsOfServiceScreen: React.FC<TermsOfServiceScreenProps> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms of Service</Text>
        <View style={styles.emptyRight} />
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={true}>
        <View style={styles.section}>
          <Text style={styles.title}>Terms of Service</Text>
          <Text style={styles.date}>Last updated: April 19, 2025</Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.paragraph}>
            Welcome to Glimpse! These Terms of Service ("Terms") govern your use of the Glimpse 
            mobile application (the "App") and the services offered through the App 
            (collectively, the "Services"). By accessing or using our Services, you agree to be 
            bound by these Terms.
          </Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
          <Text style={styles.paragraph}>
            By creating an account, accessing, or using our Services, you agree to be bound by these 
            Terms and our Privacy Policy. If you do not agree to these Terms, please do not use our 
            Services.
          </Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Account Registration</Text>
          <Text style={styles.paragraph}>
            To use most features of the Services, you must register for an account. You agree to provide 
            accurate, current, and complete information during the registration process and to update such 
            information to keep it accurate, current, and complete.
          </Text>
          <Text style={styles.paragraph}>
            You are responsible for safeguarding your password and for all activities that occur under your 
            account. You agree to notify us immediately of any unauthorized use of your account.
          </Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. User Content</Text>
          <Text style={styles.paragraph}>
            Our Services allow you to create, upload, post, send, receive, store, and share content, 
            including videos, text, and other materials (collectively, "User Content"). You retain all 
            rights in and to your User Content.
          </Text>
          <Text style={styles.paragraph}>
            By creating, uploading, or sharing User Content, you grant us a non-exclusive, transferable, 
            royalty-free, worldwide license to use, host, store, reproduce, modify, create derivative works, 
            communicate, and distribute your User Content solely for the purposes of operating, developing, 
            and providing our Services.
          </Text>
          <Text style={styles.paragraph}>
            You represent and warrant that: (i) you own or have the necessary rights to share your User 
            Content; (ii) your User Content does not violate the rights of any third party, including 
            intellectual property rights and privacy rights; and (iii) your User Content complies with 
            these Terms and all applicable laws.
          </Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Prohibited Conduct</Text>
          <Text style={styles.paragraph}>
            You agree not to:
          </Text>
          <View style={styles.bulletPoints}>
            <Text style={styles.bulletPoint}>• Use the Services for any illegal purpose or in violation of any law</Text>
            <Text style={styles.bulletPoint}>• Impersonate any person or entity or misrepresent your affiliation</Text>
            <Text style={styles.bulletPoint}>• Post or share content that is illegal, harmful, threatening, abusive, harassing, defamatory, vulgar, obscene, or otherwise objectionable</Text>
            <Text style={styles.bulletPoint}>• Post or share content that infringes any intellectual property or privacy rights</Text>
            <Text style={styles.bulletPoint}>• Interfere with or disrupt the Services or servers or networks connected to the Services</Text>
            <Text style={styles.bulletPoint}>• Attempt to gain unauthorized access to any portion of the Services</Text>
            <Text style={styles.bulletPoint}>• Collect or store personal data about other users without their consent</Text>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Privacy</Text>
          <Text style={styles.paragraph}>
            Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your 
            information when you use our Services. By using our Services, you agree to the collection, use, and 
            sharing of your information as described in our Privacy Policy.
          </Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Intellectual Property Rights</Text>
          <Text style={styles.paragraph}>
            Except for your User Content, the Services and all content and materials available through the 
            Services, including designs, text, graphics, pictures, videos, software, and all other files 
            (collectively, "Content"), are the property of Glimpse or our licensors and are protected by 
            copyright, trademark, and other intellectual property laws.
          </Text>
          <Text style={styles.paragraph}>
            We grant you a limited, non-exclusive, non-transferable, and revocable license to use the 
            Services for their intended purposes, subject to these Terms.
          </Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. Termination</Text>
          <Text style={styles.paragraph}>
            We may terminate or suspend your access to the Services immediately, without prior notice or 
            liability, for any reason, including if you breach these Terms.
          </Text>
          <Text style={styles.paragraph}>
            Upon termination, your right to use the Services will cease immediately. All provisions of 
            these Terms which by their nature should survive termination shall survive termination, 
            including, without limitation, ownership provisions, warranty disclaimers, indemnity, and 
            limitations of liability.
          </Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. Disclaimer of Warranties</Text>
          <Text style={styles.paragraph}>
            THE SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER 
            EXPRESS OR IMPLIED, INCLUDING, BUT NOT LIMITED TO, IMPLIED WARRANTIES OF MERCHANTABILITY, 
            FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICES 
            WILL BE UNINTERRUPTED, TIMELY, SECURE, OR ERROR-FREE.
          </Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>9. Limitation of Liability</Text>
          <Text style={styles.paragraph}>
            IN NO EVENT SHALL GLIMPSE, ITS DIRECTORS, EMPLOYEES, PARTNERS, AGENTS, SUPPLIERS, OR AFFILIATES, 
            BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL OR PUNITIVE DAMAGES, INCLUDING 
            WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING 
            FROM YOUR ACCESS TO OR USE OF OR INABILITY TO ACCESS OR USE THE SERVICES.
          </Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>10. Indemnification</Text>
          <Text style={styles.paragraph}>
            You agree to defend, indemnify, and hold harmless Glimpse and its licensors, service providers, 
            employees, agents, officers, and directors from and against any claims, liabilities, damages, 
            judgments, awards, losses, costs, expenses, or fees (including reasonable attorneys' fees) 
            arising out of or relating to your violation of these Terms or your use of the Services.
          </Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>11. Changes to Terms</Text>
          <Text style={styles.paragraph}>
            We may modify these Terms at any time. When we do, we will provide notice to you by publishing 
            the most current version and revising the date at the top of this page. If we make any material 
            changes to these Terms, we will endeavor to provide you with additional notice, such as by 
            sending you an email or displaying a prominent notice within the Services.
          </Text>
          <Text style={styles.paragraph}>
            Your continued use of the Services after any such changes constitutes your acceptance of the 
            new Terms. If you do not agree to the new Terms, you must stop using the Services.
          </Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>12. Governing Law</Text>
          <Text style={styles.paragraph}>
            These Terms shall be governed by and construed in accordance with the laws of the State of 
            California, without regard to its conflict of law principles. Any dispute arising from these 
            Terms shall be resolved exclusively in the state or federal courts located in San Francisco County, 
            California.
          </Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>13. Contact Us</Text>
          <Text style={styles.paragraph}>
            If you have any questions about these Terms, please contact us at:
          </Text>
          <Text style={styles.contactInfo}>Glimpse App</Text>
          <Text style={styles.contactInfo}>Email: legal@glimpseapp.com</Text>
          <Text style={styles.contactInfo}>Address: 123 App Street, San Francisco, CA 94107</Text>
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

export default TermsOfServiceScreen;