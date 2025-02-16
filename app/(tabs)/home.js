"use client"

import { useState, useRef, useEffect, useCallback, memo } from "react"
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
import { specialties, popularDoctors } from '../data/constants'
import { supabase } from '../../lib/supabase'
import { SkeletonImage } from '../../hooks/SkeletonImage'
import Header from '../../components/header'
import { HospitalCardSkeleton } from '../../components/HospitalCardSkeleton';
import { secureLog } from '../../utils/secureLogging';

const { width } = Dimensions.get("window")

const getSupabaseImageUrl = (path) => {
  if (!path) return null;
  return `${process.env.EXPO_PUBLIC_SUPABASE_URL}/storage/v1/object/public/hospitals/${path}`;
};

const HospitalCard = memo(({ hospital, onPress, index }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.95)).current;
  const [imageLoaded, setImageLoaded] = useState(false);

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
          source={hospital.image_url ? { uri: hospital.image_url } : null}
          style={styles.hospitalImage}
          onLoad={() => setImageLoaded(true)}
          resizeMode="cover"
        />
        <BlurView intensity={80} tint="light" style={styles.hospitalInfoOverlay}>
          <View style={styles.hospitalInfo}>
            <View style={styles.nameContainer}>
              {hospital.logo_url && (
                <Image
                  source={{ uri: hospital.logo_url }}
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

  const hospitalCardAnimations = useRef([]).current

  const fetchHospitalData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Check cached data
      const cachedData = await AsyncStorage.getItem('hospitalData');
      if (cachedData) {
        const parsed = JSON.parse(cachedData);
        secureLog('Using cached hospital data', parsed);
        setHospitalData(parsed.slice(0, 3));
      }

      // Fetch fresh data
      const { data, error } = await supabase
        .from('hospitals')
        .select('*')
        .order('name')
        .limit(3);
      
      if (error) {
        console.error("Supabase error:", error.message); // Only log error message
        return;
      }

      if (data) {
        secureLog('Fetched hospital data', data);
        setHospitalData(data);
        await AsyncStorage.setItem('hospitalData', JSON.stringify(data));
      } else {
        console.log('No data returned from Supabase');
      }
    } catch (error) {
      console.error("Failed to fetch hospital data:", error.message); // Only log error message
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update the debug useEffect
  useEffect(() => {
    secureLog('Current hospitalData state', hospitalData);
  }, [hospitalData]);

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

  const renderHospitalCard = useCallback(
    (hospital, index) => {
      if (!hospital) return null;

      return (
        <HospitalCard
          key={hospital.id || `hospital-${index}`}
          hospital={hospital}
          index={index}
          onPress={() => router.push(`/hospitals/${hospital.id}`)}
        />
      );
    },
    [router]
  );

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
            key={hospital.id}
            hospital={hospital}
            index={index}
            onPress={() => router.push(`/hospitals/${hospital.id}`)}
          />
        ))}
      </View>
    );
  }, [isLoading, hospitalData, router]);

  useEffect(() => {
    fetchHospitalData()
    loadUserData()
  }, [fetchHospitalData, loadUserData])

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle]}>Specialties</Text>
            <TouchableOpacity onPress={() => router.push("speciality/all-specialties")}>
              <Text style={[styles.seeAll]}>See All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.specialtyScroll}>
            {specialties.map((specialty) => (
              <TouchableOpacity
                key={specialty.id}
                style={styles.specialtyContainer}
                onPress={() => router.push(`/specialty/${specialty.name.toLowerCase()}`)}
              >
                <View style={styles.specialtyIconContainer}>
                  <Icon name={specialty.icon} size={24} color="#fff" />
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
          <Text style={[styles.sectionTitle]}>Popular Doctors</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.doctorsScroll}>
            {popularDoctors.map((doctor) => (
              <View key={doctor.id} style={styles.doctorCard}>
                <BlurView intensity={80} tint="light" style={styles.doctorCardContent}>
                  <View style={styles.doctorImageContainer}>
                    <Image source={doctor.image} style={styles.doctorImage} resizeMode="cover" />
                  </View>
                  <View style={styles.doctorInfo}>
                    <Text style={[styles.doctorName]} numberOfLines={1}>
                      {doctor.name}
                    </Text>
                    <View style={styles.specialtyChip}>
                      <Icon name={doctor.specialtyIcon} size={14} color="#3B39E4" />
                      <Text style={[styles.specialtyText]}>{doctor.specialty}</Text>
                    </View>
                    <Text style={[styles.fieldOfStudy]} numberOfLines={2}>
                      {doctor.fieldOfStudy}
                    </Text>
                    <TouchableOpacity style={styles.bookingButton}>
                      <Text style={[styles.bookingButtonText]}>Book Now</Text>
                      <Icon name="calendar-plus" size={16} color="#fff" />
                    </TouchableOpacity>
                  </View>
                </BlurView>
              </View>
            ))}
          </ScrollView>
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
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter_600SemiBold',
    color: "#000",
  },
  seeAll: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: "#3B39E4",
  },
  specialtyScroll: {
    paddingHorizontal: 20,

  },
  specialtyContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 10,
    height: 60,
    width: 180,
    padding: 10,
    marginBottom: 10,
  
    borderRadius: 30,
    backgroundColor: "#F5F5F5",
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
    color: "#000",
    marginBottom: 4,
  },
  doctorsCount: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: "#666",
  },
  doctorsScroll: {
    paddingHorizontal: 20,
  },
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
  hospitalSection: {
    marginBottom: 24,
  },
  hospitalCardContainer: {
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  hospitalCard: {
    height: 180,
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  hospitalImage: {
    width: '100%',
    height: '75%',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  hospitalInfoOverlay: {
    height: '25%',
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
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
  hospitalCardsContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  
  hospitalCardContainer: {
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  
  // Update existing hospital card styles to match the animation
  hospitalCard: {
    height: 180,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
  },
})