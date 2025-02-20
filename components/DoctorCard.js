import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { supabase } from '../lib/supabase';

const DoctorCard = ({ doctor, onPress }) => {
  // Get the full image URL from Supabase storage
  const imageUrl = doctor.avatar_url
    ? `${supabase.supabaseUrl}/storage/v1/object/public/doctor_avatars/${doctor.avatar_url}`
    : 'https://www.pngitem.com/pimgs/m/146-1468479_my-profile-icon-blank-profile-picture-circle-hd.png';

  const getSpecialtyIcon = (specialty) => {
    switch (specialty?.toLowerCase()) {
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

  return (
    <View style={styles.doctorCard}>
      <BlurView intensity={80} tint="light" style={styles.doctorCardContent}>
        <View style={styles.doctorImageContainer}>
          <Image 
            source={{ uri: imageUrl }} 
            style={styles.doctorImage} 
            resizeMode="cover"
            defaultSource={require('../assets/default-avatar.png')}
          />
        </View>
        <View style={styles.doctorInfo}>
          <Text style={styles.doctorName} numberOfLines={1}>
            {doctor.name || 'Dr. Unknown'}
          </Text>
          <View style={styles.specialtyChip}>
            <Icon name={getSpecialtyIcon(doctor.specialty)} size={14} color="#3B39E4" />
            <Text style={styles.specialtyText}>
              {doctor.specialty || 'General Medicine'}
            </Text>
          </View>
          <Text style={styles.fieldOfStudy} numberOfLines={2}>
            {doctor.qualification || 'Medical Professional'}
          </Text>
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Icon name="star" size={12} color="#FFD700" />
              <Text style={styles.statText}>{doctor.rating || '4.5'}</Text>
            </View>
            <Text style={styles.experience}>
              {doctor.experience_years ? `${doctor.experience_years}+ Years` : 'Experienced'}
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.bookingButton} 
            onPress={() => onPress(doctor)}
          >
            <Text style={styles.bookingButtonText}>Book Now</Text>
            <Icon name="calendar-plus" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  doctorCard: {
    width: 300,
    marginRight: 16,
    borderRadius: 16,
    overflow: "hidden",
  },
  doctorCardContent: {
    flexDirection: "row",
    padding: 12,
  },
  doctorImageContainer: {
    width: 100,
    height: 140,
    borderRadius: 12,
    overflow: "hidden",
    marginRight: 12,
  },
  doctorImage: {
    width: "100%",
    height: "100%",
  },
  doctorInfo: {
    flex: 1,
    justifyContent: "space-between",
  },
  doctorName: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: "#000",
    marginBottom: 8,
  },
  specialtyChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(59, 57, 228, 0.1)",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  specialtyText: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: "#3B39E4",
    marginLeft: 4,
  },
  fieldOfStudy: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: "#666",
    marginBottom: 8,
  },
  bookingButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3B39E4",
    padding: 8,
    borderRadius: 8,
    gap: 4,
  },
  bookingButtonText: {
    color: "#fff",
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: '#666',
    marginLeft: 4,
  },
  experience: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#666',
  },
});

export default DoctorCard;