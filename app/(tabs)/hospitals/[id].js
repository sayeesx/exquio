import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Animated, Easing, Linking, RefreshControl } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../../../lib/supabase';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import FloatingBookButton from '../../../components/FloatingBookButton';
import AnimatedClock from '../../../components/AnimatedClock';
import AmbulanceModal from '../../../components/AmbulanceModal';
import { secureLog } from '../../../utils/secureLogging';
import { checkSupabaseConnection } from '../../../lib/supabase';
import { Stethoscope, Building2, Star, ChevronRight, ArrowLeft, MapPin, Phone, Mail, Clock, Calendar } from 'lucide-react-native';

const styles = StyleSheet.create({
  // Core Layout Styles
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradientBackground: {
    flex: 1,
  },

  // Hero Section
  heroSection: {
    height: 250,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  backButton: {
    position: 'absolute',
    top: 14,
    left: 6,
    zIndex: 2,
    padding: 8,
  },
  backButtonWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  

  // Content Layout
  contentContainer: {
    flex: 1,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    padding: 16,
    paddingBottom: 60,
  },
  
// Hospital info
hospitalInfoSection: {
  marginTop: 24,
},
hospitalName: {
  fontSize: 24,
  fontWeight: 'bold',
  color: '#1E293B',
  marginBottom: -4,
},

  // Doctor Card Styles
  doctorCard: {
    width: 160,
    height: 240,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginRight: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    height:'70%', // Decreased from 160
    backgroundColor: '#f0f0f0',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: 'hidden',
    marginTop: 0, // Decreased from 8
  },
  doctorImage: {
    width: '100%',
    height: '95%',
    resizeMode: 'cover',
    marginTop: 8,
  },
  doctorInfo: {
    padding: 12,
    flex: 1,
    justifyContent: 'flex-start',
    gap: 4,
  },
  doctorName: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: '#1A1A1A',
    marginTop: -7,
  },
  doctorSpeciality: {
    fontSize: 12,
    color: '#0284C7',
    fontFamily: 'Inter_500Medium',
    marginBottom: 2,
  },
  
  // Stats and ratings
  doctorStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2, // Reduced margin
    gap: 6, // Added gap between rating and experience
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  
  // Section headers
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  
  // See all button
  seeAllButtonWrapper: {
    overflow: 'hidden',
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#4C35E3',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  seeAllGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  seeAllText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    marginRight: 4,
  },

  // Loading and error states
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Location button styles
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  locationText: {
    marginLeft: 6,
    color: '#3B39E4',
    fontSize: 13,
    fontWeight: '600',
  },

  // Stats section
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    margin: 6,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#4C35E3',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  statValue: {
    fontSize: 24,
    fontFamily: 'Inter_700Bold',
    color: '#1E293B',
    marginVertical: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: '#64748B',
    textAlign: 'center',
  },
  statIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },

  // Fee container styles
  feeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 2, // Reduced margin
  },
  feeText: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
    color: '#2E7D32',
    marginLeft: 2,
  },

  // Experience text
  experienceText: {
    fontSize: 11,
    color: '#64748B',
    fontFamily: 'Inter_400Regular',
  },

  // Hospital header styles
  hospitalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  hospitalHeaderInfo: {
    flex: 1,
    marginLeft: 12,
    marginTop: 4,
  },
  hospitalLogo: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#f8fafc',
  },

  // Popular doctors section
  popularDoctorsSection: {
    marginTop: -4, // Reduced from 16 to move section up
  },

  // Working Hours styles
  workingHoursCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginVertical: 12,
    shadowColor: '#4C35E3',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  workingHoursContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
  },
  workingHoursRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  workingHoursLabel: {
    fontSize: 14,
    color: '#64748B',
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 4,
  },
  workingHoursText: {
    fontSize: 16,
    color: '#1E293B',
    fontFamily: 'Inter_700Bold',
  },

  // Emergency section
  emergencyContainer: {
    marginTop: 12,
  },
  emergencyGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  emergencyInfo: {
    flex: 1,
    marginLeft: 12,
  },
  emergencyLabel: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 4,
  },
  emergencyText: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter_700Bold',
  },

  // Weekend section
  weekendContainer: {
    marginTop: 12,
  },
  weekendGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
  },
  weekendInfo: {
    flex: 1,
    marginLeft: 12,
  },
  weekendLabel: {
    fontSize: 14,
    color: '#4C35E3',
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 4,
  },
  weekendText: {
    fontSize: 16,
    color: '#1E293B',
    fontFamily: 'Inter_700Bold',
  },

  // Section containers
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    color: '#1E293B',
    marginBottom: 12,
  },

  // Features section
  featuresGrid: {
    marginTop: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#4C35E3',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  featureText: {
    fontSize: 16,
    color: '#1E293B',
    fontFamily: 'Inter_600SemiBold',
    marginLeft: 12,
    flex: 1,
  },

  // Contact section
  contactSection: {
    padding: 16,
    borderRadius: 16,
    marginTop: 16,
    elevation: 2,
    shadowColor: '#4C35E3',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366F1',
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
    elevation: 2,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  contactButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    marginLeft: 12,
  },

  // About Section styles
  aboutSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginVertical: 12,
    elevation: 3,
    shadowColor: '#4C35E3',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
    color: '#334155',
    fontFamily: 'Inter_400Regular',
  },

  // Facilities styles
  facilitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  facilityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    elevation: 1,
    shadowColor: '#4C35E3',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    flex: 0, // Changed from 1
    minWidth: '45%', // Added to control width
  },
  facilityIcon: {
    marginRight: 8,
    color: '#4C35E3',
  },
  facilityText: {
    fontSize: 13, // Reduced from 16
    color: '#4C35E3',
    fontFamily: 'Inter_500Medium',
  },

  // Popular Doctors section
  doctorsScroll: {
    marginTop: 12,
  },

  // Specialties section
  specialitiesWrapper: {
    position: 'relative',
    height: 60,
    marginHorizontal: -16,
    marginTop: 10,
  },
  specialitiesContainer: {
    height: '100%',
    overflow: 'hidden',
    paddingHorizontal: 16,
  },
  specialitiesTrack: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  specialityTag: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.1)',
  },
  specialityText: {
    color: '#4C35E3',
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
  },
  carouselFadeLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 40,
    zIndex: 1,
  },
  carouselFadeRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 40,
    zIndex: 1,
  },

  // Section Header styles
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    marginTop: 24,
  },
  sectionHeaderLeft: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    color: '#1E293B',
    fontFamily: 'Inter_600SemiBold',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#64748B',
    fontFamily: 'Inter_400Regular',
    marginTop: 4,
  },

  // ViewMore Button
  viewMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  viewMoreText: {
    color: '#4C35E3',
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    marginRight: 4,
  },

  // ...remaining existing styles...
});

