import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  TextInput,
  Alert,
  Linking,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
  Animated,
  ScrollView, // Add this import
  Pressable, // Add this import
} from 'react-native';
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { secureLog } from '../utils/secureLogging';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { LinearGradient } from 'expo-linear-gradient'; // Add this import

// Move fallbackImage outside components so it's accessible to all
const fallbackImage = require('../assets/ambulance.png');

const EmergencyButton = ({ onCall, isLoading }) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const startShimmer = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(shimmerAnim, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    startShimmer();
  }, []);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.emergencyButton,
        pressed && styles.buttonPressed
      ]}
      onPress={() => !isLoading && onCall('112')}
      disabled={isLoading}
    >
      <MaterialCommunityIcons name="ambulance" size={32} color="#fff" />
      <Animated.View
        style={[
          styles.emergencyButtonContent,
          {
            opacity: shimmerAnim.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [1, 0.5, 1],
            }),
          },
        ]}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.emergencyButtonText}>Call Emergency (112)</Text>
        )}
      </Animated.View>
    </Pressable>
  );
};

const EmergencySection = ({ onCall }) => (
  <View style={styles.emergencySection}>
    <EmergencyButton onCall={onCall} />
  </View>
);

const AmbulanceItem = ({ item, onCall, callLoading }) => (
  <Pressable
    key={item.id}
    style={({ pressed }) => [
      styles.ambulanceItem,
      !item.is_available && styles.unavailableAmbulance,
      pressed && !item.is_available && styles.unavailablePressed,
      pressed && item.is_available && styles.buttonPressed
    ]}
    onPress={() => item.is_available && onCall(item.phone_number)}
    disabled={!item.is_available || callLoading}
  >
    <View style={styles.ambulanceLeftSection}>
      <Image 
        source={item.image_url ? { uri: item.image_url } : fallbackImage}
        style={[
          styles.ambulanceImage,
          !item.is_available && styles.unavailableImage
        ]}
        resizeMode="cover"
      />
      <View style={styles.ambulanceInfo}>
        <Text style={styles.ambulanceName}>{item.name}</Text>
        <Text style={styles.ambulanceLocation}>{item.location}</Text>
        <View style={styles.statusContainer}>
          <View style={[
            styles.statusDot,
            item.is_available ? styles.availableDot : styles.unavailableDot
          ]} />
          <Text style={[
            styles.statusText,
            !item.is_available && styles.unavailableText
          ]}>
            {item.is_available ? 'Available' : 'Not Available'}
          </Text>
        </View>
      </View>
    </View>
    {item.is_available && (
      <Pressable 
        style={({ pressed }) => [
          styles.callButton,
          pressed && styles.buttonPressed
        ]}
        onPress={() => onCall(item.phone_number)}
        disabled={callLoading}
      >
        {callLoading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <MaterialCommunityIcons name="phone" size={24} color="#fff" />
        )}
      </Pressable>
    )}
  </Pressable>
);

