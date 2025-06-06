import { StyleSheet, View, Text, TextInput, TouchableOpacity, Animated, Easing, ActivityIndicator, StatusBar } from "react-native"
import Icon from "react-native-vector-icons/MaterialCommunityIcons"
import { useRouter } from "expo-router"
import { useState, useRef, useEffect } from "react"
import NotificationModal from './NotificationModal'
import AmbulanceModal from './AmbulanceModal' // Add this import
import { searchDoctorsAndHospitals } from '../utils/searchUtils';
import SearchResults from './SearchResults';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Header({ scrollOffset }) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [showNotificationModal, setShowNotificationModal] = useState(false)
  const [showAmbulanceModal, setShowAmbulanceModal] = useState(false)
  const bellAnim = useRef(new Animated.Value(0)).current
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeout = useRef(null);
  const intervalRef = useRef(null); // Add this ref to store interval ID
  const insets = useSafeAreaInsets();

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

  const headerStyle = {
    transform: [{ translateY: scrollOffset }]
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />
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
            ]
          }
        ]}
      >
        <View style={styles.contentContainer}>
          <View style={styles.topRow}>
            <TouchableOpacity onPress={() => setShowAmbulanceModal(true)}>
              <Icon name="ambulance" size={24} color="#3B39E4" />
            </TouchableOpacity>
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

        <View style={styles.searchSection}>
          <View style={[
            styles.searchContainer,
            searchResults ? styles.searchContainerWithResults : null
          ]}>
            <TextInput
              style={[
                styles.searchInput,
                searchResults ? styles.searchInputWithResults : null
              ]}
              placeholder="Search for doctors or hospitals"
              value={searchQuery}
              onChangeText={handleSearch}
            />
            {isSearching ? (
              <View style={styles.searchButton}>
                <ActivityIndicator size="small" color="#fff" />
              </View>
            ) : (
              <TouchableOpacity style={styles.searchButton}>
                <Icon name="magnify" size={20} color="#fff" />
              </TouchableOpacity>
            )}
          </View>

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
        </View>

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
    marginBottom: 5, // Added margin bottom
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
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    color: "#333",
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
  },
  searchContainerWithResults: {
    marginBottom: 4,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: "#333",
    marginBottom: 0,
  },
  searchInputWithResults: {
    marginBottom: 4,
  },
  searchButton: {
    backgroundColor: "#3B39E4",
    height: 52,
    width: 52,
    justifyContent: "center",
    alignItems: "center",
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
  
})

