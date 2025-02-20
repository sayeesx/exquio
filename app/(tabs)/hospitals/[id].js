import React, { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Linking } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../../../lib/supabase';
import { secureLog } from '../../../utils/secureLogging';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import StatCard from '../../../components/StatCard';
import { DebugInfo } from '../../../components/DebugInfo';
// Remove or comment out the BlurView import if it's causing issues
// import { BlurView } from 'expo-blur';

const HospitalDetail = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [hospital, setHospital] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [popularDoctors, setPopularDoctors] = useState([]);

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

  const handleMapPress = () => {
    if (hospital?.map_url) {
      Linking.openURL(hospital.map_url);
    }
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

  return (
    <View style={styles.containerWrapper}>
      <ScrollView style={[styles.container]} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={['#F8FAFC', '#F1F5F9']}
          style={styles.gradientBackground}
        >
          {/* Hero Section */}
          <View style={styles.heroWrapper}>
            <Image 
              source={{ uri: hospital?.image_url }}
              style={styles.heroImage}
              resizeMode="cover"
            />
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Rating Badge - Moved below image */}
          <View style={styles.ratingBadgeCenter}>
            <MaterialCommunityIcons name="star" size={16} color="#FFD700" />
            <Text style={styles.ratingText}>{hospital?.rating?.toFixed(1)}</Text>
          </View>

          <View style={styles.headerContent}>
            <View style={styles.headerRow}>
              <Text style={styles.hospitalName}>{hospital?.name}</Text>
              <TouchableOpacity 
                style={styles.mapLink}
                onPress={handleMapPress}
              >
                <MaterialCommunityIcons name="map-marker" size={16} color="#0284C7" />
                <Text style={styles.mapLinkText}>Show map</Text>
              </TouchableOpacity>
            </View>
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

          {/* Content Sections */}
          <View style={styles.content}>
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
            <MotiView 
              style={styles.section}
              from={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'timing', delay: 200 }}
            >
              <Text style={styles.sectionTitle}>Working Hours</Text>
              <View style={styles.workingHoursCard}>
                <View style={styles.workingHoursRow}>
                  <MaterialCommunityIcons name="clock-outline" size={20} color="#666" />
                  <View style={styles.workingHoursInfo}>
                    <Text style={styles.workingHoursLabel}>Weekdays</Text>
                    <Text style={styles.workingHoursText}>{workingHours.weekdays}</Text>
                  </View>
                </View>
                <View style={styles.workingHoursRow}>
                  <MaterialCommunityIcons name="calendar" size={20} color="#666" />
                  <View style={styles.workingHoursInfo}>
                    <Text style={styles.workingHoursLabel}>Weekends</Text>
                    <Text style={styles.workingHoursText}>{workingHours.weekends}</Text>
                  </View>
                </View>
                {workingHours.emergency && (
                  <View style={[styles.workingHoursRow, styles.emergencyRow]}>
                    <MaterialCommunityIcons name="ambulance" size={20} color="#ff4444" />
                    <View style={styles.workingHoursInfo}>
                      <Text style={[styles.workingHoursLabel, styles.emergencyLabel]}>Emergency</Text>
                      <Text style={[styles.workingHoursText, styles.emergencyText]}>{workingHours.emergency}</Text>
                    </View>
                  </View>
                )}
              </View>
            </MotiView>

            {/* Facilities */}
            {hospital.facilities && hospital.facilities.length > 0 && (
              <MotiView 
                style={styles.section}
                from={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'timing', delay: 200 }}
              >
                <Text style={styles.sectionTitle}>Facilities</Text>
                <View style={styles.facilitiesGrid}>
                  {hospital.facilities.map((facility, index) => (
                    <View key={index} style={styles.facilityItem}>
                      <MaterialCommunityIcons name="check-circle" size={20} color="#6B4EFF" />
                      <Text style={styles.facilityText}>{facility}</Text>
                    </View>
                  ))}
                </View>
              </MotiView>
            )}

            {/* Specialities */}
            {hospital.specialities && hospital.specialities.length > 0 && (
              <MotiView 
                style={styles.section}
                from={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'timing', delay: 200 }}
              >
                <Text style={styles.sectionTitle}>Specialities</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {hospital.specialities.map((speciality, index) => (
                    <View key={index} style={styles.specialityTag}>
                      <Text style={styles.specialityText}>{speciality}</Text>
                    </View>
                  ))}
                </ScrollView>
              </MotiView>
            )}

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

            {/* Popular Doctors */}
            {popularDoctors.length > 0 && (
              <MotiView 
                style={styles.section}
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: 'spring', delay: 500 }}
              >
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Popular Doctors</Text>
                  <TouchableOpacity 
                    style={styles.seeAllButton}
                    onPress={() => router.push(`/doctors?hospital_id=${id}`)}
                  >
                    <Text style={styles.seeAllText}>See All</Text>
                  </TouchableOpacity>
                </View>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  style={styles.doctorsScroll}
                >
                  {popularDoctors.map((doctor, index) => (
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

            {/* Contact Information */}
            <MotiView 
              style={styles.section}
              from={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'timing', delay: 200 }}
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
            </MotiView>
          </View>
        </LinearGradient>
      </ScrollView>

      {/* Book Now Button - Fixed at bottom */}
      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity 
          style={styles.bookNowButton}
          onPress={() => {/* Handle booking */}}
        >
          <Text style={styles.bookNowText}>Book Now</Text>
          <MaterialCommunityIcons name="arrow-right" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
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
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  gradientBackground: {
    flex: 1,
  },
  heroWrapper: {
    margin: 16,
    borderRadius: 20,
    overflow: 'hidden',
    height: 200,
    position: 'relative',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  headerContent: {
    padding: 16,
    marginTop: 8,
  },
  hospitalName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    flex: 1,
    marginRight: 16,
  },
  mapLink: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  ratingBadgeCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'center',
    marginTop: -20,
    zIndex: 1,
  },
  bottomButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  bookNowButton: {
    backgroundColor: '#6B4EFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#6B4EFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
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
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  ratingBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 16,
    zIndex: 1,
  },
  ratingText: {
    color: '#FFD700',
    marginLeft: 4,
    fontWeight: '600',
  },
  heroContainer: {
    height: 320,
    position: 'relative',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '100%',
    paddingHorizontal: 20,
    paddingBottom: 20,
    justifyContent: 'flex-end',
  },
  headerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  logoContainer: {
    position: 'absolute',
    top: '15%',
    left: 20,
    width: 80,
    height: 80,
    backgroundColor: '#fff',
    borderRadius: 40,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  hospitalLogo: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
  },
  headerText: {
    flex: 1,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 4,
    opacity: 0.9,
  },
  statsContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: -40,
    marginBottom: 20,
    gap: 12,
    zIndex: 2,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  specialityTag: {
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
  imageContainer: {
    width: '100%',
    height: 250,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  content: {
    padding: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    marginLeft: 8,
    color: '#666',
    fontSize: 16,
  },
  section: {
    marginVertical: 20,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  workingHours: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  workingHoursRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  workingHoursInfo: {
    marginLeft: 12,
  },
  workingHoursLabel: {
    fontSize: 14,
    color: '#666',
  },
  workingHoursText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  emergencyRow: {
    marginBottom: 0,
  },
  emergencyLabel: {
    color: '#ff4444',
  },
  emergencyText: {
    color: '#ff4444',
    fontWeight: 'bold',
  },
  servicesList: {
    marginTop: 8,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  serviceText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 8,
  },
  doctorsScroll: {
    paddingHorizontal: 16,
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
  doctorRole: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  doctorSpeciality: {
    fontSize: 14,
    color: '#0284C7',
    fontWeight: '500',
  },
  seeAllButton: {
    backgroundColor: '#0284C7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  seeAllText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6B4EFF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  contactButtonText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 16,
  },
  hiddenImage: {
    opacity: 0,
  },
  glassEffect: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(10px)',
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
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
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
  containerWrapper: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  ...newStyles,
  ...additionalStyles
});

export default HospitalDetail;