import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Image,
  SafeAreaView 
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function AppointmentDetails() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  // In a real app, fetch appointment details based on id
  const appointment = {
    id: 1,
    doctorName: 'Dr. Jennifer Smith',
    specialty: 'Orthopedic Consultation (Foot & Ankle)',
    date: 'Wed, 7 Sep 2024',
    time: '10:30 - 11:30 AM',
    image: '/api/placeholder/50/50',
    hospitalName: 'City General Hospital',
    hospitalLocation: '123 Healthcare Ave, City',
    status: 'Confirmed',
    notes: 'Please bring your previous medical records and any recent X-rays.',
    appointmentType: 'In-Person Visit',
    insuranceRequired: true,
    preparationInstructions: [
      'Fast for 8 hours before the appointment',
      'Bring a list of current medications',
      'Wear comfortable clothing',
      'Arrive 15 minutes early for registration'
    ]
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Icon name="arrow-left" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Appointment Details</Text>
        </View>

        {/* Status Banner */}
        <View style={styles.statusBanner}>
          <Icon 
            name={appointment.status === 'Confirmed' ? 'check-circle' : 'clock-outline'} 
            size={24} 
            color="#fff" 
          />
          <Text style={styles.statusText}>{appointment.status}</Text>
        </View>

        {/* Doctor Info */}
        <View style={styles.section}>
          <View style={styles.doctorInfo}>
            <Image 
              source={{ uri: appointment.image }}
              style={styles.doctorImage}
            />
            <View style={styles.doctorDetails}>
              <Text style={styles.doctorName}>{appointment.doctorName}</Text>
              <Text style={styles.specialty}>{appointment.specialty}</Text>
            </View>
          </View>
        </View>

        {/* Appointment Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appointment Information</Text>
          
          <View style={styles.infoRow}>
            <Icon name="calendar" size={20} color="#666" />
            <Text style={styles.infoText}>{appointment.date}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Icon name="clock-outline" size={20} color="#666" />
            <Text style={styles.infoText}>{appointment.time}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Icon name="hospital-building" size={20} color="#666" />
            <View>
              <Text style={styles.infoText}>{appointment.hospitalName}</Text>
              <Text style={styles.subInfoText}>{appointment.hospitalLocation}</Text>
            </View>
          </View>
          
          <View style={styles.infoRow}>
            <Icon name="clipboard-text" size={20} color="#666" />
            <Text style={styles.infoText}>{appointment.appointmentType}</Text>
          </View>
        </View>

        {/* Preparation Instructions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preparation Instructions</Text>
          {appointment.preparationInstructions.map((instruction, index) => (
            <View key={index} style={styles.instructionRow}>
              <Icon name="check" size={20} color="#6B4EFF" />
              <Text style={styles.instructionText}>{instruction}</Text>
            </View>
          ))}
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Notes</Text>
          <Text style={styles.notesText}>{appointment.notes}</Text>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={[styles.button, styles.rescheduleButton]}
          onPress={() => {/* Handle reschedule */}}
        >
          <Icon name="calendar-clock" size={20} color="#6B4EFF" />
          <Text style={styles.rescheduleButtonText}>Reschedule</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.cancelButton]}
          onPress={() => {/* Handle cancel */}}
        >
          <Icon name="close" size={20} color="#FF4B4B" />
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 10,
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6B4EFF',
    padding: 15,
    marginHorizontal: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  statusText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  section: {
    padding: 20,
    borderBottomWidth: 5,
    borderBottomColor: '#F0F0F0',
  },
  doctorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  doctorImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  doctorDetails: {
    flex: 1,
  },
  doctorName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  specialty: {
    fontSize: 14,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  infoText: {
    fontSize: 14,
    color: '#000',
    marginLeft: 10,
  },
  subInfoText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 10,
  },
  instructionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  instructionText: {
    fontSize: 14,
    color: '#000',
    marginLeft: 10,
    flex: 1,
  },
  notesText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  rescheduleButton: {
    backgroundColor: '#F0EEFF',
  },
  cancelButton: {
    backgroundColor: '#FFF0F0',
  },
  rescheduleButtonText: {
    color: '#6B4EFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 5,
  },
  cancelButtonText: {
    color: '#FF4B4B',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 5,
  },
});