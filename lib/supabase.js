import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = 'https://uwzqyjlwymowkjsvjcoo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3enF5amx3eW1vd2tqc3ZqY29vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkyMDkxNDYsImV4cCI6MjA1NDc4NTE0Nn0.ApQnwUKy6EeLBPRya-dR2pZF480gY63xUzF8aj785OY';

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'Content-Type': 'application/json'
    }
  }
});

// Add a default export to satisfy expo-router
const SupabaseProvider = () => null;
export default SupabaseProvider;

// Export supabase client as a named export
export { supabase }; 