const HospitalDetail = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [hospital, setHospital] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [popularDoctors, setPopularDoctors] = useState([]);
  const buttonAnimation = useRef(new Animated.Value(0)).current;
  const scrollY = useRef(new Animated.Value(0)).current;
  const scrollX = useRef(new Animated.Value(0)).current;
  const specialitiesAnimation = useRef(null);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [showAllFacilities, setShowAllFacilities] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const gradients = useMemo(() => ({
    primary: ["#4C35E3", "#4B47E5", "#5465FF"],
    secondary: ["#3B82F6", "#2563EB", "#1D4ED8"],
    accent: ["#6366F1", "#4F46E5", "#4338CA"],
    success: ["#10B981", "#059669", "#047857"],
  }), []);

  const fetchHospitalDetails = async () => {
    let isMounted = true;
    try {
      setLoading(true);
      setError(null);
      
      if (!id) {
        throw new Error('Hospital ID is required');
      }
  
      const { data: hospitalData, error: hospitalError } = await supabase
        .from('hospitals')
        .select(`
          id,
          name,
          location,
          location_link,
          image_url,
          logo_url,
          type,
          emergency_contact,
          email,
          rating,
          description,
          facilities,
          doctors_count,
          established_year,
          working_hours,
          insurance_accepted,
          hospital_specialties (
            specialty:specialties (
              id,
              name,
              description
            )
          )
        `)
        .eq('id', id)
        .single();
  
      if (hospitalError) {
        if (hospitalError.code === 'PGRST116') {
          throw new Error('Hospital not found');
        }
        throw hospitalError;
      }
  
      const transformedHospital = {
        ...hospitalData,
        specialities: hospitalData?.hospital_specialties?.map(hs => hs.specialty.name) || []
      };
      
      if (isMounted) {
        setHospital(transformedHospital);
      }
  
    } catch (err) {
      console.error('Fetch error:', err);
      if (isMounted) {
        setError(
          err.message === 'Hospital not found' 
            ? 'Hospital not found' 
            : 'Unable to load hospital details. Please try again.'
        );
      }
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }

    return () => {
      isMounted = false;
    };
  };
  

  const fetchPopularDoctors = async () => {
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select(`
          id,
          name,
          specialty:specialty_id (
            name
          ),
          image_url,
          avatar_url,
          rating,
          experience_years,
          qualification,
          consultation_fee
        `)
        .eq('hospital_id', id)
        .order('rating', { ascending: false })
        .limit(3);

      if (error) throw error;

      setPopularDoctors(data?.map(doctor => ({
        ...doctor,
        specialty: doctor.specialty?.name,
        image_url: doctor.image_url || doctor.avatar_url, // Use image_url if available, fallback to avatar_url
        rating: doctor.rating || 4.5,
        experience: doctor.experience_years ? `${doctor.experience_years} Years` : null
      })));
    } catch (err) {
      console.error('Error fetching doctors:', err.message);
    }
  };

  useEffect(() => {
    if (id) {
      fetchHospitalDetails();
      fetchPopularDoctors();

      // Subscribe to real-time updates for this specific hospital
      const channel = supabase
        .channel(`hospital_${id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'hospitals',
            filter: `id=eq.${id}`
          },
          async (payload) => {
            console.log('Hospital detail update:', payload);
            if (payload.eventType === 'UPDATE') {
              setHospital(payload.new);
            } else if (payload.eventType === 'DELETE') {
              // Handle hospital deletion
              setError('This hospital is no longer available');
              router.replace('/hospitals');
            }
          }
        )
        .subscribe();

      // Subscribe to associated doctors updates
      const doctorsChannel = supabase
        .channel(`hospital_${id}_doctors`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'doctors',
            filter: `hospital_id=eq.${id}`
          },
          async (payload) => {
            console.log('Doctors update:', payload);
            // Refresh doctors list on any change
            const { data } = await supabase
              .from('doctors')
              .select('*')
              .eq('hospital_id', id)
              .order('rating', { ascending: false })
              .limit(3);
            setDoctors(data || []);
          }
        )
        .subscribe();

      // Cleanup subscriptions
      return () => {
        channel.unsubscribe();
        doctorsChannel.unsubscribe();
      };
    }
  }, [id]);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const { data: doctorsData } = await supabase
          .from('doctors')
          .select('*')
          .eq('hospital_id', id)
          .order('rating', { ascending: false })
          .limit(3);
        
        setDoctors(doctorsData || []);
      } catch (error) {
        console.error('Error fetching doctors:', error);
      }
    };

    if (id) {
      fetchDoctors();
    }
  }, [id]);

  useEffect(() => {
    Animated.timing(buttonAnimation, {
      toValue: 1,
      duration: 500,
      delay: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    let isMounted = true;
    let animationSubscription;

    if (hospital?.specialities?.length) {
      const totalWidth = hospital.specialities.length * 150;
      
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(scrollX, {
            toValue: -totalWidth,
            duration: hospital.specialities.length * 5000, // Increased duration
            useNativeDriver: true,
            easing: Easing.linear,
          }),
          Animated.timing(scrollX, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          })
        ])
      );

      if (isMounted) {
        animationSubscription = animation.start();
      }
    }

    return () => {
      isMounted = false;
      if (animationSubscription) {
        animationSubscription.stop();
      }
    };
  }, [hospital?.specialities]);

  const handleMapPress = async () => {
    if (hospital?.location_link) {
      await Linking.openURL(hospital.location_link);
    } else if (hospital?.location) {
      // Fallback to location search if no direct link
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hospital.location)}`;
      await Linking.openURL(url);
    }
  };

  const handleBack = () => {
    router.push('/(tabs)/hospitals');
  };
  const handleBookAppointment = () => {
    router.push(`/doctors?hospital_id=${id}`);
  };

  const handleScroll = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    scrollY.setValue(offsetY);
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchHospitalDetails(),
        fetchPopularDoctors()
      ]);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const renderSpecialities = () => {
    if (!hospital?.specialities?.length) return null;

    const duplicatedSpecialities = [...hospital.specialities, ...hospital.specialities, ...hospital.specialities];

    return (
      <MotiView style={styles.section}>
        <Text style={styles.sectionTitle}>Specialities</Text>
        <View style={styles.specialitiesWrapper}>
          <LinearGradient
            colors={['#fff', 'transparent']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 0.1, y: 0.5 }}
            style={styles.carouselFadeLeft}
          />
          <View style={styles.specialitiesContainer}>
            <Animated.View
              style={[
                styles.specialitiesTrack,
                {
                  transform: [{ translateX: scrollX }]
                }
              ]}
            >
              {duplicatedSpecialities.map((speciality, index) => (
                <View 
                  key={`${index}`} 
                  style={styles.specialityTag}
                >
                  <Text style={styles.specialityText}>{speciality}</Text>
                </View>
              ))}
            </Animated.View>
          </View>
          <LinearGradient
            colors={['transparent', '#fff']}
            start={{ x: 0.9, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.carouselFadeRight}
          />
        </View>
      </MotiView>
    );
  };

  const renderWorkingHours = () => (
    <LinearGradient colors={cardGradient} style={styles.workingHoursCard}>
      <MotiView style={styles.section}>
        <Text style={styles.sectionTitle}>Working Hours</Text>
        <View style={styles.workingHoursContent}>
          <View style={styles.workingHoursRow}>
            <View style={styles.iconContainer}>
              <Clock size={24} color="#4C35E3" />
            </View>
            <View style={styles.workingHoursInfo}>
              <Text style={styles.workingHoursLabel}>Weekdays</Text>
              <Text style={styles.workingHoursText}>{workingHours.weekdays}</Text>
            </View>
          </View>
          
          <View style={styles.weekendContainer}>
            <LinearGradient
              colors={['#F8FAFC', '#EEF2FF']}
              style={styles.weekendGradient}
            >
              <Calendar size={24} color="#4C35E3" />
              <View style={styles.weekendInfo}>
                <Text style={styles.weekendLabel}>Weekends</Text>
                <Text style={styles.weekendText}>{workingHours.weekends}</Text>
              </View>
            </LinearGradient>
          </View>

          {workingHours.emergency && (
            <TouchableOpacity 
              activeOpacity={0.95} // Higher value to reduce opacity change
              style={styles.emergencyContainer}
              onPress={() => setShowEmergencyModal(true)}
            >
              <LinearGradient
                colors={['#FF6B6B', '#FF8787']}
                style={styles.emergencyGradient}
              >
                <AnimatedClock isEmergency />
                <View style={styles.emergencyInfo}>
                  <Text style={styles.emergencyLabel}>24/7 Emergency</Text>
                  <Text style={styles.emergencyText}>Tap to call ambulance</Text>
                </View>
                <ChevronRight size={24} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      </MotiView>

      <AmbulanceModal
        visible={showEmergencyModal}
        onClose={() => setShowEmergencyModal(false)}
        emergencyContact={hospital.emergency_contact}
      />
    </LinearGradient>
  );

  const renderFacilities = () => {
    if (!hospital.facilities?.length) return null;
    
    const displayedFacilities = showAllFacilities 
      ? hospital.facilities 
      : hospital.facilities.slice(0, 3);
  
    return (
      <MotiView 
        style={styles.section}
        from={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'timing', delay: 200 }}
      >
        <Text style={styles.sectionTitle}>Facilities</Text>
        <View style={styles.facilitiesGrid}>
          {displayedFacilities.map((facility, index) => (
            <LinearGradient
              key={index}
              colors={['#F8FAFC', '#EEF2FF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.facilityItem}
            >
              <MaterialCommunityIcons 
                name="check-circle" 
                size={24} 
                color="#4C35E3" 
                style={styles.facilityIcon}
              />
              <Text style={styles.facilityText}>{facility}</Text>
            </LinearGradient>
          ))}
        </View>
        {hospital.facilities.length > 3 && (
          <TouchableOpacity 
            style={styles.viewMoreButton}
            onPress={() => setShowAllFacilities(!showAllFacilities)}
          >
            <Text style={styles.viewMoreText}>
              {showAllFacilities ? 'Show Less' : 'View More'}
            </Text>
            <MaterialCommunityIcons 
              name={showAllFacilities ? "chevron-up" : "chevron-down"} 
              size={20} 
              color="#4C35E3" 
            />
          </TouchableOpacity>
        )}
      </MotiView>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContainer]}>
        <ActivityIndicator size="large" color="#6B4EFF" />
      </View>
    );
  }
  if (error) {
    return (
      <View style={[styles.container, styles.centerContainer]}>
        <MaterialCommunityIcons 
          name="alert-circle-outline" 
          size={48} 
          color="#FF6B6B" 
        />
        <Text style={[styles.errorText, { marginTop: 16 }]}>
          {error}
        </Text>
        <TouchableOpacity 
          style={[styles.retryButton, { marginTop: 16 }]}
          onPress={() => fetchHospitalDetails()}
        >
          <MaterialCommunityIcons name="refresh" size={20} color="#fff" />
          <Text style={[styles.retryText, { marginLeft: 8 }]}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const workingHours = hospital.working_hours || {
    weekdays: "9:00 AM - 9:00 PM",
    weekends: "9:00 AM - 5:00 PM",
    emergency: "24/7"
  };

  const headerGradient = ['#ffffff', '#f8fafc'];
  const cardGradient = ['#ffffff', '#f1f5f9'];
  const buttonGradient = ['#6366F1', '#4F46E5'];

  const renderDoctorInfo = (doctor) => (
    <View style={styles.doctorInfo}>
      <Text style={styles.doctorName} numberOfLines={1}>
        {doctor.name}
      </Text>
      <Text style={styles.doctorSpeciality} numberOfLines={1}>
        {doctor.specialty}
      </Text>
      {doctor.experience_years && (
        <Text style={styles.experienceText} numberOfLines={1}>
          {doctor.experience_years} Years Experience
        </Text>
      )}
    </View>
  );

  const renderStats = () => (
    <View style={styles.statsContainer}>
      <MotiView 
        style={styles.statCard}
        from={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 100 }}
      >
        <View style={styles.statIcon}>
          <Stethoscope size={24} color="#6366F1" />
        </View>
        <Text style={styles.statValue}>{hospital?.doctors_count || 'N/A'}</Text>
        <Text style={styles.statLabel}>Doctors</Text>
      </MotiView>

      <MotiView 
        style={styles.statCard}
        from={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 200 }}
      >
        <View style={styles.statIcon}>
          <Building2 size={24} color="#6366F1" />
        </View>
        <Text style={styles.statValue}>{hospital?.specialities?.length || 'N/A'}</Text>
        <Text style={styles.statLabel}>Specialties</Text>
      </MotiView>

      <MotiView 
        style={styles.statCard}
        from={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 300 }}
      >
        <View style={styles.statIcon}>
          <Star size={24} color="#6366F1" />
        </View>
        <Text style={styles.statValue}>
          {hospital?.rating ? hospital.rating.toFixed(1) : 'N/A'}
        </Text>
        <Text style={styles.statLabel}>Rating</Text>
      </MotiView>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#4C35E3']}
            tintColor="#4C35E3"
          />
        }
      >
        <LinearGradient colors={headerGradient} style={styles.gradientBackground}>
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <Image 
              source={{ uri: hospital?.image_url }}
              style={styles.heroImage}
              resizeMode="cover"
            />
            <TouchableOpacity 
              style={styles.backButton}
              onPress={handleBack}
            >
              <LinearGradient
                colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)']}
                style={styles.backButtonWrapper}
              >
                <ArrowLeft size={24} color="#1E293B" />
              </LinearGradient>
            </TouchableOpacity>
            {/* Rating Badge */}
            <View style={styles.ratingBadge}>
              <MaterialCommunityIcons name="star" size={16} color="#FFD700" />
              <Text style={styles.ratingText}>{hospital?.rating?.toFixed(1)}</Text>
            </View>
          </View>

          {/* Main Content */}
          <LinearGradient colors={cardGradient} style={styles.contentContainer}>
            {/* Hospital Info */}
            <View style={styles.hospitalInfoSection}>
              <View style={styles.hospitalHeaderRow}>
                {hospital?.logo_url && (
                  <Image 
                    source={{ uri: hospital.logo_url }}
                    style={styles.hospitalLogo}
                    resizeMode="contain"
                  />
                )}
                <View style={styles.hospitalHeaderInfo}>
                  <Text style={styles.hospitalName}>{hospital?.name}</Text>
                  <TouchableOpacity style={styles.locationButton} onPress={handleMapPress}>
                    <MapPin size={20} color="#3B39E4" />
                    <Text style={styles.locationText}>{hospital?.location}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Stats Section */}
            {renderStats()}

            {/* Features Section */}
            <View style={styles.featuresSection}>
              {/* Working Hours */}
              {renderWorkingHours()}

              {/* Specialities */}
              {renderSpecialities()}

              {/* Popular Doctors */}
              {popularDoctors.length > 0 && (
                <MotiView style={[styles.section, styles.popularDoctorsSection]}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Popular Doctors</Text>
                    <TouchableOpacity 
                      onPress={() => router.push(`/doctors?hospital_id=${id}`)}
                      style={styles.seeAllButtonWrapper}
                    >
                      <LinearGradient
                        colors={['#4C35E3', '#3B39E4']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.seeAllGradient}
                      >
                        <Text style={styles.seeAllText}>See All</Text>
                        <ChevronRight size={20} color="#FFFFFF" />
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false} 
                    style={styles.doctorsScroll}
                    contentContainerStyle={{ paddingHorizontal: 4 }}
                  >
                    {popularDoctors.slice(0, 3).map((doctor, index) => (
                      <MotiView
                        key={doctor.id}
                        from={{ opacity: 0, scale: 0.9, translateX: 20 }}
                        animate={{ opacity: 1, scale: 1, translateX: 0 }}
                        transition={{ 
                          type: 'spring', 
                          delay: 600 + (index * 100),
                          damping: 15
                        }}
                      >
                        <TouchableOpacity 
                          style={styles.doctorCard}
                          onPress={() => router.push(`/doctors/${doctor.id}`)}
                        >
                          <View style={styles.imageContainer}>
                            <Image 
                              source={{ uri: doctor.image_url }}
                              style={styles.doctorImage}
                            />
                          </View>
                          {renderDoctorInfo(doctor)}
                        </TouchableOpacity>
                      </MotiView>
                    ))}
                  </ScrollView>
                </MotiView>
              )}

              {/* Facilities */}
              {renderFacilities()}

              {/* Additional Features */}
              <MotiView 
                style={styles.section}
                from={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'timing', delay: 200 }}
              >
                <Text style={styles.sectionTitle}>Additional Features</Text>
                <View style={styles.featuresGrid}>
                  {hospital.insurance_accepted && (
                    <View style={styles.featureItem}>
                      <MaterialCommunityIcons name="shield-check" size={24} color="#6B4EFF" />
                      <Text style={styles.featureText}>Insurance Accepted</Text>
                    </View>
                  )}
                  {hospital.parking_available && (
                    <View style={styles.featureItem}>
                      <MaterialCommunityIcons name="parking" size={24} color="#6B4EFF" />
                      <Text style={styles.featureText}>Parking Available</Text>
                    </View>
                  )}
                  {hospital.ambulance_available && (
                    <View style={styles.featureItem}>
                      <MaterialCommunityIcons name="ambulance" size={24} color="#6B4EFF" />
                      <Text style={styles.featureText}>24/7 Ambulance</Text>
                    </View>
                  )}
                </View>
              </MotiView>

              {/* About Section */}
              {hospital.description && (
                <MotiView 
                  style={styles.section}
                  from={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'timing', delay: 200 }}
                >
                  <Text style={styles.sectionTitle}>About</Text>
                  <LinearGradient
                    colors={['#F8FAFC', '#EEF2FF']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.aboutSection}
                  >
                    <Text style={styles.description}>{hospital.description}</Text>
                  </LinearGradient>
                </MotiView>
              )}

              {/* Contact Information */}
              <LinearGradient
                colors={['#F8FAFC', '#EEF2FF']}
                style={styles.contactSection}
              >
                <Text style={styles.sectionTitle}>Contact Information</Text>
                {hospital.emergency_contact && (
                  <TouchableOpacity style={styles.contactButton}>
                    <Phone size={20} color="#fff" />
                    <Text style={styles.contactButtonText}>{hospital.emergency_contact}</Text>
                  </TouchableOpacity>
                )}
                {hospital.email && (
                  <TouchableOpacity style={styles.contactButton}>
                    <Mail size={20} color="#fff" />
                    <Text style={styles.contactButtonText}>{hospital.email}</Text>
                  </TouchableOpacity>
                )}
              </LinearGradient>
            </View>
          </LinearGradient>
        </LinearGradient>
      </ScrollView>

      <FloatingBookButton
        onPress={handleBookAppointment}
        scrollY={scrollY}
      />
    </View>
  );
};

export default HospitalDetail;