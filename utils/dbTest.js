import { supabase } from './supabase';

export const testDatabaseConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('hospitals')
      .select('id')
      .limit(1);
      
    if (error) throw error;
    
    return { success: true, message: 'Connected to Supabase' };
  } catch (error) {
    console.error('Database connection error:', error);
    return { 
      success: false, 
      message: 'Failed to connect to Supabase' 
    };
  }
};
