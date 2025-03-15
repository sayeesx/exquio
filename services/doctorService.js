import { supabase } from '../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'react-native';
import { secureLog } from '../utils/secureLogging';

// Cache management functions
const CACHE_KEY = 'popularDoctors';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Internal cache management functions
const clearCache = async () => {
  try {
    await AsyncStorage.removeItem(CACHE_KEY);
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
};

const getDoctorsFromCache = async () => {
  try {
    const cached = await AsyncStorage.getItem(CACHE_KEY);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_DURATION) {
        return data;
      }
    }
    return null;
  } catch (error) {
    console.error('Error reading cache:', error);
    return null;
  }
};

const setDoctorsToCache = async (data) => {
  try {
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
  } catch (error) {
    console.error('Error setting cache:', error);
  }
};

const fetchDoctors = async (limit = 4) => {
  try {
    console.log('Starting fetchDoctors...'); // Debug log

    // Verify if we can access the table
    const { data: tableCheck, error: tableError } = await supabase
      .from('popular_doctors')
      .select('id')
      .limit(1);

    if (tableError) {
      console.error('Table access error:', tableError.message);
      return [];
    }

    console.log('Table access check:', tableCheck ? 'success' : 'failed');

    const { data, error } = await supabase
      .from('popular_doctors')
      .select(`
        id,
        name,
        image_url,
        experience_years,
        rating,
        consultation_fee,
        specialty:specialty_id (
          id,
          name
        ),
        hospital:hospital_id (
          id,
          name,
          location
        )
      `)
      .order('rating', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Query error:', error.message, error.details);
      throw error;
    }

    // Debug logs
    console.log('Query successful');
    console.log('Raw data length:', data?.length || 0);
    if (data?.[0]) {
      console.log('Sample record:', {
        name: data[0].name,
        hasSpecialty: !!data[0].specialty,
        hasHospital: !!data[0].hospital
      });
    }

    if (data && data.length > 0) {
      return data.map(doctor => ({
        id: doctor.id,
        name: doctor.name,
        image_url: doctor.image_url,
        specialty: doctor.specialty,
        experience_years: doctor.experience_years,
        rating: doctor.rating,
        consultation_fee: doctor.consultation_fee,
        hospital: doctor.hospital
      }));
    }

    return [];
  } catch (error) {
    console.error('fetchDoctors error:', error.message);
    return [];
  }
};

const fetchDoctorById = async (id) => {
  try {
    // Ensure id is a valid UUID
    if (!id || typeof id !== 'string') {
      throw new Error('Invalid doctor ID');
    }

    const { data, error } = await supabase
      .from('popular_doctors') // Changed from doctors to popular_doctors
      .select(`
        *,
        specialty:specialty_id (
          id,
          name
        ),
        hospital:hospital_id (
          id,
          name,
          location
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching doctor by ID:', error);
    throw error;
  }
};

// Add function to pre-fetch images
const prefetchDoctorImages = async (doctors) => {
  return Promise.all(
    doctors.map(doctor => {
      if (doctor.image_url) {
        const url = doctor.image_url.startsWith('http')
          ? doctor.image_url
          : `${process.env.EXPO_PUBLIC_SUPABASE_URL}/storage/v1/object/public/doctors/${doctor.image_url}`;
        return Image.prefetch(url);
      }
      return Promise.resolve();
    })
  );
};

// Single export statement with clearDoctorCache renamed to match the internal function
export {
  fetchDoctors,
  fetchDoctorById,
  prefetchDoctorImages,
  clearCache as clearDoctorCache // Export clearCache as clearDoctorCache
};
