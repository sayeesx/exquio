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
    const { data, error } = await supabase
      .from('popular_doctors')
      .select(`
        id,
        doctor_id,
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
      console.error('Query error:', error.message);
      throw error;
    }

    if (data && data.length > 0) {
      return data.map(doctor => ({
        ...doctor,
        // Use doctor_id for navigation instead of popular_doctors id
        id: doctor.doctor_id || doctor.id
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
    if (!id) {
      throw new Error('Missing doctor ID');
    }

    // Convert numeric id to string if needed
    const doctorId = typeof id === 'number' ? id.toString() : id;

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
      .eq('id', doctorId)
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
