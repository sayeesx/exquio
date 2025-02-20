"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Dimensions,
  TextInput,
  Alert,
  Animated,
  Platform,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { SvgUri } from 'react-native-svg';
import { MotiView } from "moti";
import { Easing } from "react-native-reanimated";
import { supabase } from '../../../lib/supabase';
import { HospitalCardSkeleton } from '../../../components/HospitalCardSkeleton';
import { secureLog } from '../../../utils/secureLogging';

const { width } = Dimensions.get("window");

const AnimatedCard = Animated.createAnimatedComponent(TouchableOpacity);

const HospitalCard = React.memo(({ hospital, onPress, index }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(index * 100), // Stagger effect
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 20,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  useEffect(() => {
    secureLog('Hospital data in card', hospital);
  }, [hospital]);

  return (
    <AnimatedCard 
      style={[
        styles.card,
        {
          opacity: opacityAnim,
          transform: [{ scale: scaleAnim }],
          width: width - 32, // Add explicit width
        }
      ]} 
      onPress={() => onPress(hospital)}
      activeOpacity={0.9}
    >
      <MotiView
        from={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'timing', duration: 350 }}
        style={styles.cardInner}
      >
        <Image 
          source={{ uri: hospital.image_url || hospital.image }}
          style={[styles.image, !imageLoaded && styles.hiddenImage]} 
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            console.log('Image loading error:', e); // Debug log
            setImageError(true);
          }}
          loading="eager"
        />
        <BlurView intensity={80} tint="light" style={styles.cardOverlay}>
          <View style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <View style={styles.hospitalInfo}>
                {hospital.logo_url && (
                  <Image 
                    source={{ uri: hospital.logo_url || hospital.logo }}
                    style={styles.logo}
                    resizeMode="contain"
                    fadeDuration={0}
                  />
                )}
                <View style={styles.nameContainer}>
                  <Text style={styles.hospitalName}>{hospital.name}</Text>
                  <View style={styles.locationContainer}>
                    <MaterialCommunityIcons name="map-marker" size={16} color="#FF4757" />
                    <Text style={styles.locationText}>{hospital.location}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.buttonContainer}>
                <TouchableOpacity 
                  style={styles.bookNowButton}
                  onPress={() => onPress(hospital)}
                >
                  <Text style={styles.bookNowText}>Book Now</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </BlurView>
      </MotiView>
    </AnimatedCard>
  );
});

