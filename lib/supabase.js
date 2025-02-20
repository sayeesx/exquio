import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

// Get Supabase credentials from app.json extra
const supabaseUrl = Constants.expoConfig.extra.SUPABASE_URL;
const supabaseAnonKey = Constants.expoConfig.extra.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase configuration. Check app.json extra section.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  }
});

// Add this debug function
export const testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('ambulances').select('count');
    console.log('Supabase connection test:', { data, error });
    return { success: !error, data, error };
  } catch (e) {
    console.error('Supabase connection error:', e);
    return { success: false, error: e };
  }
};

export default () => null;