import { supabase } from '../utils/supabase';
import { kottakkalHospitals } from '../data/hospitals';
import { secureLog } from '../utils/secureLogging';

const DEFAULT_HOSPITAL_IMAGE = '[DEFAULT_IMAGE_URL_HIDDEN]';
const DEFAULT_LOGO = '[DEFAULT_LOGO_URL_HIDDEN]';

export async function fetchHospitals() {
  try {
    const { data, error } = await supabase
      .from('hospitals')
      .select('*')
      .order('rating', { ascending: false });

    if (error) {
      throw error;
    }

    const sanitizedData = data.map(hospital => ({
      id: hospital.id,
      name: hospital.name,
      location: hospital.location || 'Local Area',
      type: hospital.type || 'General',
      rating: hospital.rating || 4.5,
      image_url: hospital.image_url, // Keep the actual image URL
      logo_url: hospital.logo_url // Keep the actual logo URL
    }));

    secureLog('Fetched hospital data', '[DATA_HIDDEN]');
    return sanitizedData;
  } catch (error) {
    secureLog('Error in fetchHospitals', '[ERROR]');
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
