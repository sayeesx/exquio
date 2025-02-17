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

const DoctorCard = ({ doctor, onPress }) => (
  <TouchableOpacity style={styles.doctorCard} onPress={onPress}>
    <Image
      source={{ uri: doctor.image_url }}
      style={styles.doctorImage}
      resizeMode="cover"
    />
    <View style={styles.doctorInfo}>
      <Text style={styles.doctorName}>{doctor.name}</Text>
      <Text style={styles.doctorSpecialty}>{doctor.specialty}</Text>
      <View style={styles.doctorDetails}>
        <View style={styles.ratingContainer}>
          <MaterialCommunityIcons name="star" size={16} color="#FFD700" />
          <Text style={styles.ratingText}>{doctor.rating?.toFixed(1) || '4.5'}</Text>
        </View>
        {doctor.experience && (
          <Text style={styles.experienceText}>{doctor.experience} exp.</Text>
        )}
      </View>
    </View>
  </TouchableOpacity>
);

export default function HospitalDoctors() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hospital, setHospital] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch hospital details
        const { data: hospitalData, error: hospitalError } = await supabase
          .from('hospitals')
          .select('name')
          .eq('id', id)
          .single();

        if (hospitalError) throw hospitalError;

        // Fetch all doctors for this hospital
        const { data: doctorsData, error: doctorsError } = await supabase
          .from('doctors')
          .select('*')
          .eq('hospital_id', id)
          .order('name');

        if (doctorsError) throw doctorsError;

        setHospital(hospitalData);
        setDoctors(doctorsData);
      } catch (error) {
        console.error('Error fetching doctors:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

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
          <Text style={styles.headerTitle}>Our Doctors</Text>
          <Text style={styles.hospitalName}>{hospital?.name}</Text>
        </View>
      </View>

      <FlatList
        data={doctors}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <DoctorCard
            doctor={item}
            onPress={() => router.push(`/doctors/${item.id}`)}
          />
        )}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="doctor" size={64} color="#ddd" />
            <Text style={styles.emptyText}>No doctors found</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    padding: 8,
  },
  headerTextContainer: {
    marginLeft: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  hospitalName: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 4,
  },
  listContainer: {
    padding: 16,
  },
  doctorCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  doctorImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F1F5F9',
  },
  doctorInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  doctorSpecialty: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
  },
  doctorDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#1E293B',
  },
  experienceText: {
    fontSize: 14,
    color: '#64748B',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 64,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 16,
  },
});
