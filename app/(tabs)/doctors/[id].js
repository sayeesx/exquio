import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { handleScroll } from '../_layout';
import defaultAvatar from '../../../assets/default-avatar.png';
import LoadingAnimation from '../../../components/LoadingAnimation';
import { fetchDoctorById, transformDoctorData } from '../../../services/doctorService';

// Sample doctors data (combine all doctors from hospitals)
const doctors = [
  {
    id: '101',
    name: 'Dr. Arun Kumar',
    specialty: 'Cardiology',
    image: require('../../../assets/main-logos/icon.png'),
    image: require('../../../assets/main-logos/icon.png'),
    experience: '15 years',
    rating: 4.8,
    qualifications: 'MBBS, MD (Cardiology)',
    languages: ['English', 'Malayalam', 'Hindi'],
    consultationFee: '₹800',
    about: 'Dr. Arun Kumar is a highly experienced cardiologist with expertise in interventional cardiology and heart disease management. He has successfully treated thousands of patients and is known for his patient-centric approach.',
    specializations: [
      'Interventional Cardiology',
      'Heart Disease Management',
      'Cardiac Rehabilitation',
      'Preventive Cardiology'
    ],
    availability: {
      monday: '9:00 AM - 5:00 PM',
      tuesday: '9:00 AM - 5:00 PM',
      wednesday: '9:00 AM - 5:00 PM',
      thursday: '9:00 AM - 5:00 PM',
      friday: '9:00 AM - 5:00 PM',
      saturday: '9:00 AM - 1:00 PM'
    },
    hospital: {
      id: '1',
      name: 'KIMS Hospital',
      location: 'Kottakkal Main Road'
    }
  }
  // ... add other doctors
];

// Add default doctor structure
const defaultDoctor = {
  id: '',
  name: 'Unknown Doctor',
  specialty: 'General Medicine',
  image: null,
  experience: 'N/A',
  rating: 0,
  qualifications: '',
  languages: [],
  consultationFee: 'N/A',
  about: 'Information not available',
  specializations: [],
  availability: {
    monday: '',
    tuesday: '',
    wednesday: '',
    thursday: '',
    friday: '',
    saturday: ''
  },
  hospital: {
    id: '',
    name: 'Unknown Hospital',
    location: 'Location not available'
  }
};

