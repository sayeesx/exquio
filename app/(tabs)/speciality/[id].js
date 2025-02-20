import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase, checkConnection } from '../../../lib/supabase';
import DoctorCard from '../../../components/DoctorCard';
import LoadingAnimation from '../../../components/LoadingAnimation';

export default function SpecialtyDoctors() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const [doctors, setDoctors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const specialtyName = params.specialty?.toLowerCase().trim();
        console.log('Looking for specialty:', specialtyName);

        // Simple query first
        const { data: specialtyData, error: specialtyError } = await supabase
          .from('specialties')
          .select('*');

        console.log('All specialties:', specialtyData);

        if (specialtyError) {
          console.error('Database error:', specialtyError);
          throw new Error('Failed to query specialties');
        }

        const matchingSpecialty = specialtyData?.find(s => 
          s.name.toLowerCase() === specialtyName ||
          s.display_name.toLowerCase() === specialtyName
        );

        if (!matchingSpecialty) {
          const availableSpecialties = specialtyData?.map(s => s.name).join(', ');
          throw new Error(`Specialty "${specialtyName}" not found. Available: ${availableSpecialties}`);
        }

        console.log('Found specialty:', matchingSpecialty);

        // Get doctors for this specialty
        const { data: doctorsData, error: doctorsError } = await supabase
          .from('doctors')
          .select('*, hospital:hospital_id(*)')
          .eq('specialty_id', matchingSpecialty.id);

        if (doctorsError) throw doctorsError;

        console.log(`Found ${doctorsData?.length || 0} doctors`);
        setDoctors(doctorsData || []);

      } catch (err) {
        console.error('Error details:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (params?.specialty) {
      fetchDoctors();
    }
  }, [params?.specialty]);

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <LoadingAnimation />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        {/* Use display_name from database */}
        <Text style={styles.title}>{params.specialty ? `${params.specialty.charAt(0).toUpperCase() + params.specialty.slice(1)} Specialists` : 'Specialists'}</Text>
      </View>

      {error ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : doctors.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.noResultsText}>No doctors found for this specialty</Text>
        </View>
      ) : (
        <FlatList
          data={doctors}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <DoctorCard
              doctor={item}
              onPress={() => router.push({
                pathname: `/doctors/${item.id}`,
                params: { doctorData: JSON.stringify(item) }
              })}
            />
          )}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  backButtonText: {
    fontSize: 24,
    color: '#333',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  listContent: {
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  noResultsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
