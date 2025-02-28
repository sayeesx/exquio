import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  Image, 
  StyleSheet, 
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  RefreshControl,
  Platform,
  StatusBar,
  Animated,
  Easing
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { supabase } from '../../../lib/supabase';
import { LinearGradient } from 'expo-linear-gradient';
import { createShimmerPlaceholder } from 'react-native-shimmer-placeholder';
import { FloatingBookButton } from '../../../components/FloatingBookButton';
import { useStatusBarEffect } from '../../../hooks/useStatusBarEffect';

const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient);

const BookNowButton = ({ onPress }) => {
  const translateX = useRef(new Animated.Value(-200)).current;

  useEffect(() => {
    let isMounted = true;
    let shimmerAnimation;

    if (isMounted) {
      shimmerAnimation = Animated.loop(
        Animated.timing(translateX, {
          toValue: 400,
          duration: 1500,
          useNativeDriver: true,
          easing: Easing.ease,
        })
      );
      shimmerAnimation.start();
    }

    return () => {
      isMounted = false;
      if (shimmerAnimation) {
        shimmerAnimation.stop();
      }
    };
  }, []);

  return (
    <TouchableOpacity onPress={onPress} style={styles.bookNowButton}>
      <LinearGradient
        colors={["#4C35E3", "#4B47E5", "#5465FF"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.buttonGradient}
      >
        <View style={styles.buttonContent}>
          <Text style={styles.bookNowText}>Book Now</Text>
          <View style={styles.shimmerContainer}>
            <Animated.View
              style={[
                styles.shimmer,
                {
                  transform: [{ translateX }],
                },
              ]}
            >
              <LinearGradient
                colors={['transparent', 'rgba(255,255,255,0.4)', 'transparent']}
                locations={[0.35, 0.5, 0.65]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
            </Animated.View>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default function Doctors() {
  useStatusBarEffect();
  const { hospital_id } = useLocalSearchParams();
  const router = useRouter();
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hospital, setHospital] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        const query = supabase
          .from('doctors')
          .select(`
            *,
            specialties:specialty_id (name)
          `)
          .order('rating', { ascending: false });

        if (hospital_id) {
          query.eq('hospital_id', hospital_id);
          // Also fetch hospital name
          const { data: hospitalData } = await supabase
            .from('hospitals')
            .select('name')
            .eq('id', hospital_id)
            .single();
          setHospital(hospitalData);
        }

        const { data, error } = await query;
        if (error) throw error;
        setDoctors(data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, [hospital_id]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredDoctors(doctors);
    } else {
      const searchTerm = searchQuery.toLowerCase();
      const filtered = doctors.filter(doctor => {
        const doctorName = doctor?.name?.toLowerCase() || '';
        const doctorSpecialty = doctor?.specialties?.name?.toLowerCase() || '';
        return doctorName.includes(searchTerm) || doctorSpecialty.includes(searchTerm);
      });
      setFilteredDoctors(filtered);
    }
  }, [searchQuery, doctors]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      const query = supabase
        .from('doctors')
        .select('*')
        .order('rating', { ascending: false });

      if (hospital_id) {
        query.eq('hospital_id', hospital_id);
      }

      const { data, error } = await query;
      if (error) throw error;
      setDoctors(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setRefreshing(false);
    }
  }, [hospital_id]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6B4EFF" />
      </View>
    );
  }

  const EmptyDoctorList = () => (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons name="doctor" size={64} color="#6B4EFF" />
      <Text style={styles.emptyText}>No doctors found for this hospital.</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#4C35E3", "#4B47E5", "#5465FF"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.gradientHeader,
          { paddingTop: Platform.OS === 'ios' ? 60 : StatusBar.currentHeight + 10 }
        ]}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={[styles.pageTitle, { color: '#fff' }]}>Find Your Doctor</Text>
            {hospital && (
              <Text style={[styles.hospitalName, { color: '#fff' }]}>{hospital.name}</Text>
            )}
          </View>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <MaterialIcons name="search" size={20} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search doctors..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#666"
            />
          </View>
        </View>
      </LinearGradient>

      <FlatList
        ListEmptyComponent={EmptyDoctorList}
        data={filteredDoctors}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.row}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#6B4EFF']}
            tintColor="#6B4EFF"
          />
        }
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={[styles.doctorCard, { height: 240 }]} // Increased height
            onPress={() => router.push(`/doctors/${item.id}`)}
          >
            <Image
              source={{ uri: item.image_url }}
              style={styles.doctorImage}
              resizeMode="cover"
            />
            <View style={styles.doctorInfo}>
              <View style={styles.mainInfo}>
                <Text style={styles.doctorName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.specialtyText} numberOfLines={1}>
                  {item.specialties?.name || 'Specialist'}
                </Text>
              </View>
              
              <View style={styles.statsContainer}>
                <View style={styles.statsRow}>
                  <View style={styles.ratingContainer}>
                    <MaterialCommunityIcons name="star" size={12} color="#FFD700" />
                    <Text style={styles.ratingText}>{item.rating?.toFixed(1) || '4.5'}</Text>
                  </View>
                  <View style={styles.feeContainer}>
                    <MaterialCommunityIcons name="currency-inr" size={12} color="#2E7D32" />
                    <Text style={styles.feeText}>
                      {item.consultation_fee || 'N/A'}
                    </Text>
                  </View>
                </View>

                {item.experience && (
                  <View style={styles.experienceContainer}>
                    <MaterialCommunityIcons name="briefcase-outline" size={10} color="#6B4EFF" />
                    <Text style={styles.experienceText}>{item.experience}y</Text>
                  </View>
                )}

                <BookNowButton 
                  onPress={() => router.push(`/doctors/${item.id}`)}
                />
              </View>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  gradientHeader: {
    paddingTop: Platform.OS === "ios" ? 60 : StatusBar.currentHeight + 10,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginTop: Platform.OS === 'android' ? -StatusBar.currentHeight : 0,
    zIndex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  headerTextContainer: {
    flex: 1,
    marginLeft: 12,
    marginTop: 38,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
    marginTop: 15,
  },
  pageTitle: {
    fontSize: 24,
    fontFamily: 'Inter_600SemiBold',
    color: '#fff',
    marginBottom: 4,
  },
  hospitalName: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#fff',
    opacity: 0.9,
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    fontFamily: 'Inter_400Regular',
  },
  listContent: {
    padding: 12,
  },
  row: {
    justifyContent: 'space-between',
  },
  doctorCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
    height: 240, // Increased height
  },
  doctorImage: {
    width: '90%',
    height: '60%',
    backgroundColor: '#F5F5F5',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  doctorInfo: {
    padding: 16, // Increased from 10
    flex: 1,
    justifyContent: 'space-between',
  },
  mainInfo: {
    marginBottom: 8,
  },
  doctorName: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  specialtyText: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: '#6B4EFF',
    backgroundColor: '#F0EEFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  statsContainer: {
    gap: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9E6',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  experienceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0EEFF',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  feeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 50,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: '#666',
    marginTop: 12,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  feeText: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
    color: '#2E7D32',
    marginLeft: 2,
  },
  bookNowButton: {
    marginTop: -15,
    height: 36,
    overflow: 'hidden',
    borderRadius: 8,
  },
  buttonGradient: {
    flex: 1,
    borderRadius: 8,
  },
  buttonContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  shimmerContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.5,
  },
  bookNowText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    zIndex: 1,
  },
});
