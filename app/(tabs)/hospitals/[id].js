import React, { useState } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Update the hospitals data to include all three hospitals
const hospitals = [
  {
    id: '1',
    name: 'ASTER MIMS Hospital',
    location: 'NH 66, Calicut-Thrissur Road, Kottakkal, Kerala, 676501',
    image: 'https://www.asterhospitals.in/sites/default/files/styles/optimize_images/public/2021-01/hospital-image_1.png.webp?itok=7qR8Hcp7',
    description: 'Aster MIMS Kottakkal is an NABH accredited multi-specialty hospital that delivers a comprehensive range of preventive, acute and outpatient services. The hospital, located in downtown Kottakkal in Kerala is ideal for people seeking treatment for various ailments, because of its excellent infrastructure and our commitment to maintain the highest standards of safety, cleanliness, integrity and honesty.',
    workingHours: {
      regular: '24/7',
      emergency: '24/7'
    },
    services: [
      'Cardiac Sciences',
      'Orthopaedics',
      'Neuro Sciences',
      'General Surgery',
      'Child Development Centre',
      'Medical Oncology',
      'Endocrinology & Diabetology',
      'Critical Care Medicine',
      'Urology',
      'Clinical Imaging',
      'Paediatrics & Neonatology',
      'Obstetrics & Gynaecology'
    ],
    doctors: [
      {
        id: '101',
        name: 'Dr. Thejus Kallarikkandi',
        specialty: 'Critical Care Medicine',
        image: 'https://www.asterhospitals.in/sites/default/files/2024-01/Dr.%20Thejus%20Kallarikkandi.jpg',
        experience: '15+ years',
        rating: 4.8,
        designation: 'Senior Consultant & HOD - Critical Care Medicine'
      },
      {
        id: '102',
        name: 'Dr. Tahsin Neduvanchery',
        specialty: 'Cardiology',
        image: 'https://www.asterhospitals.in/sites/default/files/2024-01/Dr.%20Tahsin%20Neduvanchery.jpg',
        experience: '12+ years',
        rating: 4.9,
        designation: 'Sr. Consultant - Interventional Cardiology'
      },
      {
        id: '103',
        name: 'Dr. Shaji KR',
        specialty: 'Neurosurgery',
        image: 'https://www.asterhospitals.in/sites/default/files/2024-01/best%20neurosurgeon%20in%20kerala_0.jpg',
        experience: '15+ years',
        rating: 4.9,
        designation: 'Senior Consultant - Neuro & Spine Surgery'
      },
      {
        id: '104',
        name: 'Dr. Faizal M Iqbal',
        specialty: 'Orthopaedics',
        image: 'https://www.asterhospitals.in/sites/default/files/2024-01/orthopedic%20surgeon%20in%20kottakkal_0.jpg',
        experience: '12+ years',
        rating: 4.8,
        designation: 'Sr. Consultant - Orthopaedic & Spine Surgery'
      },
      {
        id: '105',
        name: 'Dr. Dwitheeya P',
        specialty: 'Psychology',
        image: 'https://www.asterhospitals.in/sites/default/files/2024-01/Dr%20Dwitheeya%2C%20Child%20Psychologist_0.jpg',
        experience: '10+ years',
        rating: 4.7,
        designation: 'Head of the department, Psychologist and Early Interventionist'
      },
      {
        id: '106',
        name: 'Dr. Mahesh Menon',
        specialty: 'Gastroenterology',
        image: 'https://www.asterhospitals.in/sites/default/files/2024-01/Dr.%20Mahesh%2C%20Gastroenterology_0.jpg',
        experience: '15+ years',
        rating: 4.9,
        designation: 'Senior Consultant – Gastroenterology'
      }
    ],
    contact: {
      phone: '+91 9656000611',
      emergency: '0483 280 7000',
      email: 'info.ktkl@asterhospital.com'
    }
  },
  {
    id: '2',
    name: 'ALMAS Hospital',
    location: 'Near Bus Stand',
    image:  require("../../../assets/hospital/almas.png"),
    description: 'ALMAS Hospital is known for its excellent patient care and modern medical facilities, serving the community with dedication.',
    workingHours: {
      regular: '8:00 AM - 8:00 PM',
      emergency: '24/7'
    },
    services: [
      'Emergency Services',
      'General Medicine',
      'Orthopedics',
      'ENT',
      'Pediatrics',
      'Gynecology',
      'Dental',
      'Physiotherapy'
    ],
    doctors: [
      {
        id: '201',
        name: 'Dr. Sarah Ahmed',
        specialty: 'General Medicine',
        image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?q=80&w=2940&auto=format&fit=crop',
        experience: '12 years',
        rating: 4.9
      },
      {
        id: '202',
        name: 'Dr. Rahul Menon',
        specialty: 'Orthopedics',
        image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=2940&auto=format&fit=crop',
        experience: '10 years',
        rating: 4.7
      }
    ],
    contact: {
      phone: '+91 9876543210',
      email: 'info@almashospital.com'
    }
  },
  {
    id: '3',
    name: 'HMS Hospital',
    location: 'MG Road',
    image: "https://lh3.googleusercontent.com/p/AF1QipOyRNyXCNKsv7oGheU53iKTxotmy2NHf5rT4IRi=s680-w680-h510",
    description: 'HMS Hospital offers comprehensive healthcare services with a focus on patient comfort and advanced medical technology.',
    workingHours: {
      regular: '8:30 AM - 8:30 PM',
      emergency: '24/7'
    },
    services: [
      'Emergency Care',
      'Internal Medicine',
      'Surgery',
      'Cardiology',
      'Neurology',
      'Pediatrics',
      'Radiology',
      'Laboratory Services'
    ],
    doctors: [
      {
        id: '301',
        name: 'Dr. Meera Krishnan',
        specialty: 'Internal Medicine',
        image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=2940&auto=format&fit=crop',
        experience: '14 years',
        rating: 4.8
      },
      {
        id: '302',
        name: 'Dr. Anand Kumar',
        specialty: 'Cardiology',
        image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=2940&auto=format&fit=crop',
        experience: '16 years',
        rating: 4.9
      }
    ],
    contact: {
      phone: '+91 8765432109',
      email: 'info@hmshospital.com'
    }
  }
];

