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
  StatusBar,
  Keyboard,
  Platform,
  RefreshControl,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { supabase } from "../../../lib/supabase";
import { HospitalCardSkeleton } from "../../../components/HospitalCardSkeleton";
import { secureLog } from "../../../utils/secureLogging";
import { useFonts, Inter_700Bold } from '@expo-google-fonts/inter';

const { width } = Dimensions.get("window");

const AnimatedCard = Animated.createAnimatedComponent(TouchableOpacity);
const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);
const AnimatedText = Animated.createAnimatedComponent(Text);

const FilterButton = ({ filter, isActive, onPress }) => (
  <TouchableOpacity
    onPress={() => onPress(filter)}
    style={styles.filterButtonContainer}
  >
    <LinearGradient
      colors={isActive ? ["#4F46E5", "#3B82F6"] : ["#fff", "#fff"]}
      style={[styles.filterButton]}
    >
      <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
        {filter.charAt(0).toUpperCase() + filter.slice(1)}
      </Text>
    </LinearGradient>
  </TouchableOpacity>
);

const SearchBar = ({ value, onChangeText, onClear }) => {
  const [isFocused, setIsFocused] = useState(false);
  const typingInterval = useRef(null);
  const [placeholderText, setPlaceholderText] = useState('');
  const fullText = "Search hospitals...";
  
  const startTypingAnimation = () => {
    let index = 0;
    if (typingInterval.current) clearInterval(typingInterval.current);
    
    setPlaceholderText('');
    typingInterval.current = setInterval(() => {
      if (index <= fullText.length) {
        setPlaceholderText(fullText.slice(0, index));
        index++;
      } else {
        clearInterval(typingInterval.current);
        // Shorter delay before restarting for smoother loop
        setTimeout(() => {
          index = 0;
          startTypingAnimation();
        }, 800);
      }
    }, 100); // Faster typing speed
  };

  useEffect(() => {
    if (!isFocused) {
      startTypingAnimation();
    } else {
      if (typingInterval.current) {
        clearInterval(typingInterval.current);
        setPlaceholderText(fullText);
      }
    };
    
    return () => {
      if (typingInterval.current) {
        clearInterval(typingInterval.current);
      }
    };
  }, [isFocused]);

  // Start animation when component mounts
  useEffect(() => {
    startTypingAnimation();
    return () => {
      if (typingInterval.current) {
        clearInterval(typingInterval.current);
      }
    };
  }, []);

  return (
    <View style={styles.searchContainer}>
      <View style={styles.searchIconContainer}>
        <MaterialCommunityIcons name="magnify" size={22} color="#64748B" />
      </View>
      <TextInput
        style={styles.searchInput}
        placeholder={isFocused ? fullText : placeholderText}
        placeholderTextColor="#A0AEC0"
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={onClear} style={styles.clearButton}>
          <MaterialCommunityIcons name="close-circle" size={20} color="#64748B" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const ScrollToTopButton = ({ onPress, visible }) => (
  visible && (
    <TouchableOpacity 
      style={styles.scrollTopButton}
      onPress={onPress}
    >
      <MaterialCommunityIcons name="arrow-up" size={24} color="#fff" />
    </TouchableOpacity>
  )
);

const HospitalCard = React.memo(({ hospital, onPress, index }) => {
  const translateY = useRef(new Animated.Value(50)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const delay = index * 100;
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 500,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 500,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[styles.hospitalCard, { opacity, transform: [{ translateY }] }]}>
      <Image source={{ uri: hospital.image_url }} style={styles.cardImage} />
      <View style={styles.cardOverlay}>
        <LinearGradient
          colors={["#fff", "#fff"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.typeLabel}
        >
          <Text style={[styles.typeLabelText, { color: '#3B39E4' }]}>
            {hospital.type.charAt(0).toUpperCase() + hospital.type.slice(1)}
          </Text>
        </LinearGradient>

        <BlurView intensity={35} tint="dark" style={styles.hospitalInfo}>
          {hospital.logo_url && (
            <Image
              source={{ uri: hospital.logo_url }}
              style={styles.hospitalLogo}
            />
          )}
          <View style={styles.textContent}>
            <Text style={styles.hospitalName} numberOfLines={1}>
              {hospital.name}
            </Text>
            <View style={styles.locationRow}>
              <MaterialCommunityIcons
                name="map-marker"
                size={16}
                color="#fff"
              />
              <Text style={styles.locationText} numberOfLines={1}>
                {hospital.location}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => onPress(hospital)}
            style={styles.bookNowButton}
          >
            <LinearGradient
              colors={["#4F46E5", "#3B82F6"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.bookNowGradient}
            >
              <Text style={styles.bookNowText}>Book Now</Text>
            </LinearGradient>
          </TouchableOpacity>
        </BlurView>
      </View>
    </Animated.View>
  );
});

export default function Hospitals() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const flatListRef = useRef(null);
  const [fontsLoaded] = useFonts({
    Inter_700Bold,
  });

  const loadHospitals = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("hospitals")
        .select("*")
        .order("name");

      if (error) {
        throw error;
      }

      secureLog("Fetched hospitals", data);

      const processedData =
        data?.map((hospital) => ({
          ...hospital,
          image_url: hospital.image_url || hospital.image,
          logo_url: hospital.logo_url || hospital.logo,
        })) || [];

      setHospitals(processedData);
    } catch (err) {
      console.error("Error loading hospitals:", err.message);
      setError(err.message);
      Alert.alert("Error", "Failed to load hospitals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHospitals();

    const channel = supabase
      .channel("hospitals_channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "hospitals" },
        (payload) => {
          switch (payload.eventType) {
            case "INSERT":
              setHospitals((prev) => [...prev, payload.new]);
              break;
            case "UPDATE":
              setHospitals((prev) =>
                prev.map((hospital) =>
                  hospital.id === payload.new.id ? payload.new : hospital
                )
              );
              break;
            case "DELETE":
              setHospitals((prev) =>
                prev.filter((hospital) => hospital.id !== payload.old.id)
              );
              break;
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
      }
    );
    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  const handleFilterPress = (filter) => {
    setSelectedFilter(filter);
  };

  const handleHospitalPress = (hospital) => {
    try {
      if (!hospital || !hospital.id) {
        throw new Error("Invalid hospital data");
      }
      router.push(`/(tabs)/hospitals/${hospital.id}`);
    } catch (error) {
      console.error("Navigation error:", error);
      Alert.alert("Error", "Unable to view hospital details. Please try again.", [
        { text: "OK" },
      ]);
    }
  };

  const filteredHospitals = useMemo(() => {
    return hospitals.filter(
      (hospital) =>
        (selectedFilter === "all" || hospital.type === selectedFilter) &&
        hospital.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [selectedFilter, searchQuery, hospitals]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadHospitals().finally(() => setRefreshing(false));
  }, []);

  const handleScroll = (event) => {
    const scrollPosition = event.nativeEvent.contentOffset.y;
    setShowScrollTop(scrollPosition > 300);
  };

  const scrollToTop = () => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        {[1, 2, 3].map((index) => (
          <HospitalCardSkeleton key={index} />
        ))}
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Failed to load hospitals</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadHospitals}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={[styles.container, isKeyboardVisible && styles.keyboardOpen]}>
      <LinearGradient
        colors={["#fff", "#f8fafc"]}
        style={styles.header}
      >
        <Text style={[styles.headerTitle, { fontFamily: 'Inter_700Bold' }]}>
          Find Hospitals
        </Text>
        <Text style={[styles.headerSubtitle, { fontFamily: 'Inter_700Bold' }]}>
          Discover healthcare near you
        </Text>
        <SearchBar 
          value={searchQuery} 
          onChangeText={setSearchQuery}
          onClear={() => setSearchQuery('')}
        />
      </LinearGradient>

      <View style={styles.filterContainer}>
        {["all", "multi", "clinic", "ayurveda"].map((filter) => (
          <FilterButton
            key={filter}
            filter={filter}
            isActive={selectedFilter === filter}
            onPress={handleFilterPress}
          />
        ))}
      </View>

      {loading ? (
        <View style={styles.listContainer}>
          {[1, 2, 3].map((index) => (
            <HospitalCardSkeleton key={index} />
          ))}
        </View>
      ) : filteredHospitals.length === 0 ? (
        <View style={styles.noResultsContainer}>
          <MaterialCommunityIcons
            name="hospital-building"
            size={64}
            color="#ccc"
          />
          <Text style={styles.noResultsText}>No hospitals found</Text>
          <Text style={styles.suggestionText}>Try adjusting your filters</Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={filteredHospitals}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item, index }) => (
            <HospitalCard
              hospital={item}
              onPress={handleHospitalPress}
              index={index}
            />
          )}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          onScroll={handleScroll}
          scrollEventThrottle={16}
        />
      )}

      <ScrollToTopButton visible={showScrollTop} onPress={scrollToTop} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    padding: 16,
    paddingTop: 40,
    paddingLeft: 28, // Increased left padding
    paddingBottom: 16,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    color: "#1E293B",
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 2,
    letterSpacing: 0.2,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    margin: 12,
    marginTop: 16,
    padding: 0,
    height: 46,
    borderRadius: 23,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  searchIconContainer: {
    paddingLeft: 16,
    paddingRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#1E293B",
    paddingVertical: 8,
    fontFamily: 'Inter_700Bold',
  },
  filterScrollView: {
    marginVertical: 12,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  filterButtonContainer: {
    height: 44,
    width: width / 4.3, // Slightly increased width
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  filterButton: {
    flex: 1,
    paddingHorizontal: 12, // Decreased padding
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterText: {
    color: "#64748B",
    fontSize: 13, // Slightly smaller font
    fontFamily: 'Inter_700Bold',
    textAlign: 'center',
  },
  filterTextActive: {
    color: "#fff",
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  hospitalCard: {
    height: 200,
    marginBottom: 16,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#fff",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
  },
  hospitalLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginLeft: -15,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.2)",
  },
  cardImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  cardOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "100%",
    padding: 16,
    justifyContent: "flex-end",
  },
  typeLabel: {
    position: "absolute",
    top: 12,
    right: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    overflow: "hidden",
    opacity: 0.95,
  },
  typeLabelText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    textShadowColor: 'rgba(255,255,255,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  hospitalInfo: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: 'rgba(0,0,0,0.25)', // Lighter background
  },
  textContent: {
    flex: 1,
    marginRight: 16,
    justifyContent: 'center',
  },
  hospitalName: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    color: '#fff',
    marginBottom: 6,
    letterSpacing: 0.3,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    lineHeight: 20,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationText: {
    color: '#fff',
    fontSize: 13,
    opacity: 0.95,
    marginLeft: 4,
    letterSpacing: 0.2,
    fontFamily: 'Inter_700Bold',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    lineHeight: 18,
  },
  bookNowButton: {
    overflow: "hidden",
    borderRadius: 12,
    alignSelf: 'center',
  },
  bookNowGradient: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  bookNowText: {
    color: '#fff',
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 0.5,
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
  errorText: {
    fontSize: 18,
    color: "#1E293B",
    textAlign: "center",
    marginTop: 20,
  },
  retryButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#4F46E5",
    borderRadius: 10,
  },
  retryText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  keyboardOpen: {
    paddingBottom: 0, // Remove bottom padding when keyboard is open
  },
  clearButton: {
    padding: 8,
  },
  scrollTopButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#3B39E4',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
});