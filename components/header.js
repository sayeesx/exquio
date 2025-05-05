import { StyleSheet, View, Text, TextInput, TouchableOpacity, Animated, Easing, ActivityIndicator, StatusBar, Linking } from "react-native"
import Icon from "react-native-vector-icons/MaterialCommunityIcons"
import { useRouter } from "expo-router"
import { useState, useRef, useEffect } from "react"
import NotificationModal from './NotificationModal'
import AmbulanceModal from './AmbulanceModal'
import { searchDoctorsAndHospitals } from '../utils/searchUtils';
import SearchResults from './SearchResults';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAmbulanceAnimation } from '../hooks/useAmbulanceAnimation';

const AmbulanceButton = () => {
  const shimmerX = useAmbulanceAnimation();
  const textOpacity = useRef(new Animated.Value(1)).current;
  const iconOpacity = useRef(new Animated.Value(0)).current;
  const [showSiren, setShowSiren] = useState(false);
  const [showAmbulanceModal, setShowAmbulanceModal] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      // First, fade out the text
      Animated.timing(textOpacity, {
        toValue: 0,
        duration: 1000,
        easing: Easing.bezier(0.4, 0.0, 0.2, 1),
        useNativeDriver: true,
      }).start(() => {
        setShowSiren(true);
        // Fade in the icon with a slight delay
        setTimeout(() => {
          Animated.timing(iconOpacity, {
            toValue: 1,
            duration: 800,
            easing: Easing.bezier(0.4, 0.0, 0.2, 1),
            useNativeDriver: true,
          }).start();
        }, 200);
      });
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <TouchableOpacity
        style={[
          styles.ambulanceButton,
          showSiren && styles.ambulanceButtonIconOnly
        ]}
        onPress={() => setShowAmbulanceModal(true)}
        activeOpacity={0.9}
      >
        <Animated.View
          style={[
            styles.shimmerOverlay,
            {
              transform: [{ translateX: shimmerX }],
              opacity: showSiren ? 0 : 1,
            },
          ]}
        />
        <View style={styles.ambulanceContent}>
          <View style={styles.iconContainer}>
            {!showSiren && <Icon name="ambulance" size={28} color="#fff" />}
            {showSiren && (
              <Animated.View style={{ opacity: iconOpacity }}>
                <Icon name="alarm-light" size={28} color="#FF0000" />
              </Animated.View>
            )}
          </View>
          <Animated.Text 
            style={[
              styles.ambulanceText,
              { opacity: textOpacity }
            ]}
          >
            EMERGENCY
          </Animated.Text>
        </View>
      </TouchableOpacity>

      <AmbulanceModal
        visible={showAmbulanceModal}
        onClose={() => setShowAmbulanceModal(false)}
      />
    </>
  );
};

