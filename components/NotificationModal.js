import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  SafeAreaView,
  Animated,
  Modal,
  Dimensions
} from 'react-native';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { BlurView } from 'expo-blur';
import { fonts, typography } from '../app/constants/fonts';

const { height } = Dimensions.get('window');

export default function NotificationModal({ visible, onClose, notifications = [] }) {
  const router = useRouter();

  const getIconName = (type) => {
    switch (type) {
      case 'success':
        return 'check-circle';
      case 'info':
        return 'information';
      case 'message':
        return 'message-text';
      default:
        return 'bell';
    }
  };

  const getIconColor = (type) => {
    switch (type) {
      case 'success':
        return '#4CAF50';
      case 'info':
        return '#2196F3';
      case 'message':
        return '#9C27B0';
      default:
        return '#757575';
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <BlurView intensity={10} style={styles.backdrop}>
        <SafeAreaView style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Notifications</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.notificationList}>
            {notifications.map((notification) => (
              <TouchableOpacity
                key={notification.id}
                style={[
                  styles.notificationItem,
                  !notification.read && styles.unreadItem
                ]}
                onPress={() => {
                  if (notification.type === 'appointment') {
                    router.push(`/appointment/${notification.id}`);
                  } else if (notification.type === 'hospital') {
                    router.push(`/hospitals/${notification.id}`);
                  }
                  onClose();
                }}
              >
                <View style={[styles.iconContainer, { backgroundColor: `${getIconColor(notification.type)}15` }]}>
                  <Icon
                    name={getIconName(notification.type)}
                    size={24}
                    color={getIconColor(notification.type)}
                  />
                </View>
                <View style={styles.contentContainer}>
                  <Text style={styles.notificationTitle}>{notification.title}</Text>
                  <Text style={styles.message}>{notification.message}</Text>
                  <Text style={styles.time}>{notification.time}</Text>
                </View>
                {!notification.read && <View style={styles.unreadDot} />}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </SafeAreaView>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    flex: 1,
    marginTop: height * 0.1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  title: {
    ...typography.h2,
    color: '#000',
  },
  closeButton: {
    padding: 8,
  },
  notificationList: {
    flex: 1,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#fff',
  },
  unreadItem: {
    backgroundColor: '#F8F9FF',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  contentContainer: {
    flex: 1,
    marginRight: 24,
  },
  notificationTitle: {
    ...typography.body1,
    color: '#000',
    marginBottom: 4,
  },
  message: {
    ...typography.body2,
    color: '#666',
    marginBottom: 8,
  },
  time: {
    ...typography.caption,
    color: '#999',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3B39E4',
    position: 'absolute',
    right: 16,
    top: 20,
  },
});