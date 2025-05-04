import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function SearchResults({ results, onResultPress }) {
  const router = useRouter();

  if (!results?.doctors?.length && !results?.hospitals?.length) {
    return (
      <View style={styles.noResultsContainer}>
        <MaterialCommunityIcons name="text-search" size={64} color="#E2E8F0" />
        <Text style={styles.noResultsText}>No results found</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {results.hospitals?.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hospitals</Text>
          {results.hospitals.map((hospital) => (
            <TouchableOpacity
              key={`hospital-${hospital.id}`}
              style={styles.resultItem}
              onPress={() => {
                router.push(`/hospitals/${hospital.id}`);
                onResultPress?.();
              }}
            >
              <MaterialCommunityIcons name="hospital-building" size={24} color="#6B4EFF" />
              <View style={styles.resultInfo}>
                <Text style={styles.resultName}>{hospital.name}</Text>
                <Text style={styles.resultLocation}>{hospital.location}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {results.doctors?.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Doctors</Text>
          {results.doctors.map((doctor) => (
            <TouchableOpacity
              key={`doctor-${doctor.id}`}
              style={styles.resultItem}
              onPress={() => {
                router.push(`/doctors/${doctor.id}`);
                onResultPress?.();
              }}
            >
              <MaterialCommunityIcons name="doctor" size={24} color="#6B4EFF" />
              <View style={styles.resultInfo}>
                <Text style={styles.resultName}>Dr. {doctor.name}</Text>
                <Text style={styles.resultSpecialty}>{doctor.specialty}</Text>
                {doctor.hospital && (
                  <Text style={styles.hospitalName}>{doctor.hospital.name}</Text>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  noResultsText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#64748B',
    textAlign: 'center',
  },
  section: {
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    paddingHorizontal: 16,
    paddingVertical: 4,
    backgroundColor: '#f5f5f5',
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  resultInfo: {
    marginLeft: 12,
    flex: 1,
  },
  resultName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  resultLocation: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  resultSpecialty: {
    fontSize: 13,
    color: '#6B4EFF',
    marginTop: 2,
  },
  hospitalName: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
});
