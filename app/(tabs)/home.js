"use client"

import { useState, useRef, useEffect, useCallback, memo, useMemo } from "react"
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Animated,
  Dimensions,
  Linking,
} from "react-native"
import { useRouter } from "expo-router"
import AsyncStorage from "@react-native-async-storage/async-storage"
import Icon from "react-native-vector-icons/MaterialCommunityIcons"
import { BlurView } from "expo-blur"
import { useFonts, Inter_700Bold, Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter'
import { specialties } from '../data/constants'
import { supabase } from '../../lib/supabase'
import { SkeletonImage } from '../../hooks/SkeletonImage'
import Header from '../../components/header'
import { HospitalCardSkeleton } from '../../components/HospitalCardSkeleton';
import { secureLog } from '../../utils/secureLogging';
import DoctorCard from '../../components/DoctorCard';
import LoadingAnimation from '../../components/LoadingAnimation'
import { fetchDoctors, transformDoctorData, clearDoctorCache } from '../../services/doctorService';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get("window")

const getSupabaseImageUrl = (path) => {
  if (!path) return null;
  secureLog('Image path accessed', '[PATH_HIDDEN]');
  return '[IMAGE_URL_HIDDEN]';
};

const HospitalCard = memo(({ hospital, onPress, index }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.95)).current;
  const [imageLoading, setImageLoaded] = useState(false);

  // Create proper image URLs
  const imageUrl = hospital.image_url 
    ? hospital.image_url.startsWith('http') 
      ? hospital.image_url 
      : `${process.env.EXPO_PUBLIC_SUPABASE_URL}/storage/v1/object/public/hospitals/${hospital.image_url}`
    : null;

  const logoUrl = hospital.logo_url
    ? hospital.logo_url.startsWith('http')
      ? hospital.logo_url
      : `${process.env.EXPO_PUBLIC_SUPABASE_URL}/storage/v1/object/public/hospital-logos/${hospital.logo_url}`
    : null;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.hospitalCardContainer,
        {
          opacity,
          transform: [{ scale }],
        }
      ]}
    >
      <TouchableOpacity
        style={styles.hospitalCard}
        onPress={() => onPress(hospital)}
        activeOpacity={0.9}
      >
        <SkeletonImage 
          source={imageUrl ? { uri: imageUrl } : require('../../assets/default-hospital.png')}
          style={styles.hospitalImage}
          onLoad={() => setImageLoaded(true)}
          resizeMode="cover"
        />
        <BlurView intensity={80} tint="light" style={styles.hospitalInfoOverlay}>
          <View style={styles.hospitalInfo}>
            <View style={styles.nameContainer}>
              {logoUrl && (
                <Image
                  source={{ uri: logoUrl }}
                  style={styles.hospitalLogo}
                  resizeMode="contain"
                />
              )}
              <View style={styles.textContainer}>
                <Text style={styles.hospitalName} numberOfLines={1}>
                  {hospital.name}
                </Text>
                <Text style={styles.hospitalLocation} numberOfLines={1}>
                  {hospital.location}
                </Text>
              </View>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.bookNowButton}
            onPress={() => onPress(hospital)}
          >
            <Text style={styles.bookNowText}>Book Now</Text>
          </TouchableOpacity>
        </BlurView>
      </TouchableOpacity>
    </Animated.View>
  );
}, (prevProps, nextProps) => {
  return prevProps.hospital.id === nextProps.hospital.id;
});

