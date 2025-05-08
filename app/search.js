import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity,
  Animated,
  StatusBar
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from "@expo/vector-icons";
import SearchBar from '../components/SearchBar';
import SearchResults from '../components/SearchResults';
import { searchDoctorsAndHospitals } from '../utils/searchUtils';

export default function Search() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (searchQuery.length > 0) {
        setIsSearching(true);
        const results = await searchDoctorsAndHospitals(searchQuery);
        setSearchResults(results);
        setIsSearching(false);
      } else {
        setSearchResults(null);
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [searchQuery]);

  const handleBack = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      router.back();
    });
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={handleBack}
            style={styles.backButton}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="#1a1a1a" />
          </TouchableOpacity>
          <View style={styles.searchBarContainer}>
            <SearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus={true}
            />
          </View>
        </View>

        {searchResults && (
          <SearchResults
            results={searchResults}
            onResultPress={() => {
              handleBack();
            }}
          />
        )}
      </SafeAreaView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  searchBarContainer: {
    flex: 1,
  },
});