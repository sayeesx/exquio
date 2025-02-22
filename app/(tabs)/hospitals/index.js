"use client";

import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
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
  Easing,
} from "react-native";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { supabase } from "../../../lib/supabase";
import { HospitalCardSkeleton } from "../../../components/HospitalCardSkeleton";
import { secureLog } from "../../../utils/secureLogging";
import { useFonts, Inter_700Bold } from '@expo-google-fonts/inter';

const { width } = Dimensions.get("window");

const AnimatedCard = Animated.createAnimatedComponent(TouchableOpacity);
const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);
const AnimatedText = Animated.createAnimatedComponent(Text);

const filterIcons = {
  all: "view-dashboard-outline",
  multi: "hospital",
  clinic: "stethoscope",
  ayurveda: "flower-tulip"
};

const FilterButton = ({ filter, isActive, onPress }) => (
  <View style={[
    styles.filterButtonContainer,
    filter === 'ayurveda' && styles.ayurvedaContainer,
    filter === 'all' && styles.allContainer
  ]}>
    <TouchableOpacity
      onPress={() => onPress(filter)}
      style={[
        styles.filterButton,
        filter === 'ayurveda' && styles.ayurvedaButton,
        filter === 'all' && styles.allButton
      ]}
    >
      <View style={[
        styles.filterContent,
        filter === 'ayurveda' && styles.ayurvedaContent,
        filter === 'all' && styles.allContent
      ]}>
        <MaterialCommunityIcons
          name={filterIcons[filter]}
          size={15}
          color={isActive ? "#ffffff" : "#64748B"}
          style={styles.filterIcon}
        />
        <Text style={[
          styles.filterText, 
          isActive && styles.filterTextActive
        ]}>
          {filter === 'ayurveda' 
            ? 'Ayurveda' 
            : filter && typeof filter === 'string' 
              ? filter.charAt(0).toUpperCase() + filter.slice(1)
              : ''
          }
        </Text>
      </View>
    </TouchableOpacity>
  </View>
);