export default function AmbulanceModal({ visible, onClose, emergencyContact }) {
  const [ambulances, setAmbulances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [callLoading, setCallLoading] = useState(false);
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    loadAmbulances();
  }, []);

  const loadAmbulances = async () => {
    setLoading(true);
    setError(null);
    try {
      secureLog('Starting ambulance fetch'); // Changed from console.log

      const { data, error } = await supabase
        .from('ambulances')
        .select('*')
        .order('name');
      
      if (error) {
        secureLog('Supabase error', { 
          message: error.message,
          code: error.code 
        });
        throw error;
      }

      if (!data || data.length === 0) {
        secureLog('No ambulances found');
      } else {
        secureLog('Successfully fetched ambulances', data); // This will automatically sanitize sensitive data
      }

      setAmbulances(data || []);
    } catch (error) {
      secureLog('Failed to load ambulances', { 
        message: error.message,
        code: error?.code 
      });
      setError(`Failed to load ambulances: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCall = async (number) => {
    setCallLoading(true);
    try {
      await Linking.openURL(`tel:${number}`);
    } catch (error) {
      Alert.alert('Error', 'Unable to make call');
    } finally {
      setCallLoading(false);
    }
  };

  if (!fontsLoaded) {
    return <ActivityIndicator size="large" color="#3B39E4" />;
  }

  return (
    <Modal
      visible={visible}
      transparent={true}
      onRequestClose={onClose}
      statusBarTranslucent={true}
      animationType="none" // Change this from "slide" to "none"
    >
      <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
        <TouchableOpacity 
          style={styles.backdropTouchable}
          activeOpacity={1}
          onPress={onClose}
        />

        {/* Close Button - Add this */}
        <Pressable 
          style={({ pressed }) => [
            styles.closeButton,
            pressed && styles.buttonPressed
          ]}
          onPress={onClose}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MaterialCommunityIcons name="close" size={28} color="#ccc" />
        </Pressable>

        <Animated.View
          style={[
            styles.modalWrapper,
            {
              transform: [
                {
                  translateY: visible ? 0 : 400 // Only animate the modal content
                }
              ]
            }
          ]}
        >
          <View style={styles.handleBar} />
          
          <ScrollView 
            style={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.headerSpacing}>
              <Text style={styles.title}>Emergency Services</Text>
              <EmergencySection onCall={handleCall} />
            </View>
            
            <View style={styles.ambulancesSection}>
              <Text style={styles.sectionTitle}>Available Ambulances</Text>
              {loading ? (
                <ActivityIndicator size="large" color="#3B39E4" />
              ) : error ? (
                <View style={styles.errorContainer}>
                  <MaterialCommunityIcons name="alert-circle" size={24} color="#FF4757" />
                  <Text style={styles.errorText}>{error}</Text>
                  <TouchableOpacity style={styles.retryButton} onPress={loadAmbulances}>
                    <Text style={styles.retryText}>Retry</Text>
                  </TouchableOpacity>
                </View>
              ) : ambulances?.length > 0 ? (
                <ScrollView showsVerticalScrollIndicator={false}>
                  {ambulances.map(item => (
                    <AmbulanceItem 
                      key={item.id}
                      item={item} 
                      onCall={handleCall}
                      callLoading={callLoading}
                    />
                  ))}
                </ScrollView>
              ) : (
                <View style={styles.noDataContainer}>
                  <MaterialCommunityIcons name="ambulance-alert" size={48} color="#666" />
                  <Text style={styles.noDataText}>No ambulances available</Text>
                </View>
              )}
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalWrapper: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
    width: '100%',
    paddingTop: 15,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 130,
    right: 20,
    zIndex: 1000,
    padding: 8,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#DDD',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  contentContainer: {
    flexGrow: 0,
  },
  headerSpacing: {
    marginTop: 20,
    paddingHorizontal: 10,
  },
  title: {
    fontSize: 24,
    marginTop: 20,
    fontFamily: 'Inter_700Bold',
  },
  emergencyButton: {
    backgroundColor: '#FF0000',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    marginTop: 20,
    borderRadius: 10,
    marginBottom: 0,
  },
  emergencyButtonText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    marginLeft: 10,
  },
  emergencyButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emergencySection: {
    marginBottom: 20,
  },
  ambulancesSection: {
    backgroundColor: '#f8f9fa',
    borderRadius: 15,
    padding: 15,
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 10,
  },
  ambulanceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    activeOpacity: 0.7,
  },
  ambulanceLeftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  ambulanceImage: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    marginRight: 15,
  },
  ambulanceInfo: {
    flex: 1,
    marginLeft: 10,
  },
  ambulanceName: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
  },
  ambulanceLocation: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#666',
  },
  callButton: {
    backgroundColor: '#FF4433',
    padding: 10,
    borderRadius: 30,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF5F5',
    borderRadius: 10,
  },
  errorText: {
    color: '#FF4757',
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    marginVertical: 10,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#3B39E4',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  retryText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    fontWeight: '500',
  },
  noDataContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noDataText: {
    marginTop: 10,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#666',
    textAlign: 'center',
  },
  backdropTouchable: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  buttonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  unavailableAmbulance: {
    opacity: 0.7,
    backgroundColor: '#f5f5f5',
  },
  unavailablePressed: {
    opacity: 0.5,
  },
  unavailableImage: {
    opacity: 0.5,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  availableDot: {
    backgroundColor: '#008000',
  },
  unavailableDot: {
    backgroundColor: '#FF4757',
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: '#008000',
  },
  unavailableText: {
    color: '#FF4757',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 32,
  },
  emergencyHeader: {
    padding: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  emergencyTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  modalBody: {
    padding: 20,
  },
  description: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 20,
  },
  callButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  closeButtonText: {
    color: '#64748B',
    fontSize: 16,
    fontWeight: '600',
  },
});