export default function DoctorDetail() {
  const params = useLocalSearchParams();
  const router = useRouter();
  // Initialize doctor state with defaultDoctor
  const [doctor, setDoctor] = useState(defaultDoctor);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Update the useMemo with better error handling
  const parsedDoctorData = useMemo(() => {
    if (!params?.doctorData) return defaultDoctor;
    try {
      const parsed = JSON.parse(params.doctorData) || {};
      return {
        ...defaultDoctor,
        ...parsed,
        hospital: { 
          ...defaultDoctor.hospital, 
          ...(parsed?.hospital || {}) 
        },
        availability: { 
          ...defaultDoctor.availability, 
          ...(parsed?.availability || {}) 
        },
        specializations: parsed?.specializations || [],
        languages: parsed?.languages || []
      };
    } catch (e) {
      console.error('Error parsing doctor data:', e);
      return defaultDoctor;
    }
  }, [params?.doctorData]);

  useEffect(() => {
    const loadDoctorData = async () => {
      try {
        setIsLoading(true);
        let doctorInfo = defaultDoctor;

        if (params?.doctorData) {
          try {
            const parsed = JSON.parse(params.doctorData) || {};
            doctorInfo = {
              ...defaultDoctor,
              ...parsed,
              hospital: { 
                ...defaultDoctor.hospital, 
                ...(parsed?.hospital || {}) 
              },
              availability: { 
                ...defaultDoctor.availability, 
                ...(parsed?.availability || {}) 
              },
              specializations: parsed?.specializations || [],
              languages: parsed?.languages || []
            };
          } catch (e) {
            console.error('Error parsing doctor data:', e);
          }
        } else if (params?.id) {
          const rawDoctorData = await fetchDoctorById(params.id);
          if (rawDoctorData) {
            const transformed = transformDoctorData(rawDoctorData);
            doctorInfo = {
              ...defaultDoctor,
              ...transformed,
              hospital: { 
                ...defaultDoctor.hospital, 
                ...(transformed?.hospital || {}) 
              },
              availability: { 
                ...defaultDoctor.availability, 
                ...(transformed?.availability || {}) 
              }
            };
          }
        }

        setDoctor(doctorInfo);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error('Error loading doctor:', err);
        setDoctor(defaultDoctor);
      } finally {
        setIsLoading(false);
      }
    };

    loadDoctorData();
  }, [params?.id, params?.doctorData]);

  // Add safety check before rendering
  if (!doctor || typeof doctor !== 'object') {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>Invalid doctor data</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => router.back()}
        >
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <LoadingAnimation />
      </View>
    );
  }

  if (error || !doctor) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>Could not load doctor information</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => router.back()}
        >
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const weekDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
      </TouchableOpacity>

      <ScrollView 
        style={styles.scrollView}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <View style={styles.header}>
          <Image 
            source={doctor.image ? doctor.image : defaultAvatar} 
            style={styles.doctorImage}
            defaultSource={defaultAvatar}
          />
          <View style={styles.overlay} />
          <View style={styles.headerContent}>
            <Text style={styles.name}>{doctor.name}</Text>
            <Text style={styles.specialty}>{doctor.specialty}</Text>
            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <MaterialCommunityIcons name="star" size={20} color="#0000FF" />
                <Text style={styles.statText}>{doctor.rating}</Text>
              </View>
              <View style={styles.stat}>
                <MaterialCommunityIcons name="clock-outline" size={20} color="#0000FF" />
                <Text style={styles.statText}>{doctor.experience}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.content}>
          {/* Hospital Info */}
          <TouchableOpacity 
            style={styles.hospitalCard}
            onPress={() => router.push(`/hospitals/${doctor.hospital.id}`)}
          >
            <MaterialCommunityIcons name="hospital-building" size={24} color="#6B4EFF" />
            <View style={styles.hospitalInfo}>
              <Text style={styles.hospitalName}>{doctor.hospital.name}</Text>
              <Text style={styles.hospitalLocation}>{doctor.hospital.location}</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#666" />
          </TouchableOpacity>

          {/* About Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.aboutText}>{doctor.about}</Text>
          </View>

          {/* Specializations Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Specializations</Text>
            {doctor.specializations.map((spec, index) => (
              <View key={index} style={styles.specializationItem}>
                <MaterialCommunityIcons name="check-circle" size={20} color="#6B4EFF" />
                <Text style={styles.specializationText}>{spec}</Text>
              </View>
            ))}
          </View>

          {/* Languages Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Languages</Text>
            <View style={styles.languagesContainer}>
              {doctor.languages.map((language, index) => (
                <View key={index} style={styles.languageTag}>
                  <Text style={styles.languageText}>{language}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Availability Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Availability</Text>
            {weekDays.map((day) => (
              doctor.availability[day] && (
                <View key={day} style={styles.availabilityRow}>
                  <Text style={styles.dayText}>{day.charAt(0).toUpperCase() + day.slice(1)}</Text>
                  <Text style={styles.timeText}>{doctor.availability[day]}</Text>
                </View>
              )
            ))}
          </View>

          {/* Book Appointment Button */}
          <TouchableOpacity 
            style={styles.bookButton}
            onPress={() => router.push(`/appointment/${doctor.id}`)}
          >
            <Text style={styles.bookButtonText}>Book Appointment</Text>
            <Text style={styles.consultationFee}>Consultation Fee: {doctor.consultationFee}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 20,
    zIndex: 1,
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    height: 300,
    position: 'relative',
  },
  doctorImage: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  headerContent: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 10,
    borderRadius: 10,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  specialty: {
    fontSize: 18,
    color: '#333',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statText: {
    color: '#0000FF',
    marginLeft: 4,
    fontSize: 16,
  },
  content: {
    padding: 20,
  },
  hospitalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  hospitalInfo: {
    flex: 1,
    marginLeft: 12,
  },
  hospitalName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  hospitalLocation: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  aboutText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  specializationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  specializationText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
  languagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  languageTag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  languageText: {
    color: '#666',
    fontSize: 14,
  },
  availabilityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dayText: {
    fontSize: 16,
    color: '#333',
  },
  timeText: {
    fontSize: 16,
    color: '#666',
  },
  bookButton: {
    backgroundColor: '#6B4EFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  consultationFee: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.9,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#3B39E4',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});
