import { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import { supabase } from '../../../lib/supabase';
import DoctorCard from '../../../components/DoctorCard';
import { useRouter } from 'expo-router';

export default function DoctorsIndex() {
  const [doctorsByHospital, setDoctorsByHospital] = useState({});
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('doctors')
        .select(`
          id,
          name,
          specialty,
          qualification,
          experience_years,
          avatar_url,
          bio,
          consultation_fee,
          available_days,
          hospitals (
            id,
            name,
            location
          )
        `)
        .order('name');

      if (error) {
        console.error('Error fetching doctors:', error.message);
        return;
      }

      // Group doctors by hospital
      const grouped = data.reduce((acc, doctor) => {
        const hospitalName = doctor.hospitals?.name || 'Independent Doctors';
        if (!acc[hospitalName]) {
          acc[hospitalName] = [];
        }
        // Transform the data to match DoctorCard expectations
        const transformedDoctor = {
          id: doctor.id,
          name: doctor.name,
          specialty: doctor.specialty,
          qualification: doctor.qualification,
          experience: `${doctor.experience_years} Years`,
          avatar_url: doctor.avatar_url,
          bio: doctor.bio,
          fee: doctor.consultation_fee,
          availableDays: doctor.available_days,
          hospital: doctor.hospitals
        };
        acc[hospitalName].push(transformedDoctor);
        return acc;
      }, {});

      setDoctorsByHospital(grouped);
    } catch (error) {
      console.error('Error:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading doctors...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.pageTitle}>Our Doctors</Text>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {Object.entries(doctorsByHospital).map(([hospitalName, doctors]) => (
          <View key={hospitalName} style={styles.hospitalSection}>
            <Text style={styles.hospitalName}>{hospitalName}</Text>
            <View style={styles.hospitalInfo}>
              <Text style={styles.doctorCount}>
                {doctors.length} Doctor{doctors.length !== 1 ? 's' : ''}
              </Text>
            </View>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.doctorsRow}
            >
              {doctors.map(doctor => (
                <View key={doctor.id} style={styles.doctorCardWrapper}>
                  <DoctorCard
                    doctor={doctor}
                    onPress={(doctor) => router.push(`/doctors/${doctor.id}`)}
                  />
                </View>
              ))}
            </ScrollView>
          </View>
        ))}
      </ScrollView>
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
