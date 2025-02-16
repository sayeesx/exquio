import { addHospital } from '../utils/hospitalService';

const nehaHospital = {
  name: 'NEHA MULTISPECIALITY HOSPITAL',
  location: 'Kottakkal, Malappuram District',
  type: 'multi',
  image_url: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?ixlib=rb-4.0.3',
  description: 'Modern Multispeciality Hospital with Advanced Healthcare Facilities',
  emergency_contact: '0483-2746666',
  email: 'care@nehahospital.com',
  rating: 4.5
};

// Function to add the hospital
async function addNehaHospital() {
  try {
    const result = await addHospital(nehaHospital);
    console.log('Successfully added Neha Hospital:', result);
  } catch (error) {
    console.error('Failed to add hospital:', error);
  }
}

// Run the function
addNehaHospital();
