import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Get Supabase credentials from app.json extra
const supabaseUrl = Constants.expoConfig.extra.SUPABASE_URL;
const supabaseAnonKey = Constants.expoConfig.extra.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase configuration. Check app.json extra section.');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  }
});

// Export connection check function
export const checkConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('specialties')
      .select('count')
      .limit(1);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Supabase connection error:', error);
    return false;
  }
};

export { supabase };
export default () => null;