// Memoized FilterToggle with smooth, slower animation
const FilterToggle = React.memo(({ selectedFilter, prevFilter }) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const filterOrder = ["all", "multi", "clinic", "ayurveda"];
  const initialized = useRef(false);

  const animateToggle = useCallback(() => {
    const prevIndex = filterOrder.indexOf(prevFilter);
    const currentIndex = filterOrder.indexOf(selectedFilter);
    const baseWidth = width / 4.5;
    const prevPosition = prevIndex * baseWidth;
    const currentPosition = currentIndex * baseWidth;

    if (!initialized.current) {
      translateX.setValue(currentPosition); // Initial position without animation
      initialized.current = true;
    } else {
      translateX.stopAnimation(() => {
        translateX.setValue(prevPosition);
        Animated.spring(translateX, {
          toValue: currentPosition,
          damping: 25, // Increased damping for slower, smoother stop
          stiffness: 150, // Reduced stiffness for slower movement
          mass: 1.2, // Slightly higher mass for a more deliberate feel
          useNativeDriver: true,
        }).start();
      });
    }
  }, [selectedFilter, prevFilter]);

  useEffect(() => {
    animateToggle();
  }, [animateToggle]);

  return (
    <Animated.View
      style={[
        styles.filterToggle,
        {
          transform: [{ translateX }],
          width: width / 4.5,
        },
      ]}
    />
  );
}, (prevProps, nextProps) => prevProps.selectedFilter === nextProps.selectedFilter && prevProps.prevFilter === nextProps.prevFilter);

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
        setTimeout(() => {
          index = 0;
          startTypingAnimation();
        }, 800);
      }
    }, 100);
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
  const [isBooking, setIsBooking] = useState(false);
  const [showSpinner, setShowSpinner] = useState(false);
  const translateY = useRef(new Animated.Value(50)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const spinValue = useRef(new Animated.Value(0)).current;

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

  useEffect(() => {
    if (showSpinner) {
      Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 500,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    } else {
      spinValue.setValue(0);
    }
  }, [showSpinner]);

  const router = useRouter();
  const hospitalType = hospital?.type || 'Unknown';
  const capitalizedType = hospitalType.charAt(0).toUpperCase() + hospitalType.slice(1);

  const handleBookPress = async () => {
    setIsBooking(true);
    const startTime = Date.now();

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      router.push(`/(tabs)/hospitals/${hospital.id}`);
      
      const fetchTime = Date.now() - startTime;
      if (fetchTime > 300) {
        setShowSpinner(true);
      }
    } catch (error) {
      console.error("Navigation error:", error);
      Alert.alert("Error", "Unable to navigate to hospital page.");
    } finally {
      setTimeout(() => {
        setIsBooking(false);
        setShowSpinner(false);
      }, 300);
    }
  };

  const handleButtonPressIn = () => {
    Animated.timing(scale, {
      toValue: 0.95,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const handleButtonPressOut = () => {
    Animated.timing(scale, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const rotate = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  return (
    <Animated.View style={[styles.hospitalCard, { opacity, transform: [{ translateY }] }]}>
      <Image source={{ uri: hospital.image_url }} style={styles.cardImage} />
      <View style={styles.infoContainer}>
        <View style={styles.typeLabel}>
          <Text style={styles.typeLabelText}>
            {capitalizedType}
          </Text>
        </View>
        <View style={styles.hospitalInfo}>
          {hospital.logo_url && (
            <Image
              source={{ uri: hospital.logo_url }}
              style={styles.hospitalLogo}
            />
          )}
          <View style={styles.textContent}>
            <Text style={styles.hospitalName} numberOfLines={1}>
              {hospital.name || 'Unnamed Hospital'}
            </Text>
            <View style={styles.locationRow}>
              <MaterialCommunityIcons
                name="map-marker"
                size={14}
                color="#64748B"
              />
              <Text style={styles.locationText} numberOfLines={1}>
                {hospital.location || 'Location not specified'}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={handleBookPress}
            onPressIn={handleButtonPressIn}
            onPressOut={handleButtonPressOut}
            style={[styles.bookNowButton, isBooking && styles.bookingButton]}
            activeOpacity={1}
          >
            <Animated.View style={{ transform: [{ scale }] }}>
              <LinearGradient
                colors={["#4F46E5", "#3B82F6"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.bookNowGradient}
              >
                {isBooking && showSpinner ? (
                  <Animated.View
                    style={[
                      styles.spinner,
                      {
                        width: 20,
                        height: 20,
                        borderRadius: 10,
                        borderWidth: 2,
                        borderColor: 'rgba(255,255,255,0.2)',
                        borderTopColor: '#fff',
                        transform: [{ rotate }],
                      }
                    ]}
                  />
                ) : (
                  <Text style={styles.bookNowText}>Book Now</Text>
                )}
              </LinearGradient>
            </Animated.View>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
});

const HeaderSection = ({ searchQuery, setSearchQuery, selectedFilter, handleFilterPress, prevFilter }) => (
  <>
    <StatusBar barStyle="dark-content" backgroundColor="#fff" />
    <LinearGradient 
      colors={["#fff", "#f8fafc"]} 
      style={[
        styles.header,
        { paddingTop: Platform.OS === 'ios' ? StatusBar.currentHeight + 16 : 16 }
      ]}
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
      <View style={styles.filterWrapper}>
        <View style={styles.filterContainer}>
          <FilterToggle selectedFilter={selectedFilter} prevFilter={prevFilter} />
          {["all", "multi", "clinic", "ayurveda"].map((filter) => (
            <FilterButton
              key={filter}
              filter={filter}
              isActive={selectedFilter === filter}
              onPress={handleFilterPress}
            />
          ))}
        </View>
      </View>
    </LinearGradient>
  </>
);

export default function Hospitals() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [prevFilter, setPrevFilter] = useState("all");
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSkeleton, setShowSkeleton] = useState(true);
  const [error, setError] = useState(null);
  const [isNetworkDown, setIsNetworkDown] = useState(false); // New state for network status
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
      setShowSkeleton(true);
      setIsNetworkDown(false);

      const fetchPromise = supabase
        .from("hospitals")
        .select("*")
        .order("name");

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Fetch timeout")), 1000)
      );

      const { data, error } = await Promise.race([fetchPromise, timeoutPromise]);

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
      setShowSkeleton(false);
    } catch (err) {
      console.error("Error loading hospitals:", err.message);
      setError(err.message);
      if (err.message === "Fetch timeout" || err.code === "ECONNREFUSED" || err.message.includes("network")) {
        setIsNetworkDown(true); // Detect network-related errors
        setShowSkeleton(true);
      } else {
        setIsNetworkDown(false);
        setShowSkeleton(false);
      }
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
    setPrevFilter(selectedFilter);
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

  const renderListHeader = () => (
    <HeaderSection 
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      selectedFilter={selectedFilter}
      handleFilterPress={handleFilterPress}
      prevFilter={prevFilter}
    />
  );

  if (loading || showSkeleton) {
    return (
      <View style={styles.container}>
        {renderListHeader()}
        <View style={styles.contentContainer}>
          {isNetworkDown ? (
            <View style={styles.networkErrorContainer}>
              <MaterialCommunityIcons name="wifi-off" size={64} color="#64748B" />
              <Text style={styles.networkErrorText}>Please check your network connection</Text>
              <TouchableOpacity style={styles.reloadButton} onPress={loadHospitals}>
                <Text style={styles.reloadText}>Reload</Text>
              </TouchableOpacity>
            </View>
          ) : (
            [1, 2, 3].map((index) => (
              <HospitalCardSkeleton key={index} />
            ))
          )}
        </View>
      </View>
    );
  }

  if (error && !showSkeleton) {
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
      <Animated.FlatList
        ref={flatListRef}
        data={filteredHospitals}
        ListHeaderComponent={renderListHeader}
        ListEmptyComponent={
          <View style={styles.noResultsContainer}>
            <MaterialCommunityIcons
              name="hospital-building"
              size={64}
              color="#ccc"
            />
            <Text style={styles.noResultsText}>No hospitals found</Text>
            <Text style={styles.suggestionText}>Try adjusting your filters</Text>
          </View>
        }
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
      <ScrollToTopButton visible={showScrollTop} onPress={scrollToTop} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    padding: 16,
    paddingLeft: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 28,
    color: "#1E293B",
    marginLeft: 18,
    letterSpacing: -0.5,
    marginTop: 16,
    fontFamily: 'Inter_700Bold',
  },
  headerSubtitle: {
    fontSize: 14,
    marginLeft: 18,
    color: "#64748B",
    marginTop: 2,
    letterSpacing: 0.2,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginRight: 12,
    marginTop: 16,
    padding: 0,
    height: 46,
    width: "100%",
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
  filterWrapper: {
    marginTop: 16,
    marginBottom: 0,
    zIndex: 2,
    position: 'relative',
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 32,
    padding: 4,
    height: 48,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  filterToggle: {
    position: 'absolute',
    height: 40,
    backgroundColor: '#3B39E4',
    borderRadius: 32,
    top: 4,
    left: 2,
    shadowColor: "#3B39E4",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1,
  },
  filterButtonContainer: {
    flex: 1,
    height: 40,
    position: 'relative',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  filterButton: {
    width: '100%',
    height: '100%',
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingHorizontal: 8,
    zIndex: 2,
  },
  filterContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    zIndex: 3,
    marginLeft: 8,
  },
  filterIcon: {
    marginRight: 6,
  },
  filterText: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    color: '#64748B',
    textAlign: 'left',
  },
  filterTextActive: {
    color: '#ffffff',
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  contentContainer: {
    flex: 1,
  },
  listContainer: {
    paddingTop: 8,
    paddingBottom: 20,
    flexGrow: 1,
  },
  hospitalCard: {
    width: "94%",
    marginHorizontal: "3%",
    marginBottom: 20,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#fff",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  cardImage: {
    width: "100%",
    height: 180,
    resizeMode: "cover",
  },
  infoContainer: {
    backgroundColor: "#fff",
    padding: 12,
    paddingTop: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    position: 'relative',
    top: -20,
  },
  typeLabel: {
    position: "absolute",
    top: -16,
    right: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
  },
  typeLabelText: {
    color: "#3B39E4",
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  hospitalInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  hospitalLogo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.9)",
    marginRight: 12,
    backgroundColor: '#fff',
  },
  textContent: {
    flex: 1,
    justifyContent: 'center',
  },
  hospitalName: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    color: '#1E293B',
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationText: {
    color: '#64748B',
    fontSize: 12,
    opacity: 0.9,
    marginLeft: 4,
    letterSpacing: 0.3,
    fontFamily: 'Inter_700Bold',
  },
  bookNowButton: {
    borderRadius: 10,
    overflow: "hidden",
  },
  bookingButton: {
    opacity: 1,
  },
  bookNowGradient: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  bookNowText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 0.5,
  },
  spinner: {
    borderStyle: 'solid',
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 100,
  },
  noResultsText: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
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
    fontFamily: 'Inter_700Bold',
  },
  networkErrorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  networkErrorText: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    color: "#64748B",
    marginTop: 16,
    textAlign: "center",
  },
  reloadButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#4F46E5",
    borderRadius: 10,
  },
  reloadText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
  },
  keyboardOpen: {
    paddingBottom: 0,
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
  ayurvedaContainer: {
    paddingLeft: -10,
  },
  ayurvedaButton: {
    paddingLeft: -10,
  },
  allContainer: {
    alignItems: 'flex-start',
  },
  allButton: {
    paddingLeft: -20,
  },
  allContent: {
    marginLeft: 20,
  },
});