export default function Home() {
  const router = useRouter()
  const [fontsLoaded] = useFonts({ 
    Inter_400Regular,
    Inter_500Medium, 
    Inter_600SemiBold,
    Inter_700Bold 
  });
  
  const [showEmergencyPopup, setShowEmergencyPopup] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [hospitalData, setHospitalData] = useState([])
  const [popularDoctors, setPopularDoctors] = useState([]);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(true);
  const scrollY = useRef(new Animated.Value(0)).current;
  const lastScrollY = useRef(0);
  const headerTranslateY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in animation when fonts are loaded
    if (fontsLoaded) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [fontsLoaded]);

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { 
      useNativeDriver: true,
      listener: ({ nativeEvent }) => {
        const currentScrollY = nativeEvent.contentOffset.y;
        const headerHeight = 180;
        const hideAmount = headerHeight * 0.7; // Only hide 70% of header
        
        if (currentScrollY > lastScrollY.current && currentScrollY > headerHeight) {
          // Scrolling down - hide header partially
          Animated.spring(headerTranslateY, {
            toValue: -hideAmount,
            useNativeDriver: true,
            tension: 80,
            friction: 10
          }).start();
        } else if (currentScrollY < lastScrollY.current) {
          // Scrolling up - show header
          Animated.spring(headerTranslateY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 80,
            friction: 10
          }).start();
        }
        
        lastScrollY.current = currentScrollY;
      }
    }
  );

  const hospitalCardAnimations = useRef([]).current

  const fetchHospitalData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Check cached data first
      const cachedData = await AsyncStorage.getItem('hospitalData');
      if (cachedData) {
        const parsed = JSON.parse(cachedData);
        secureLog('Using cached hospital data', parsed);
        setHospitalData(parsed.slice(0, 3));
      }

      // Fetch fresh data in background
      const { data, error } = await supabase
        .from('hospitals')
        .select('*')
        .order('name')
        .limit(3);
      
      if (error) {
        console.error("Supabase error:", error.message);
        return;
      }

      if (data) {
        secureLog('Fetched hospital data', data);
        setHospitalData(data);
        await AsyncStorage.setItem('hospitalData', JSON.stringify(data));
      }
    } catch (error) {
      console.error("Failed to fetch hospital data:", error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchPopularDoctors = useCallback(async () => {
    try {
      setIsLoadingDoctors(true);
      const data = await fetchDoctors(4);
      
      if (data && data.length > 0) {
        setPopularDoctors(data);
      } else {
        setPopularDoctors([]);
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setPopularDoctors([]);
    } finally {
      setIsLoadingDoctors(false);
    }
  }, []);

  // Optimize initial data loading
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Load cached data first
        const cachedHospitalData = await AsyncStorage.getItem('hospitalData');
        if (cachedHospitalData) {
          const parsed = JSON.parse(cachedHospitalData);
          setHospitalData(parsed.slice(0, 3));
        }

        // Start fetching fresh data
        fetchHospitalData();
        fetchPopularDoctors();
        loadUserData();
      } catch (error) {
        console.error('Error loading initial data:', error);
      }
    };

    loadInitialData();
  }, []);

  const loadUserData = useCallback(async () => {
    try {
      const userDataString = await AsyncStorage.getItem("userData");
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        setUserName(userData.name ? `Hello ${userData.name}` : "Hello");
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  }, []);

  const handleSeeAllHospitals = useCallback(() => {
    router.push('/hospitals');
  }, [router]);

  const renderHospitalCardsSection = useCallback(() => {
    if (isLoading) {
      return (
        <View style={styles.hospitalCardsContainer}>
          {[1, 2, 3].map((index) => (
            <HospitalCardSkeleton key={`skeleton-${index}`} />
          ))}
        </View>
      );
    }

    if (!hospitalData?.length) {
      return (
        <View style={styles.noHospitalsContainer}>
          <Text style={styles.noHospitalsText}>No hospitals found</Text>
        </View>
      );
    }

    return (
      <View style={styles.hospitalCardsContainer}>
        {hospitalData.map((hospital, index) => (
          <HospitalCard
            key={`hospital-${hospital.id}-${index}`}
            hospital={hospital}
            index={index}
            onPress={() => router.push(`/hospitals/${hospital.id}`)}
          />
        ))}
      </View>
    );
  }, [isLoading, hospitalData, router]);

  const renderDoctorsSection = useCallback(() => {
    if (isLoadingDoctors) {
      return (
        <View style={styles.loadingContainer}>
          <LoadingAnimation />
        </View>
      );
    }

    if (!popularDoctors?.length) {
      return (
        <View style={styles.noDoctorsContainer}>
          <Text style={styles.noDoctorsText}>No doctors available</Text>
        </View>
      );
    }

    return (
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.doctorsScroll}
        contentContainerStyle={styles.doctorsScrollContent}
      >
        {popularDoctors.map((doctor) => (
          <DoctorCard
            key={`doctor-${doctor.id}`}
            doctor={doctor}
            onPress={() => handleDoctorPress(doctor)}
          />
        ))}
      </ScrollView>
    );
  }, [isLoadingDoctors, popularDoctors, handleDoctorPress]);

  useEffect(() => {
    secureLog('Current hospitalData state', '[DATA_HIDDEN]');
  }, [hospitalData]);

  const handleDoctorPress = useCallback((doctor) => {
    if (!doctor?.id) {
      console.error('Invalid doctor data:', doctor);
      return;
    }
  
    // Use doctor_id if available, fallback to id
    const doctorId = doctor.doctor_id || doctor.id;
    
    router.push({
      pathname: `/(tabs)/doctors/${doctorId}`,
      params: {
        doctorData: JSON.stringify({
          ...doctor,
          id: doctorId
        })
      }
    });
  }, [router]);

  const memoizedHospitalData = useMemo(() => hospitalData, [hospitalData]);
  const memoizedPopularDoctors = useMemo(() => popularDoctors, [popularDoctors]);

  if (!fontsLoaded) {
    return (
      <View style={styles.pageLoadingContainer}>
        <StatusBar style="light" backgroundColor="transparent" translucent={true} />
        <LoadingAnimation />
      </View>
    );
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <StatusBar style="light" backgroundColor="transparent" translucent={true} />
      <Header scrollOffset={scrollY} />
      <Animated.ScrollView 
        style={[styles.scrollView]}
        contentContainerStyle={styles.scrollContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        removeClippedSubviews={true}
        initialNumToRender={5}
      >
        <View style={[styles.section, styles.topSection]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle]}>Specialties</Text>
            <TouchableOpacity onPress={() => router.push("speciality/all-specialties")}>
              <Text style={[styles.seeAll]}>See All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.specialtyScroll}>
            {specialties.map((specialty) => (
              <TouchableOpacity
                key={`specialty-${specialty.id}`}
                style={styles.specialtyContainer}
                onPress={() => router.push(`/speciality/${specialty.id}`)}
              >
                <View style={styles.specialtyIconContainer}>
                  <Icon 
                    name={specialty.icon || "medical-bag"} 
                    size={24} 
                    color="#fff" 
                  />
                </View>
                <View style={styles.specialtyTextContainer}>
                  <Text style={[styles.specialtyName]}>{specialty.name}</Text>
                  <Text style={[styles.doctorsCount]}>{specialty.doctorsAvailable} Doctors</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle]}>Popular Doctors</Text>
          </View>
          {renderDoctorsSection()}
        </View>

        <View style={styles.hospitalSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle]}>Hospitals</Text>
            <TouchableOpacity onPress={handleSeeAllHospitals}>
              <Text style={[styles.seeAllText]}>See All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.hospitalCardContainer}>
            {renderHospitalCardsSection()}
          </View>
        </View>
      </Animated.ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",  // Match header color
  },
  pageLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#F5F5F5',  // Match header color
  },
  scrollContent: {
    paddingTop: 190, // Further reduced from 200
    paddingBottom: 20,
  },
  section: {
    marginBottom: 16, // Further reduced from 24
    paddingVertical: 8, // Reduced from 12
    borderRadius: 12,
    marginHorizontal: 0,
    paddingRight: 0,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 8, // Reduced from 12
  },
  sectionTitle: {
    fontSize: 22, // Increased size
    fontFamily: 'Inter_600SemiBold',
    color: "#1a1a1a", // Darker color
  },
  seeAll: {
    fontSize: 15,
    fontFamily: 'Inter_500Medium', // Changed to medium weight
    color: "#3B39E4",
  },
  specialtyScroll: {
    paddingHorizontal: 20,
    paddingBottom: 4, // Reduced from 8
  },
  specialtyContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
    marginLeft: 0,
    height: 64,
    width: 190,
    padding: 12,
    borderRadius: 32,
    backgroundColor: "#F8F9FA",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    justifyContent: "center",
  },
  specialtyIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#3B39E4",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  specialtyTextContainer: {
    flex: 1,
  },
  specialtyName: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: "#1a1a1a",
    marginBottom: 4,
  },
  doctorsCount: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: "#666",
  },
  doctorsWrapper: {
    marginHorizontal: -20, // Compensate for parent padding
  },
  doctorsScrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 12, // Increased padding for taller cards
  },
  doctorCardContainer: {
    marginRight: 16,
  },
  hospitalSection: {
    marginBottom: 16, // Reduced from 24
    paddingTop: 8, // Reduced from 16
  },
  hospitalCardsContainer: {
    paddingHorizontal: 20,
    paddingTop: 4, // Reduced from 8
  },
  hospitalCardContainer: {
    marginBottom: 12, // Reduced from 16
    backgroundColor: 'transparent', // Removed background
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  topSection: {
    backgroundColor: '#F5F5F5', // Match header color
    paddingTop: 20,
    marginTop: 0, // Remove margin to prevent overlap
    elevation: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    paddingBottom: 16, // Added bottom padding
    borderBottomWidth: 0, // Added to ensure no bottom border
    borderBottomColor: 'transparent', // Added to ensure no bottom border
    marginHorizontal: 0, // Reset horizontal margin for top section
    borderRadius: 0, // Reset border radius for top section
  },
  hospitalCard: {
    height: 180,
    backgroundColor: 'transparent', // Removed background
    borderRadius: 12,
    overflow: 'hidden',
  },
  hospitalImage: {
    width: '100%',
    height: '75%',
    marginRight: 12,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  hospitalInfoOverlay: {
    height: '25%',
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.9)', // Made more transparent
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  hospitalInfo: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hospitalLogo: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  textContainer: {
    flex: 1,
  },
  hospitalName: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#000',
    marginBottom: 4,
  },
  hospitalLocation: {
    fontSize: 12,
    fontFamily: 'Inter_900SemiBold',
    color: '#000',
  },
  bookNowButton: {
    backgroundColor: '#3B39E4',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 90,
    height: 36,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  bookNowText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    textAlign: 'center',
    includeFontPadding: false,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 255, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  seeAllText: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: "#3B39E4",
  },
  noHospitalsContainer: {
    padding: 20,
    alignItems: 'center',
  },
  noHospitalsText: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: '#666',
  },
  doctorsScroll: {
    flexGrow: 0,
    marginBottom: 8,
  },
  loadingContainer: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDoctorsContainer: {
    padding: 20,
    alignItems: 'center',
  },
  noDoctorsText: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: '#666',
  }
})