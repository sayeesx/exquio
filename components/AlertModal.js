import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function AlertModal({ 
  visible, 
  type = 'success', // success, error, warning
  title, 
  message, 
  onClose,
  onConfirm,
  confirmText = 'OK',
  cancelText = 'Cancel',
  showCancel = false
}) {
  const getIcon = () => {
    switch(type) {
      case 'success':
        return <Ionicons name="checkmark-circle" size={50} color="#4CAF50" />;
      case 'error':
        return <Ionicons name="close-circle" size={50} color="#DC2626" />;
      case 'warning':
        return <Ionicons name="warning" size={50} color="#F59E0B" />;
      default:
        return null;
    }
  };

  const getColors = () => {
    switch(type) {
      case 'success':
        return { button: '#4CAF50', text: '#4CAF50' };
      case 'error':
        return { button: '#DC2626', text: '#DC2626' };
      case 'warning':
        return { button: '#F59E0B', text: '#F59E0B' };
      default:
        return { button: '#4C35E3', text: '#4C35E3' };
    }
  };

  const colors = getColors();

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.alertContainer}>
          <View style={styles.alertContent}>
            {getIcon()}
            <Text style={[
              styles.alertTitle,
              { color: type === 'success' ? '#4CAF50' : '#1A1A1A' }
            ]}>
              {title}
            </Text>
            <Text style={styles.alertMessage}>{message}</Text>
            <View style={[
              styles.alertButtonsContainer, 
              { flexDirection: showCancel ? 'row' : 'column' }
            ]}>
              {showCancel && (
                <TouchableOpacity 
                  style={[styles.alertButton, styles.alertButtonOutline]} 
                  onPress={onClose}
                >
                  <Text style={[styles.alertButtonText, { color: colors.text }]}>
                    {cancelText}
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity 
                style={[
                  styles.alertButton, 
                  { backgroundColor: colors.button },
                  !showCancel && { marginTop: 8 }
                ]} 
                onPress={onConfirm || onClose}
              >
                <Text style={[styles.alertButtonText, { color: '#fff' }]}>
                  {confirmText}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '80%',
    maxWidth: 320,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  alertContent: {
    padding: 24,
    alignItems: 'center',
  },
  alertTitle: {
    fontSize: 18,
    color: '#1A1A1A',
    fontFamily: 'Inter_600SemiBold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  alertMessage: {
    fontSize: 14,
    color: '#64748B',
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
    paddingHorizontal: 8,
  },
  alertButtonsContainer: {
    width: '100%',
    gap: 8,
  },
  alertButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  alertButtonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#4C35E3',
  },
  alertButtonText: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    textAlign: 'center',
  },
});