const DoctorCard = ({ doctor }) => {
  const [imageError, setImageError] = useState(false);

  return (
    <View style={styles.doctorCard}>
      <Image 
        source={typeof doctor.image === 'string' ? { uri: doctor.image } : doctor.image}
        style={styles.doctorImage}
        resizeMode="cover"
        onError={() => setImageError(true)}
      />
      <View style={styles.doctorInfo}>
        <Text style={styles.doctorName}>{doctor.name}</Text>
        <Text style={styles.doctorRole}>{doctor.designation || doctor.role}</Text>
        <Text style={styles.doctorSpeciality}>{doctor.specialty || doctor.speciality}</Text>
      </View>
    </View>
  );
};

const HospitalDetail = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const hospital = hospitals.find(h => h.id === id);
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  if (!hospital) {
    return (
      <View style={styles.container}>
        <Text>Hospital not found</Text>
      </View>
    );
  }

  const handleSeeAllPress = () => {
    router.push({
      pathname: `/hospitals/${id}/all-doctors`,
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.imageContainer}>
        <Image 
          source={typeof hospital.image === 'string' ? { uri: hospital.image } : hospital.image}
          style={[styles.image, !imageLoaded && styles.hiddenImage]} 
          onLoad={() => setImageLoaded(true)}
          onError={() => {
            setImageError(true);
            setImageLoaded(true);
          }}
        />
      </View>
      
      <View style={styles.content}>
        <Text style={styles.name}>{hospital.name}</Text>
        
        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="map-marker" size={20} color="#666" />
          <Text style={styles.infoText}>{hospital.location}</Text>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.description}>{hospital.description}</Text>
        </View>

        {/* Working Hours Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Working Hours</Text>
          <View style={styles.workingHours}>
            <View style={styles.workingHoursRow}>
              <MaterialCommunityIcons name="clock-outline" size={20} color="#666" />
              <View style={styles.workingHoursInfo}>
                <Text style={styles.workingHoursLabel}>Regular Hours</Text>
                <Text style={styles.workingHoursText}>{hospital.workingHours.regular}</Text>
              </View>
            </View>
            <View style={[styles.workingHoursRow, styles.emergencyRow]}>
              <MaterialCommunityIcons name="ambulance" size={20} color="#ff4444" />
              <View style={styles.workingHoursInfo}>
                <Text style={[styles.workingHoursLabel, styles.emergencyLabel]}>Emergency</Text>
                <Text style={[styles.workingHoursText, styles.emergencyText]}>{hospital.workingHours.emergency}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Services Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Services</Text>
          <View style={styles.servicesList}>
            {hospital.services.map((service, index) => (
              <View key={index} style={styles.serviceItem}>
                <MaterialCommunityIcons name="circle-medium" size={24} color="#6B4EFF" />
                <Text style={styles.serviceText}>{service}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Top Doctors Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Our Doctors</Text>
            <TouchableOpacity 
              onPress={handleSeeAllPress}
              style={styles.seeAllButton}
            >
              <Text style={styles.seeAllText}>See All Doctors</Text>
            </TouchableOpacity>
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.doctorsScroll}
          >
            {hospital.doctors?.slice(0, 5).map((doctor, index) => (
              <DoctorCard key={index} doctor={doctor} />
            ))}
          </ScrollView>
        </View>

        {/* Contact Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact</Text>
          <TouchableOpacity style={styles.contactButton}>
            <MaterialCommunityIcons name="phone" size={20} color="#fff" />
            <Text style={styles.contactButtonText}>{hospital.contact.phone}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.contactButton}>
            <MaterialCommunityIcons name="email" size={20} color="#fff" />
            <Text style={styles.contactButtonText}>{hospital.contact.email}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  imageContainer: {
    width: '100%',
    height: 250,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  content: {
    padding: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    marginLeft: 8,
    color: '#666',
    fontSize: 16,
  },
  section: {
    marginVertical: 20,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  workingHours: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  workingHoursRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  workingHoursInfo: {
    marginLeft: 12,
  },
  workingHoursLabel: {
    fontSize: 14,
    color: '#666',
  },
  workingHoursText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  emergencyRow: {
    marginBottom: 0,
  },
  emergencyLabel: {
    color: '#ff4444',
  },
  emergencyText: {
    color: '#ff4444',
    fontWeight: 'bold',
  },
  servicesList: {
    marginTop: 8,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  serviceText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 8,
  },
  doctorsScroll: {
    marginTop: 12,
  },
  doctorCard: {
    width: 200,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginRight: 12,
    overflow: 'hidden',
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
    width: '100%',
    height: 150,
    backgroundColor: '#f0f0f0',
  },
  doctorInfo: {
    padding: 12,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  doctorRole: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  doctorSpeciality: {
    fontSize: 14,
    color: '#0284C7',
    fontWeight: '500',
  },
  seeAllButton: {
    backgroundColor: '#0284C7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  seeAllText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6B4EFF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  contactButtonText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 16,
  },
  hiddenImage: {
    opacity: 0,
  },
});

export default HospitalDetail;