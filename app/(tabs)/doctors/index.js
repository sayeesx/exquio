import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  Image, 
  StyleSheet, 
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  RefreshControl 
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { supabase } from '../../../lib/supabase';

export default function Doctors() {
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
          .select('*')
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
        const doctorSpecialty = doctor?.specialty?.toLowerCase() || '';
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.pageTitle}>Find Your Doctor</Text>
          {hospital && (
            <Text style={styles.hospitalName}>{hospital.name}</Text>
          )}
        </View>
      </View>

      <FlatList
        ListHeaderComponent={
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
        }
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
            style={styles.doctorCard}
            onPress={() => router.push(`/doctors/${item.id}`)}
          >
            <Image
              source={{ uri: item.image_url }}
              style={styles.doctorImage}
              resizeMode="contain"
            />
            <View style={styles.doctorInfo}>
              <Text style={styles.doctorName} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.specialtyText} numberOfLines={1}>{item.specialty}</Text>
              <View style={styles.statsRow}>
                <View style={styles.ratingContainer}>
                  <MaterialCommunityIcons name="star" size={12} color="#FFD700" />
                  <Text style={styles.ratingText}>{item.rating?.toFixed(1) || '4.5'}</Text>
                </View>
                {item.experience && (
                  <View style={styles.experienceContainer}>
                    <MaterialCommunityIcons name="briefcase-outline" size={10} color="#6B4EFF" />
                    <Text style={styles.experienceText}>{item.experience}y</Text>
                  </View>
                )}
              </View>
              <View style={styles.feeContainer}>
                <MaterialCommunityIcons name="currency-inr" size={12} color="#2E7D32" />
                <Text style={styles.feeText}>
                  {item.consultation_fee || 'N/A'}
                </Text>
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
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  pageTitle: {
    fontSize: 24,
    fontFamily: 'Inter_600SemiBold',
    color: '#1A1A1A',
    right: 10,
    marginTop: 14,
  },
  hospitalName: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#6B4EFF',
    marginTop: 2,
    right: 10,
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
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
    height: 160, // Adjusted total height
  },
  doctorImage: {
    width: '100%',
    height: 60, // Reduced image height
    backgroundColor: '#F5F5F5',
    resizeMode: 'contain' // Added to maintain aspect ratio
  },
  doctorInfo: {
    padding: 6, // Reduced from 8
    flex: 1,
    justifyContent: 'space-between',
  },
  doctorName: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  specialtyText: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    color: '#666666',
    marginBottom: 4,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9E6',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  ratingText: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: '#FFB800',
    marginLeft: 2,
  },
  experienceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0EEFF',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  experienceText: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#6B4EFF',
    marginLeft: 2,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  priceText: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: '#2E7D32',
    marginLeft: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  feeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  feeText: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
    color: '#2E7D32',
    marginLeft: 2,
  },
});
