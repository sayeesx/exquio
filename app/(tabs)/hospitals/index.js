import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  StatusBar,
  Platform,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { supabase } from "../../../lib/supabase";
import { useFonts, Inter_700Bold } from '@expo-google-fonts/inter';
import SearchBar from '../../../components/SearchBar';
import { HospitalCardSkeleton } from "../../../components/HospitalCardSkeleton";
import FilterButtons from '../../../components/FilterButtons';

const HospitalCard = ({ hospital }) => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const type = hospital?.type?.charAt(0).toUpperCase() + hospital?.type?.slice(1) || 'Unknown';

  const handleBookPress = async () => {
    setIsLoading(true);
    try {
      await router.push(`/(tabs)/hospitals/${hospital.id}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.card}>
      <Image source={{ uri: hospital.image_url || hospital.image }} style={styles.cardImage} />
      <View style={styles.cardContent}>
        <View style={styles.typeLabel}>
          <Text style={styles.typeLabelText}>{type}</Text>
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
              {hospital.name}
            </Text>
            <View style={styles.locationRow}>
              <MaterialCommunityIcons name="map-marker" size={14} color="#64748B" />
              <Text style={styles.locationText} numberOfLines={1}>
                {hospital.location || 'Location not specified'}
              </Text>
            </View>
          </View>
        </View>
        <TouchableOpacity
          onPress={handleBookPress}
          style={[styles.bookNowButton, isLoading && styles.bookingButton]}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.bookNowText}>Book Now</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const EmptyState = ({ message }) => (
  <View style={styles.emptyState}>
    <MaterialCommunityIcons 
      name={message.includes("internet") ? "wifi-off" : "hospital-box"} 
      size={64} 
      color="#64748B" 
    />
    <Text style={styles.emptyStateText}>{message}</Text>
  </View>
);

const LoadingSkeletons = () => (
  <View style={styles.skeletonContainer}>
    {[1, 2, 3].map((key) => (
      <HospitalCardSkeleton key={key} />
    ))}
  </View>
);

export default function Hospitals() {
  const [hospitals, setHospitals] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [fontsLoaded] = useFonts({ Inter_700Bold });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isNetworkError, setIsNetworkError] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [prevFilter, setPrevFilter] = useState('all');

  const loadHospitals = async () => {
    try {
      setLoading(true);
      setIsNetworkError(false);

      const { data, error } = await supabase
        .from("hospitals")
        .select("*")
        .order("name");

      if (error) throw error;
      setHospitals(data || []);
    } catch (error) {
      console.error("Error loading hospitals:", error);
      setIsNetworkError(true);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadHospitals().finally(() => setRefreshing(false));
  }, []);

  useEffect(() => {
    loadHospitals();
  }, []);

  const handleFilterPress = (filter) => {
    setPrevFilter(selectedFilter);
    setSelectedFilter(filter);
  };

  const filteredHospitals = useMemo(() => {
    return hospitals.filter(hospital => 
      (selectedFilter === 'all' || hospital.type === selectedFilter) &&
      hospital.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [hospitals, searchQuery, selectedFilter]);

  if (!fontsLoaded) return null;

  const renderContent = () => {
    if (loading && !refreshing) {
      return (
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <LinearGradient 
            colors={["#fff", "#f8fafc"]} 
            style={styles.header}
          >
            <Text style={styles.headerTitle}>Find Hospitals</Text>
            <Text style={styles.headerSubtitle}>Discover healthcare near you</Text>
            <SearchBar 
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search hospitals..."
            />
            <FilterButtons
              activeFilter={selectedFilter}
              onFilterChange={handleFilterPress}
            />
          </LinearGradient>
          <LoadingSkeletons />
        </ScrollView>
      );
    }

    if (isNetworkError) {
      return (
        <ScrollView style={styles.scrollView}>
          <LinearGradient 
            colors={["#fff", "#f8fafc"]} 
            style={styles.header}
          >
            <Text style={styles.headerTitle}>Find Hospitals</Text>
            <Text style={styles.headerSubtitle}>Discover healthcare near you</Text>
            <SearchBar 
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search hospitals..."
            />
            <FilterButtons
              activeFilter={selectedFilter}
              onFilterChange={handleFilterPress}
            />
          </LinearGradient>
          <EmptyState message="Please check your internet connection" />
        </ScrollView>
      );
    }

    return (
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#3B39E4"]}
            tintColor="#3B39E4"
          />
        }
      >
        <LinearGradient 
          colors={["#fff", "#f8fafc"]} 
          style={styles.header}
        >
          <Text style={styles.headerTitle}>Find Hospitals</Text>
          <Text style={styles.headerSubtitle}>Discover healthcare near you</Text>
          <SearchBar 
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search hospitals..."
          />
          <FilterButtons
            activeFilter={selectedFilter}
            onFilterChange={handleFilterPress}
          />
        </LinearGradient>
        <View style={styles.contentContainer}>
          {refreshing ? (
            <LoadingSkeletons />
          ) : filteredHospitals.length > 0 ? (
            filteredHospitals.map((hospital) => (
              <HospitalCard 
                key={hospital.id} 
                hospital={hospital}
              />
            ))
          ) : (
            <EmptyState message="No hospitals found" />
          )}
        </View>
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      {renderContent()}
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
    paddingTop: Platform.OS === 'ios' ? StatusBar.currentHeight + 16 : 16,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingBottom: 16,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    marginLeft: 18,
    color: "#1E293B",
    fontFamily: 'Inter_700Bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    marginLeft: 18,
    fontSize: 14,
    color: "#64748B",
    fontFamily: 'Inter_700Bold',
    marginBottom: 18,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingTop: 8,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardImage: {
    width: '100%',
    height: 160,
    resizeMode: 'cover',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  cardContent: {
    padding: 12,
    paddingTop: 8,
    position: 'relative',
    marginTop: -20,
    paddingBottom: 16,
  },
  typeLabel: {
    position: 'absolute',
    right: 16,
    top: 7,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  typeLabelText: {
    color: '#3B39E4',
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  hospitalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 80,
    marginTop: 12,
  },
  hospitalLogo: {
    width: 28,
    height: 28,
    marginRight: 12,
    backgroundColor: '#fff',
    borderRadius: 4,
  },
  textContent: {
    flex: 1,
  },
  hospitalName: {
    fontSize: 18,
    color: '#1E293B',
    fontFamily: 'Inter_700Bold',
    marginBottom: 6,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  locationText: {
    color: '#64748B',
    fontSize: 12,
    marginLeft: 4,
    fontFamily: 'Inter_700Bold',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyStateText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748B',
    fontFamily: 'Inter_700Bold',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(59, 57, 228, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
  },
  skeletonContainer: {
    padding: 16,
  },
  bookNowButton: {
    position: 'absolute',
    right: 12,
    top: 37,
    backgroundColor: '#3B39E4',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#3B39E4",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
    minWidth: 80,
  },
  bookingButton: {
    opacity: 0.8,
  },
  bookNowText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 0.2,
  },
});