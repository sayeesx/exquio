import { supabase } from '../lib/supabase';

export const fetchDoctors = async (limit = 10) => {
  const { data, error } = await supabase
    .from('doctors')
    .select(`
      *,
      hospital:hospital_id (
        id,
        name,
        location
      )
    `)
    .limit(limit);

  if (error) throw error;
  return data;
};

export const fetchDoctorById = async (id) => {
  const { data, error } = await supabase
    .from('doctors')
    .select(`
      *,
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
};

// Transform Supabase doctor data to app format
export const transformDoctorData = (doctor) => ({
  id: doctor.id,
  name: doctor.name,
  specialty: doctor.specialty,
  image: doctor.avatar_url,
  experience: doctor.experience || `${doctor.experience_years || 0} years`,
  rating: doctor.rating || 4.5,
  qualifications: doctor.qualification,
  languages: ['English'], // Default value as it's not in the DB
  consultationFee: `₹${doctor.consultation_fee || 0}`,
  about: doctor.bio,
  specializations: [doctor.specialty].filter(Boolean),
  availability: doctor.available_days?.reduce((acc, day) => {
    acc[day.toLowerCase()] = '9:00 AM - 5:00 PM'; // Default timing
    return acc;
  }, {}),
  hospital: doctor.hospital || {
    id: '',
    name: 'Unknown Hospital',
    location: 'Location not available'
  }
});