export default function Header({ scrollOffset }) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [showNotificationModal, setShowNotificationModal] = useState(false)
  const [showAmbulanceModal, setShowAmbulanceModal] = useState(false)
  const bellAnim = useRef(new Animated.Value(0)).current
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeout = useRef(null);
  const intervalRef = useRef(null);
  const insets = useSafeAreaInsets();
  const shimmerX = useAmbulanceAnimation();

  const [notifications] = useState([
    {
      id: '1',
      title: 'Appointment Reminder',
      message: 'Your appointment with Dr. Smith is tomorrow at 10:00 AM',
      time: '1 hour ago',
      icon: 'calendar-clock',
      type: 'info'
    },
    {
      id: '2',
      title: 'New Message',
      message: 'You have a new message from City Hospital',
      time: '2 hours ago',
      icon: 'message-text',
      type: 'message'
    }
  ])

  useEffect(() => {
    const shakeAnimation = Animated.sequence([
      Animated.timing(bellAnim, {
        toValue: 1,
        duration: 100,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      Animated.timing(bellAnim, {
        toValue: -1,
        duration: 100,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      Animated.timing(bellAnim, {
        toValue: 0,
        duration: 100,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ]);

    // Store interval ID in ref
    intervalRef.current = setInterval(() => {
      shakeAnimation.start();
    }, 3000);

    // Cleanup function
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [bellAnim]);

  const handleSearch = async (query) => {
    setSearchQuery(query);
    
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    if (!query || query.length < 1) {
      setSearchResults(null);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    // Reduced debounce time for more responsive feel
    searchTimeout.current = setTimeout(async () => {
      const results = await searchDoctorsAndHospitals(query);
      setSearchResults(results);
      setIsSearching(false);
    }, 150); // Reduced from 300ms to 150ms
  };

  const handleProfile = () => {
    router.push("/profile")
  }

  const handleNotificationPress = () => {
    setShowNotificationModal(true);
  };

  const handleSearchPress = () => {
    router.push({
      pathname: '/search',
      params: { transition: 'fade' }
    });
  };

  const headerStyle = {
    transform: [{ translateY: scrollOffset }]
  };

  return (
    <>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor="transparent" 
        translucent={true} 
      />
      <Animated.View 
        style={[
          styles.container,
          {
            paddingTop: insets.top + 10,
            transform: [
              {
                translateY: scrollOffset.interpolate({
                  inputRange: [0, 170],
                  outputRange: [0, -170],
                  extrapolate: 'clamp'
                })
              }
            ],
            opacity: scrollOffset.interpolate({
              inputRange: [0, 170],
              outputRange: [1, 0],
              extrapolate: 'clamp'
            })
          }
        ]}
      >
        <View style={styles.contentContainer}>
          <View style={styles.topRow}>
            <AmbulanceButton />
            <View style={styles.rightIcons}>
              <TouchableOpacity 
                style={styles.notificationButton} 
                onPress={handleNotificationPress}
              >
                <Animated.View
                  style={[
                    styles.notificationIcon,
                    {
                      transform: [
                        {
                          rotate: bellAnim.interpolate({
                            inputRange: [-1, 1],
                            outputRange: ["-20deg", "20deg"],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  <Icon name="bell-outline" size={24} color="#000" />
                </Animated.View>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleProfile}>
                <View style={styles.profileIcon}>
                  <Icon name="account-circle" size={24} color="#3B39E4" />
                </View>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.title}>Find your desired specialist</Text>
        </View>

        <TouchableOpacity 
          style={styles.searchSection}
          onPress={handleSearchPress}
          activeOpacity={0.7}
        >
          <View style={styles.searchContainer}>
            <View style={styles.searchInput}>
              <Icon name="magnify" size={20} color="#64748B" />
              <Text style={styles.searchPlaceholder}>Search for doctors or hospitals</Text>
            </View>
          </View>
        </TouchableOpacity>

        {searchResults && (
          <View style={styles.resultsContainer}>
            <SearchResults 
              results={searchResults}
              onResultPress={() => {
                setSearchResults(null);
                setSearchQuery('');
              }}
            />
            {(searchResults.doctors.length === 0 && searchResults.hospitals.length === 0) && (
              <View style={styles.noResults}>
                <Text style={styles.noResultsText}>No results found for "{searchQuery}"</Text>
              </View>
            )}
          </View>
        )}

        <NotificationModal
          visible={showNotificationModal}
          onClose={() => setShowNotificationModal(false)}
          notifications={notifications}
        />

        <AmbulanceModal
          visible={showAmbulanceModal}
          onClose={() => setShowAmbulanceModal(false)}
        />
      </Animated.View>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F5F5F5',
    padding: 15,
    height: 'auto',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingBottom: 15, // Add bottom padding
    borderBottomWidth: 0, // Remove border if any
  },
  contentContainer: {
    marginBottom: 5, // Reduced margin
  },
  searchSection: {
    marginBottom: 5,
    backgroundColor: 'transparent',
  },
  nonSearchContent: {
    marginBottom: 16,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15, // Reduced margin
  },
  rightIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  notificationIcon: {
    padding: 8,
  },
  profileIcon: {
    padding: 8,
  },
  title: {
    fontSize: 22, // Updated to match home page section titles
    fontFamily: 'Inter_600SemiBold', // Updated to match home page font
    color: "#1a1a1a", // Updated to match home page color
    marginBottom: 10,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 52,
    paddingLeft: 16,
    overflow: "hidden",
    position: 'relative',
    zIndex: 1,
    marginBottom: 0,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  searchPlaceholder: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: "#64748B",
    marginLeft: 12,
  },
  resultsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 12,
    maxHeight: 300,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 3,
  },
  noResults: {
    padding: 16,
    alignItems: 'center',
  },
  noResultsText: {
    fontFamily: 'Inter_400Regular',
    color: '#666',
    fontSize: 14,
  },
  ambulanceButton: {
    height: 44,
    backgroundColor: '#FF0000',
    borderRadius: 22,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  ambulanceButtonIconOnly: {
    backgroundColor: 'transparent',
    elevation: 0,
    shadowOpacity: 0,
  },
  shimmerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    transform: [{ skewX: '-20deg' }],
  },
  ambulanceContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: '100%',
    width: 160,
  },
  iconContainer: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ambulanceText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    marginLeft: 12,
    letterSpacing: 0,
  },
})

