import { supabase } from '../lib/supabase';

export const searchDoctorsAndHospitals = async (query) => {
  if (!query || query.length < 2) return { doctors: [], hospitals: [] };

  try {
    // Search hospitals
    const { data: hospitals, error: hospitalError } = await supabase
      .from('hospitals')
      .select('id, name, location')
      .ilike('name', `%${query}%`)
      .limit(5);

    if (hospitalError) throw hospitalError;

    // Search doctors
    const { data: doctors, error: doctorError } = await supabase
      .from('doctors')
      .select('id, name, specialty, hospital:hospital_id(name)')
      .ilike('name', `%${query}%`)
      .limit(5);

    if (doctorError) throw doctorError;

    return {
      doctors,
      hospitals
    };
  } catch (error) {
    console.error('Search error:', error);
    return { doctors: [], hospitals: [] };
  }
};
