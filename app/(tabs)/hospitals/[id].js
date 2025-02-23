import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Animated, Easing, Linking } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../../../lib/supabase';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import FloatingBookButton from '../../../components/FloatingBookButton';
import AnimatedClock from '../../../components/AnimatedClock';
import AmbulanceModal from '../../../components/AmbulanceModal';

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

  const gradients = useMemo(() => ({
    primary: ["#4C35E3", "#4B47E5", "#5465FF"],
    secondary: ["#3B82F6", "#2563EB", "#1D4ED8"],
    accent: ["#6366F1", "#4F46E5", "#4338CA"],
    success: ["#10B981", "#059669", "#047857"],
  }), []);

  const fetchHospitalDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching hospital with ID:', id); // Add debug log
      
      const { data: hospitalData, error: hospitalError } = await supabase
        .from('hospitals')
        .select(`
          id,
          name,
          location,
          image_url,
          logo_url,
          type,
          emergency_contact,
          email,
          rating,
          description,
          facilities,
          doctors_count,
          bed_count,
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
        console.error('Supabase error:', hospitalError);
        throw hospitalError;
      }

      console.log('Hospital data received:', hospitalData);

      const transformedHospital = {
        ...hospitalData,
        specialities: hospitalData?.hospital_specialties?.map(hs => hs.specialty.name) || []
      };
      
      setHospital(transformedHospital);
    } catch (err) {
      console.error('Error fetching hospital details:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
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
        image_url: doctor.avatar_url,
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
    if (hospital?.specialities?.length) {
      const totalWidth = hospital.specialities.length * 150;
      
      // Create two synchronized animations for smooth transition
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(scrollX, {
            toValue: -totalWidth,
            duration: hospital.specialities.length * 3000, // Increased duration for smoother motion
            useNativeDriver: true,
            easing: Easing.linear,
          }),
          // Instead of resetting instantly, create a duplicate animation that starts from the beginning
          Animated.timing(scrollX, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          })
        ]),
        { iterations: -1 }
      );
  
      specialitiesAnimation.current = animation;
      animation.start();
  
      return () => {
        if (specialitiesAnimation.current) {
          specialitiesAnimation.current.stop();
        }
      };
    }
  }, [hospital?.specialities]);

  const handleMapPress = async () => {
    if (hospital?.location) {
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
              <MaterialCommunityIcons name="clock-time-eight" size={24} color="#4C35E3" />
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
              <MaterialCommunityIcons name="calendar-weekend" size={24} color="#4C35E3" />
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
                <MaterialCommunityIcons name="chevron-right" size={24} color="#fff" />
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
  if (error || !hospital) {
    return (
      <View style={[styles.container, styles.centerContainer]}>
        <Text style={styles.errorText}>Unable to load hospital details</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => fetchHospitalDetails()}
        >
          <Text style={styles.retryText}>Retry</Text>
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

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
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
                colors={gradients.secondary}
                style={styles.iconGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
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
              <Text style={styles.hospitalName}>{hospital?.name}</Text>
              <Text style={styles.hospitalType}>{hospital?.type}</Text>
              <TouchableOpacity style={styles.locationButton} onPress={handleMapPress}>
                <MaterialCommunityIcons name="map-marker" size={20} color="#3B39E4" />
                <Text style={styles.locationText}>{hospital?.location}</Text>
              </TouchableOpacity>
            </View>

            {/* Stats Section */}
            <View style={styles.statsContainer}>
              <MotiView 
                style={styles.statCard}
                from={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 100 }}
              >
                <MaterialCommunityIcons name="doctor" size={24} color="#6366F1" />
                <Text style={styles.statValue}>{hospital?.doctors_count || 0}</Text>
                <Text style={styles.statLabel}>Doctors</Text>
              </MotiView>

              <MotiView 
                style={styles.statCard}
                from={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 200 }}
              >
                <MaterialCommunityIcons name="bed" size={24} color="#6366F1" />
                <Text style={styles.statValue}>{hospital?.bed_count || 0}</Text>
                <Text style={styles.statLabel}>Beds</Text>
              </MotiView>

              <MotiView 
                style={styles.statCard}
                from={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 300 }}
              >
                <MaterialCommunityIcons name="hospital-building" size={24} color="#6366F1" />
                <Text style={styles.statValue}>{hospital?.established_year || '-'}</Text>
                <Text style={styles.statLabel}>Est. Year</Text>
              </MotiView>
            </View>

            {/* Features Section */}
            <View style={styles.featuresSection}>
              {hospital.description && (
                <MotiView 
                  style={styles.section}
                  from={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'timing', delay: 200 }}
                >
                  <Text style={styles.sectionTitle}>About</Text>
                  <View style={styles.card}>
                    <Text style={styles.description}>{hospital.description}</Text>
                  </View>
                </MotiView>
              )}

              {/* Working Hours */}
              {renderWorkingHours()}

              {/* Specialities */}
              {renderSpecialities()}

              {/* Popular Doctors - Moved here */}
              {popularDoctors.length > 0 && (
                <MotiView style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Popular Doctors</Text>
                    <LinearGradient
                      colors={['#0284C7', '#0369A1']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.seeAllButton}
                    >
                      <TouchableOpacity onPress={() => router.push(`/doctors?hospital_id=${id}`)}>
                        <Text style={styles.seeAllText}>See All</Text>
                      </TouchableOpacity>
                    </LinearGradient>
                  </View>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.doctorsScroll}>
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
                          <Image 
                            source={{ uri: doctor.avatar_url }}
                            style={styles.doctorImage}
                            resizeMode="cover"
                          />
                          <View style={styles.doctorInfo}>
                            <Text style={styles.doctorName}>{doctor.name}</Text>
                            <Text style={styles.doctorQualification}>{doctor.qualification}</Text>
                            <Text style={styles.doctorSpeciality}>{doctor.specialty}</Text>
                            <View style={styles.doctorStats}>
                              <View style={styles.ratingContainer}>
                                <MaterialCommunityIcons name="star" size={16} color="#FFD700" />
                                <Text style={styles.ratingText}>{doctor.rating?.toFixed(1)}</Text>
                              </View>
                              {doctor.experience_years && (
                                <Text style={styles.experienceText}>{doctor.experience_years}Y exp.</Text>
                              )}
                              {doctor.consultation_fee && (
                                <Text style={styles.feeText}>₹{doctor.consultation_fee}</Text>
                              )}
                            </View>
                          </View>
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

              {/* Contact Information */}
              <LinearGradient
                colors={['#F8FAFC', '#EEF2FF']}
                style={styles.contactSection}
              >
                <Text style={styles.sectionTitle}>Contact Information</Text>
                {hospital.emergency_contact && (
                  <TouchableOpacity style={styles.contactButton}>
                    <MaterialCommunityIcons name="phone" size={20} color="#fff" />
                    <Text style={styles.contactButtonText}>{hospital.emergency_contact}</Text>
                  </TouchableOpacity>
                )}
                {hospital.email && (
                  <TouchableOpacity style={styles.contactButton}>
                    <MaterialCommunityIcons name="email" size={20} color="#fff" />
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

const newStyles = {
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#6B4EFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
};

const additionalStyles = {
  placeholderImage: {
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
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
  specialitiesWrapper: {
    position: 'relative',
    height: 50,
    marginHorizontal: -16,
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
  // About section styles
  aboutSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  description: {
    fontSize: 16,
    color: '#334155',
    lineHeight: 24,
    fontFamily: 'Inter_400Regular',
  },

  // Working hours styles
  workingHoursContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
  },
  workingHoursRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  workingHoursInfo: {
    flex: 1,
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
  weekendContainer: {
    marginBottom: 16,
  },
  weekendGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
  },
  weekendInfo: {
    marginLeft: 12,
    flex: 1,
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
  emergencyContainer: {
    marginTop: 8,
  },
  emergencyGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    justifyContent: 'space-between',
    elevation: 4,
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  emergencyInfo: {
    marginLeft: 12,
    flex: 1,
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
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  facilitiesGrid: {
    marginTop: 12,
  },
  facilityItem: {
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
  facilityIcon: {
    marginRight: 12,
    shadowColor: '#4C35E3',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  facilityText: {
    fontSize: 16,
    color: '#1E293B',
    fontFamily: 'Inter_600SemiBold',
    flex: 1,
  },
  viewMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    marginTop: 8,
  },
  viewMoreText: {
    color: '#4C35E3',
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    marginRight: 4,
  },
  contentContainer: {
    flex: 1,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    padding: 16,
    paddingBottom: 60, // Decreased from 100
  },
  
  seeAllButton: {
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  
  contactSection: {
    padding: 16,
    borderRadius: 20,
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
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
  },
  gradientBackground: {
    flex: 1,
  },
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
    top: 44,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  ratingBadge: {
    position: 'absolute',
    bottom: -20,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  contentContainer: {
    flex: 1,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    padding: 16,
    paddingBottom: 60, // Decreased from 100
  },
  hospitalInfoSection: {
    marginTop: 16,
    marginBottom: 24,
  },
  hospitalName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  hospitalType: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 12,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  locationText: {
    marginLeft: 8,
    color: '#3B39E4',
    fontSize: 14,
    fontWeight: '600',
  },
  bottomButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 32, // Increased padding
    paddingHorizontal: 16,
    backgroundColor: 'transparent',
    marginBottom: 16, // Added margin from tab bar
  },
  iconGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonGradient: {
    borderRadius: 12,
    elevation: 8,
    shadowColor: '#4C35E3',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  bookNowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  bookNowText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    marginRight: 8,
  },
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
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  ratingText: {
    color: '#FFD700',
    marginLeft: 4,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  specialityTag: {
    height: 38,
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  specialityText: {
    color: '#6366F1',
    fontSize: 14,
    fontWeight: '600',
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366F1',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  contactButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  doctorCard: {
    width: 200,
    backgroundColor: '#fff',
    borderRadius: 16,
    marginRight: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  doctorImage: {
    width: '100%',
    height: 150,
    backgroundColor: '#f0f0f0',
  },
  doctorInfo: {
    padding: 12,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  doctorSpeciality: {
    fontSize: 14,
    color: '#0284C7',
    fontWeight: '500',
  },
  seeAllButton: {
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  seeAllText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  hiddenImage: {
    opacity: 0,
  },
  doctorStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  experienceText: {
    fontSize: 12,
    color: '#64748B',
    marginLeft: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  doctorQualification: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 2,
  },
  feeText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
    marginLeft: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  ...newStyles,
  ...additionalStyles
});

export default HospitalDetail;