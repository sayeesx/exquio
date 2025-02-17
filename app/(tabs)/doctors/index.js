import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  Image, 
  StyleSheet, 
  TouchableOpacity,
  ActivityIndicator 
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../../../lib/supabase';

export default function Doctors() {
  const { hospital_id } = useLocalSearchParams();
  const router = useRouter();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hospital, setHospital] = useState(null);

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
          <Text style={styles.headerTitle}>Doctors</Text>
          {hospital && (
            <Text style={styles.hospitalName}>{hospital.name}</Text>
          )}
        </View>
      </View>

      <FlatList
        data={doctors}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.doctorCard}
            onPress={() => router.push(`/doctors/${item.id}`)}
          >
            <Image
              source={{ uri: item.image_url }}
              style={styles.doctorImage}
              resizeMode="cover"
            />
            <View style={styles.doctorInfo}>
              <Text style={styles.doctorName}>{item.name}</Text>
              <Text style={styles.specialtyText}>{item.specialty}</Text>
              <View style={styles.statsRow}>
                <View style={styles.ratingContainer}>
                  <MaterialCommunityIcons name="star" size={16} color="#FFD700" />
                  <Text style={styles.ratingText}>{item.rating?.toFixed(1) || '4.5'}</Text>
                </View>
                {item.experience && (
                  <Text style={styles.experienceText}>{item.experience} exp.</Text>
                )}
              </View>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    paddingTop: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pageTitle: {
    fontSize: 28,
    fontFamily: 'Inter_600SemiBold',
    color: '#000',
    padding: 20,
    paddingBottom: 10,
  },
  scrollView: {
    flex: 1,
  },
  hospitalSection: {
    marginBottom: 24,
  },
  hospitalName: {
    fontSize: 20,
    fontFamily: 'Inter_600SemiBold',
    color: '#3B39E4',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  doctorsRow: {
    paddingLeft: 20,
  },
  doctorCardWrapper: {
    marginRight: 16,
  },
  hospitalInfo: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  doctorCount: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#666',
  }
});
