import React, { useState, useEffect } from 'react';
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
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    // Set timeout for shimmer effect
    const timer = setTimeout(() => {
      if (imageLoading) {
        setImageLoading(false);
        setImageError(true);
      }
    }, 60000); // 1 minute timeout

    return () => clearTimeout(timer);
  }, [imageLoading]);

  // Use the pre-transformed image URL directly
  const imageUrl = doctor.image_url;

  return (
    <TouchableOpacity style={styles.doctorCard} onPress={() => onPress(doctor)}>
      <View style={styles.imageContainer}>
        {(imageLoading || !imageUrl || imageError) && (
          <Shimmer width={90} height={90} style={styles.shimmer} />
        )}
        {imageUrl && !imageError && (
          <Image 
            source={{ uri: imageUrl }}
            style={[styles.doctorImage, !imageLoading && styles.loadedImage]}
            resizeMode="cover"
            onLoadStart={() => {
              setImageLoading(true);
              setImageError(false);
            }}
            onLoad={() => setImageLoading(false)}
            onError={() => {
              setImageLoading(false);
              setImageError(true);
            }}
          />
        )}
      </View>
      <View style={styles.doctorInfo}>
        <Text style={styles.doctorName} numberOfLines={1}>
          {doctor.name}
        </Text>
        <View style={styles.specialtyChip}>
          <Icon name={getSpecialtyIcon(doctor.specialty?.name)} size={14} color="#3B39E4" />
          <Text style={styles.specialtyText}>
            {doctor.specialty?.name || 'Specialist'}
          </Text>
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
      <TouchableOpacity 
        style={styles.bookingButton}
        onPress={() => onPress(doctor)}
      >
        <Text style={styles.bookingButtonText}>Book</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  doctorCard: {
    width: 300, // Fixed width instead of relative
    height: 120,
    marginRight: 16,
    backgroundColor: '#F5F5F5',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    width: 90, // Increased size
    height: 90, // Increased size
    borderRadius: 10,
    overflow: 'hidden',
    marginRight: 16,
    backgroundColor: '#E8E8E8',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  doctorImage: {
    width: '100%',
    height: '100%',
  },
  doctorInfo: {
    flex: 1,
    gap: 6, // Increased gap
    paddingVertical: 4,
  },
  doctorName: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: "#333",
  },
  specialtyChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(59, 57, 228, 0.1)",
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  specialtyText: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: "#3B39E4",
    marginLeft: 4,
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
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center',
  },
  bookingButtonText: {
    color: "#fff",
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
  },
  shimmer: {
    position: 'absolute',
    borderRadius: 10,
  },
  loadedImage: {
    opacity: 1,
  },
});

export default DoctorCard;