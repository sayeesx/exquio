import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { supabase } from '../lib/supabase';
import { Shimmer } from './Shimmer';

const { width } = Dimensions.get('window');

const getSpecialtyIcon = (specialty) => {
  if (!specialty) return 'doctor';
  
  switch (specialty.toLowerCase()) {
    case 'cardiology': return 'heart-pulse';
    case 'neurology': return 'brain';
    case 'pediatrics': return 'baby-face';
    case 'orthopedics': return 'bone';
    case 'dermatology': return 'face-man';
    case 'ophthalmology': return 'eye';
    case 'dentistry': return 'tooth';
    case 'psychiatry': return 'brain';
    case 'general medicine': return 'doctor';
    default: return 'doctor';
  }
};

const DoctorCard = ({ doctor, onPress }) => {
  const [imageLoading, setImageLoading] = useState(true);
  const imageUrl = doctor.image_url;

  return (
    <View style={styles.doctorCard}>
      <Image 
        source={{ uri: imageUrl }}
        style={styles.doctorImage}
        resizeMode="cover"
        onLoad={() => setImageLoading(false)}
      />
      <View style={styles.doctorInfo}>
        <Text style={styles.doctorName} numberOfLines={1}>
          {doctor.name}
        </Text>
        <View style={styles.infoRow}>
          <Text style={styles.specialtyText}>
            {doctor.specialty?.name || 'Specialist'}
          </Text>
          <TouchableOpacity 
            style={styles.bookingButton}
            onPress={() => onPress(doctor)}
            activeOpacity={0.8}
          >
            <Text style={styles.bookingButtonText}>Book</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Icon name="star" size={14} color="#FFD700" />
            <Text style={styles.statText}>4.5</Text>
          </View>
          <Text style={styles.experience}>
            5+ Years
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  doctorCard: {
    width: 320,
    height: 140,
    marginRight: 16,
    backgroundColor: '#F5F5F5',
    flexDirection: 'row',
    padding: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  doctorImage: {
    width: 110,
    height: 110,
    borderRadius: 10,
    marginRight: 16,
  },
  doctorInfo: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  doctorName: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: "#333",
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  specialtyText: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: "#3B39E4",
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: '#333',
    marginLeft: 4,
  },
  experience: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#666',
  },
  bookingButton: {
    backgroundColor: "#3B39E4",
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 6,
    justifyContent: 'center',
    minWidth: 70,
  },
  bookingButtonText: {
    color: "#fff",
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
  },
});

export default DoctorCard;