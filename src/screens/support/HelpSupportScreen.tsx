import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation';

type HelpSupportScreenNavigationProp = StackNavigationProp<RootStackParamList, 'HelpSupport'>;

interface HelpSupportScreenProps {
  navigation: HelpSupportScreenNavigationProp;
}

interface FaqItem {
  question: string;
  answer: string;
  isExpanded: boolean;
}

const HelpSupportScreen: React.FC<HelpSupportScreenProps> = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState<'faqs' | 'contact'>('faqs');
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [faqItems, setFaqItems] = useState<FaqItem[]>([
    {
      question: 'How do I create a new group?',
      answer: 'To create a new group, go to the Groups tab and tap on the "Create" button in the top right corner. Enter a name and description for your group, then invite members by entering their email addresses.',
      isExpanded: false,
    },
    {
      question: 'How do I record and share a video?',
      answer: 'To record a video, tap the "+" button at the bottom of the Feed screen. This opens the recording screen where you can record a video up to 90 seconds long. After recording, you can add a caption and select which groups you want to share it with before posting.',
      isExpanded: false,
    },
    {
      question: 'Who can see my videos?',
      answer: 'Only members of the groups you choose to share your videos with can see them. Glimpse is designed for private sharing with specific people, not public viewing.',
      isExpanded: false,
    },
    {
      question: 'How do I invite someone to my group?',
      answer: 'Open the specific group, tap the "Invite" button, and enter the email address of the person you want to invite. They will receive an invitation to join the group.',
      isExpanded: false,
    },
    {
      question: 'Can I delete a video after posting it?',
      answer: 'Yes, you can delete any video you\'ve posted. Find the video in your feed, tap the three dots menu, and select "Delete". Note that if others have downloaded the video, you cannot remove those copies.',
      isExpanded: false,
    },
    {
      question: 'How do I change my notification settings?',
      answer: 'Go to your Profile tab and scroll down to the "Notification Settings" section. Here you can toggle notifications for new videos, comments, likes, group invites, and daily prompts.',
      isExpanded: false,
    },
    {
      question: 'Is my data secure on Glimpse?',
      answer: 'Yes, we take data security seriously. All videos and personal information are encrypted and stored securely. We never share your content with third parties without your consent. You can read more in our Privacy Policy.',
      isExpanded: false,
    },
  ]);

  // Toggle FAQ expansion
  const toggleFaq = (index: number) => {
    const updatedFaqs = [...faqItems];
    updatedFaqs[index].isExpanded = !updatedFaqs[index].isExpanded;
    setFaqItems(updatedFaqs);
  };

  // Handle contact form submission
  const handleSubmitContactForm = () => {
    if (!contactSubject.trim()) {
      Alert.alert('Error', 'Please enter a subject for your message');
      return;
    }

    if (!contactMessage.trim()) {
      Alert.alert('Error', 'Please enter your message');
      return;
    }

    setSubmitting(true);

    // Simulate API call to submit feedback
    setTimeout(() => {
      setSubmitting(false);
      setContactSubject('');
      setContactMessage('');
      Alert.alert(
        'Message Sent',
        'Thank you for contacting us. Our support team will get back to you within 24-48 hours.',
        [{ text: 'OK' }]
      );
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={styles.emptyRight} />
      </View>

      {/* Tab navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'faqs' && styles.activeTab]}
          onPress={() => setActiveTab('faqs')}
        >
          <Text style={[styles.tabText, activeTab === 'faqs' && styles.activeTabText]}>FAQs</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'contact' && styles.activeTab]}
          onPress={() => setActiveTab('contact')}
        >
          <Text style={[styles.tabText, activeTab === 'contact' && styles.activeTabText]}>Contact Us</Text>
        </TouchableOpacity>
      </View>
      
      {/* Content area */}
      <ScrollView style={styles.content}>
        {activeTab === 'faqs' ? (
          // FAQs Section
          <View style={styles.faqContainer}>
            <Text style={styles.sectionIntro}>
              Frequently asked questions about using Glimpse. Tap on a question to see the answer.
            </Text>
            
            {faqItems.map((item, index) => (
              <View key={index} style={styles.faqItem}>
                <TouchableOpacity
                  style={styles.faqQuestion}
                  onPress={() => toggleFaq(index)}
                >
                  <Text style={styles.faqQuestionText}>{item.question}</Text>
                  <Ionicons
                    name={item.isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color="#4ECDC4"
                  />
                </TouchableOpacity>
                
                {item.isExpanded && (
                  <View style={styles.faqAnswer}>
                    <Text style={styles.faqAnswerText}>{item.answer}</Text>
                  </View>
                )}
              </View>
            ))}
            
            <View style={styles.supportLinksContainer}>
              <Text style={styles.supportLinksTitle}>Need more help?</Text>
              <TouchableOpacity 
                style={styles.supportLink}
                onPress={() => setActiveTab('contact')}
              >
                <Ionicons name="mail-outline" size={20} color="#4ECDC4" />
                <Text style={styles.supportLinkText}>Contact Support</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.supportLink}
                onPress={() => navigation.navigate('PrivacyPolicy')}
              >
                <Ionicons name="document-text-outline" size={20} color="#4ECDC4" />
                <Text style={styles.supportLinkText}>Privacy Policy</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.supportLink}
                onPress={() => navigation.navigate('TermsOfService')}
              >
                <Ionicons name="information-circle-outline" size={20} color="#4ECDC4" />
                <Text style={styles.supportLinkText}>Terms of Service</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          // Contact Us Section
          <View style={styles.contactContainer}>
            <Text style={styles.sectionIntro}>
              Have a question or need assistance? Send us a message and our support 
              team will get back to you as soon as possible.
            </Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>Subject</Text>
              <TextInput
                style={styles.input}
                value={contactSubject}
                onChangeText={setContactSubject}
                placeholder="What can we help you with?"
                maxLength={100}
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>Message</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={contactMessage}
                onChangeText={setContactMessage}
                placeholder="Describe your issue or question in detail..."
                multiline
                numberOfLines={6}
                maxLength={1000}
              />
              <Text style={styles.characterCount}>{contactMessage.length}/1000</Text>
            </View>
            
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmitContactForm}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Submit</Text>
              )}
            </TouchableOpacity>
            
            <View style={styles.supportInfoContainer}>
              <Text style={styles.supportInfoTitle}>Support Hours</Text>
              <Text style={styles.supportInfoText}>
                Our support team is available Monday to Friday, 9:00 AM - 6:00 PM Pacific Time.
                Expected response time is within 24-48 hours.
              </Text>
              
              <Text style={styles.supportInfoTitle}>Email</Text>
              <Text style={styles.supportInfoText}>support@glimpseapp.com</Text>
            </View>
          </View>
        )}
        
        <View style={styles.footer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  emptyRight: {
    width: 24,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#4ECDC4',
  },
  tabText: {
    fontSize: 16,
    color: '#888',
  },
  activeTabText: {
    color: '#4ECDC4',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  sectionIntro: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
    marginBottom: 20,
  },
  
  // FAQs Section Styles
  faqContainer: {
    padding: 20,
  },
  faqItem: {
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  faqQuestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f9f9f9',
  },
  faqQuestionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  faqAnswer: {
    padding: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  faqAnswerText: {
    fontSize: 15,
    color: '#444',
    lineHeight: 22,
  },
  supportLinksContainer: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  supportLinksTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  supportLink: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  supportLinkText: {
    fontSize: 15,
    color: '#4ECDC4',
    marginLeft: 10,
  },
  
  // Contact Us Section Styles
  contactContainer: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    minHeight: 150,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    color: '#999',
    alignSelf: 'flex-end',
    marginTop: 5,
  },
  submitButton: {
    backgroundColor: '#4ECDC4',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 30,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  supportInfoContainer: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 20,
  },
  supportInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
    marginTop: 15,
  },
  supportInfoText: {
    fontSize: 15,
    color: '#444',
    lineHeight: 22,
  },
  footer: {
    height: 40,
  },
});

export default HelpSupportScreen;