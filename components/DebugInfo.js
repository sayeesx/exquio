
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { supabase } from '../lib/supabase';

export const DebugInfo = () => {
  const [debug, setDebug] = React.useState({ session: null, error: null });

  React.useEffect(() => {
    const checkAuth = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      setDebug({ session, error });
    };
    checkAuth();
  }, []);

  if (__DEV__) {
    return (
      <View style={styles.debugContainer}>
        <Text>Auth Status: {debug.session ? 'Authenticated' : 'Not authenticated'}</Text>
        {debug.error && <Text>Error: {debug.error.message}</Text>}
      </View>
    );
  }
  return null;
};

const styles = StyleSheet.create({
  debugContainer: {
    padding: 10,
    backgroundColor: '#ffeb3b',
  },
});
