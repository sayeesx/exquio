import { supabase } from '../lib/supabase';

export const OFFER_SECTIONS = {
  DOCTOR: 'doctor',
  HOSPITAL: 'hospital',
  PARTNER: 'partner',
  APP: 'app',
  OTHER: 'other',
  GENERAL: 'general'
};

export const fetchOffers = async (type = null, homeOnly = false) => {
  try {
    let query = supabase
      .from('offers')
      .select('*')
      .gt('expires_at', new Date().toISOString())
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (type) {
      query = query.eq('section_type', type);
    }

    if (homeOnly) {
      query = query.eq('show_on_home', true).limit(3);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching offers:', error);
    return [];
  }
};