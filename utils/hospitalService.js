import { supabase } from './supabase';
import { kottakkalHospitals } from '../data/hospitals';

const DEFAULT_HOSPITAL_IMAGE = 'https://placehold.co/600x400/png?text=Hospital';
const DEFAULT_LOGO = 'https://placehold.co/100/png?text=H';

export async function fetchHospitals() {
  try {
    const { data, error } = await supabase
      .from('hospitals')
      .select('*')
      .order('rating', { ascending: false });

    if (error) {
      throw error;
    }

    return data.map(hospital => ({
      ...hospital,
      image: hospital.image_url || DEFAULT_HOSPITAL_IMAGE,
      logo: DEFAULT_LOGO,
      rating: hospital.rating ? parseFloat(hospital.rating) || 0.0 : 0.0
    }));
  } catch (error) {
    console.error('Error in fetchHospitals:', error);
    throw error;
  }
}

export async function seedHospitals(hospitalData) {
  try {
    const { data, error } = await supabase
      .from('hospitals')
      .upsert(hospitalData);

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error seeding data:', error);
    throw error;
  }
}

export async function seedKottakkalHospitals() {
  try {
    if (!Array.isArray(kottakkalHospitals)) {
      throw new Error('kottakkalHospitals data is not properly formatted');
    }

    const { data, error } = await supabase
      .from('hospitals')
      .upsert(kottakkalHospitals.map(hospital => ({
        id: hospital.id,
        name: hospital.name,
        location: hospital.location,
        type: hospital.type,
        image_url: hospital.image || DEFAULT_HOSPITAL_IMAGE,
        description: hospital.description,
        rating: hospital.rating
      })));

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error seeding Kottakkal hospitals:', error);
    throw error;
  }
}

export async function addHospital(hospitalData) {
  try {
    // Validate required fields
    const requiredFields = ['name', 'location', 'type'];
    for (const field of requiredFields) {
      if (!hospitalData[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    const newHospital = {
      ...hospitalData,
      rating: hospitalData.rating ? parseFloat(hospitalData.rating) || 0.0 : 0.0,
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('hospitals')
      .insert([newHospital])
      .select();

    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error('Error adding hospital:', error);
    throw error;
  }
}
