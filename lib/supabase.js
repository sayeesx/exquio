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

export const testSupabaseConnection = async () => {
  try {
    // Simple table existence check
    const { data, error } = await supabase
      .from('hospitals')
      .select('id')
      .limit(1)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') { // Ignore "no rows returned" error
      console.error('Connection test error:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Supabase connection error:', err);
    return false;
  }
};

export const checkSupabaseConnection = async () => {
  try {
    // Use a lightweight system table query instead
    const { data, error } = await supabase
      .rpc('version')
      .single();

    if (error) {
      console.error('Connection check error:', error.message);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Supabase connection error:', err.message);
    return false;
  }
};

export default () => null;