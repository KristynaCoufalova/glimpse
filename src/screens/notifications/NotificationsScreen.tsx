import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { SafeScreen, Header } from '../../components/common';
import { RootStackParamList } from '../../navigation';
import {
  fetchGroupInvitations,
  respondToGroupInvitation,
  GroupInvitation,
} from '../../store/slices/notificationsSlice';

type NotificationsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Notifications'>;

const NotificationsScreen: React.FC = () => {
  const navigation = useNavigation<NotificationsScreenNavigationProp>();
  const dispatch = useDispatch<AppDispatch>();
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useSelector((state: RootState) => state.auth);
  const { invitations, status, error } = useSelector((state: RootState) => state.notifications);

  const isLoading = status === 'loading';
  const hasInvitations = invitations.length > 0;

  // Fetch invitations on component mount and when user changes
  useEffect(() => {
    if (user && user.email) {
      dispatch(fetchGroupInvitations(user.email) as any);
    }
  }, [dispatch, user]);

  // Handle refresh
  const handleRefresh = () => {
    if (user && user.email) {
      setRefreshing(true);
      dispatch(fetchGroupInvitations(user.email) as any).finally(() => {
        setRefreshing(false);
      });
    }
  };

  // Handle accept invitation
  const handleAcceptInvitation = (invitation: GroupInvitation) => {
    if (!user) return;
    Alert.alert(
      'Accept Invitation',
      `Do you want to join ${invitation.groupName || 'this group'}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Join',
          onPress: () => {
            dispatch(
              respondToGroupInvitation({
                invitationId: invitation.id,
                accept: true,
                userId: user.uid,
              })
            )
              .then(() => {
                // Navigate to the group detail screen after joining
                navigation.navigate('GroupDetail', { groupId: invitation.groupId });
              })
              .catch((error: Error) => {
                Alert.alert('Error', error.message || 'Failed to join group');
              });
          },
        },
      ]
    );
  };

  // Handle decline invitation
  const handleDeclineInvitation = (invitation: GroupInvitation) => {
    if (!user) return;
    Alert.alert(
      'Decline Invitation',
      `Are you sure you want to decline the invitation to ${invitation.groupName || 'this group'}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Decline',
          style: 'destructive',
          onPress: () => {
            dispatch(
              respondToGroupInvitation({
                invitationId: invitation.id,
                accept: false,
                userId: user.uid,
              })
            ).catch((error: Error) => {
              Alert.alert('Error', error.message || 'Failed to decline invitation');
            });
          },
        },
      ]
    );
  };

  // Render invitation item
  const renderInvitationItem = ({ item }: { item: GroupInvitation }) => (
    <View style={styles.invitationCard}>
      <View style={styles.invitationContent}>
        <Text style={styles.invitationTitle}>{item.groupName || 'Group Invitation'}</Text>
        <Text style={styles.invitationDescription}>
          {item.inviterName || 'Someone'} invited you to join
          {item.groupName ? ` ${item.groupName}` : ' a group'}
        </Text>
        <Text style={styles.invitationTime}>
          {item.createdAt && new Date(item.createdAt.toDate()).toLocaleDateString()}
        </Text>
      </View>
      <View style={styles.invitationActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.acceptButton]}
          onPress={() => handleAcceptInvitation(item)}
        >
          <Text style={styles.acceptButtonText}>Accept</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.declineButton]}
          onPress={() => handleDeclineInvitation(item)}
        >
          <Text style={styles.declineButtonText}>Decline</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Render empty state
  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="notifications-outline" size={64} color="#ccc" />
      <Text style={styles.emptyTitle}>No notifications</Text>
      <Text style={styles.emptyMessage}>
        When you receive invitations or other notifications, they&apos;ll appear here.
      </Text>
    </View>
  );

  return (
    <SafeScreen style={styles.container}>
      <Header title="Notifications" showBackButton onLeftPress={() => navigation.goBack()} />
      {isLoading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4ECDC4" />
        </View>
      ) : (
        <FlatList
          data={invitations}
          keyExtractor={item => item.id}
          renderItem={renderInvitationItem}
          contentContainerStyle={!hasInvitations ? { flex: 1 } : undefined}
          ListEmptyComponent={renderEmptyComponent}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      )}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </SafeScreen>
  );
};

const styles = StyleSheet.create({
  acceptButton: {
    backgroundColor: '#4ECDC4',
  },
  acceptButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  actionButton: {
    borderRadius: 6,
    marginLeft: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  container: {
    backgroundColor: '#f9f9f9',
    flex: 1,
  },
  declineButton: {
    backgroundColor: '#f0f0f0',
  },
  declineButtonText: {
    color: '#666',
  },
  emptyContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 32,
  },
  emptyMessage: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
  },
  emptyTitle: {
    color: '#333',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 16,
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    borderRadius: 8,
    margin: 16,
    padding: 16,
  },
  errorText: {
    color: '#d32f2f',
    textAlign: 'center',
  },
  invitationActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  invitationCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    elevation: 2,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  invitationContent: {
    marginBottom: 16,
  },
  invitationDescription: {
    color: '#666',
    fontSize: 16,
    marginBottom: 8,
  },
  invitationTime: {
    color: '#999',
    fontSize: 14,
  },
  invitationTitle: {
    color: '#333',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
});

export default NotificationsScreen;