export default function Hospitals() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [isReady, setIsReady] = useState(true);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dbStatus, setDbStatus] = useState({ connected: false, checking: true });

  const loadHospitals = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('hospitals')
        .select('*')
        .order('name');
      
      if (error) {
        throw error;
      }
      
      secureLog('Fetched hospitals', data); // Replace console.log with secureLog
      
      const processedData = data?.map(hospital => ({
        ...hospital,
        image_url: hospital.image_url || hospital.image,
        logo_url: hospital.logo_url || hospital.logo
      })) || [];

      setHospitals(processedData);
    } catch (err) {
      console.error('Error loading hospitals:', err.message); // Only log error message
      setError(err.message);
      Alert.alert('Error', 'Failed to load hospitals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHospitals();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('hospitals_channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'hospitals'
        },
        async (payload) => {
          console.log('Real-time update:', payload);
          
          switch (payload.eventType) {
            case 'INSERT':
              setHospitals(prev => [...prev, payload.new]);
              break;
            case 'UPDATE':
              setHospitals(prev =>
                prev.map(hospital =>
                  hospital.id === payload.new.id ? payload.new : hospital
                )
              );
              break;
            case 'DELETE':
              setHospitals(prev =>
                prev.filter(hospital => hospital.id !== payload.old.id)
              );
              break;
          }
        }
      )
      .subscribe();

    // Cleanup subscription
    return () => {
      channel.unsubscribe();
    };
  }, []);

  useEffect(() => {
    async function checkConnection() {
      try {
        const result = await testDatabaseConnection();
        setDbStatus({ 
          connected: result.success, 
          checking: false 
        });
      } catch (error) {
        setDbStatus({ 
          connected: false, 
          checking: false,
          error: error.message 
        });
      }
    }

    checkConnection();
  }, []);

  const handleFilterPress = (filter) => {
    if (filter === "vet") {
      Alert.alert("Coming Soon", "This feature will be available soon");
      return;
    }
    setSelectedFilter(filter);
  };

  const handleHospitalPress = (hospital) => {
    try {
      if (!hospital || !hospital.id) {
        throw new Error('Invalid hospital data');
      }
      
      // Update the navigation path to include (tabs)
      router.push(`/(tabs)/hospitals/${hospital.id}`);
    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert(
        'Error',
        'Unable to view hospital details. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const filteredHospitals = useMemo(() => {
    return hospitals.filter(
      (hospital) =>
        (selectedFilter === "all" || hospital.type === selectedFilter) &&
        hospital.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [selectedFilter, searchQuery, hospitals]);

  if (loading) {
    return (
      <View style={[styles.container, styles.listContainer]}>
        {[1, 2, 3].map((index) => (
          <HospitalCardSkeleton key={index} />
        ))}
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>Failed to load hospitals</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => loadHospitals()}
        >
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Find Hospitals</Text>
        <Text style={styles.headerSubtitle}>Discover healthcare near you</Text>
      </View>

      <View style={styles.searchContainer}>
        <MaterialCommunityIcons name="magnify" size={24} color="#666" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search hospitals..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.filterContainer}>
        {["all", "multi", "ayurveda", "clinic", "vet"].map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterButton,
              selectedFilter === filter && styles.filterButtonActive,
            ]}
            onPress={() => handleFilterPress(filter)}
          >
            <Text
              style={[
                styles.filterText,
                selectedFilter === filter && styles.filterTextActive,
              ]}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {filteredHospitals.length > 0 ? (
        <FlatList
          data={filteredHospitals}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <HospitalCard 
              hospital={item} 
              onPress={() => item ? handleHospitalPress(item) : null}
              index={index}
            />
          )}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          initialNumToRender={3}
          maxToRenderPerBatch={3}
          windowSize={3}
          removeClippedSubviews={true}
        />
      ) : (
        <View style={styles.noResultsContainer}>
          <MaterialCommunityIcons name="hospital-building" size={64} color="#ddd" />
          <Text style={styles.noResultsText}>No hospitals found</Text>
          <Text style={styles.suggestionText}>Try adjusting your search</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    paddingTop: Platform.OS === 'ios' ? StatusBar.currentHeight : 0,
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: "#F8F9FA",
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: "#1E293B",
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#64748B",
    marginTop: 4,
    letterSpacing: 0.2,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    margin: 16,
    marginBottom: 10,
    padding: 12,
    height: 56,
    borderRadius: 16,
    shadowColor: "#1E293B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: "#1E293B",
  },
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#fff",
    marginRight: 8,
    shadowColor: "#1E293B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  filterButtonActive: {
    backgroundColor: "#3B39E4",
    shadowColor: "#3B39E4",
    shadowOpacity: 0.25,
  },
  filterText: {
    color: "black",
    textAlign: "center",
    marginTop: 5,
    fontSize: 14,
    fontWeight: "600",
  },
  filterTextActive: {
    color: "#fff",
  },
  listContainer: {
    paddingTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 20
  },
  card: {
    height: 180,
    marginBottom: 16,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "#fff",
    shadowColor: "#1E293B",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  cardInner: {
    flex: 1,
  },
  image: {
    width: "100%",
    height: "100%",
    opacity: 1,
  },
  cardOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "45%",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: "hidden",
    backgroundColor: "rgba(255, 255, 255, 0.85)",
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: '100%',
  },
  hospitalInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 12,
    zIndex: 3,
  },
  logoContainer: {
    width: 24,
    height: 24,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  logo: {
    width: 24,
    height: 24,
    marginRight: 8,
    backgroundColor: 'transparent',
  },
  nameContainer: {
    flex: 1,
  },
  hospitalName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 4,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationText: {
    marginLeft: 4,
    color: "#64748B",
    fontSize: 14,
  },
  typeBadge: {
    
    shadowColor: "#000",
    shadowOffset: { width: 5, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 7,
  },
  typeText: {
    color: "black",
    fontSize: 10,
    fontWeight: "600",
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 100,
  },
  noResultsText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1E293B",
    marginTop: 16,
  },
  suggestionText: {
    fontSize: 16,
    color: "#64748B",
    marginTop: 8,
  },
  hiddenImage: {
    opacity: 0,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#FF4757',
    marginBottom: 16,
  },
  retryButton: {
    padding: 12,
    backgroundColor: '#3B39E4',
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  hospitalCard: {
    height: 180,
    width: width * 0.9,
  },
  buttonContainer: {
    position: 'absolute',
    right: 0,
    zIndex: 5,
  },
  bookNowButton: {
    backgroundColor: '#3B39E4',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  bookNowText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});