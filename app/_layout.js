import { Stack, useSegments, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useFonts, Inter_700Bold } from '@expo-google-fonts/inter';
import { AuthProvider, useAuth } from './auth/context/AuthContext';

function AuthGuard({ children }) {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === 'auth';
    const isIntroPage = segments[0] === 'intro';
    
    console.log('Auth state:', { user, segments, inAuthGroup, isIntroPage }); // Add logging

    if (user) {
      // If user is logged in
      if (inAuthGroup || isIntroPage) {
        console.log('Redirecting to home'); // Add logging
        router.replace('/(tabs)/home');
      }
    } else {
      // If user is not logged in
      if (!inAuthGroup && !isIntroPage) {
        console.log('Redirecting to intro'); // Add logging
        router.replace('/intro');
      }
    }
  }, [user, loading, segments]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4C35E3" />
      </View>
    );
  }

  return children;
}

export default function Layout() {
  const [fontsLoaded] = useFonts({
    Inter_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4C35E3" />
      </View>
    );
  }

  return (
    <AuthProvider>
      <AuthGuard>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="intro" />
          <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
          <Stack.Screen name="auth/login" options={{ animation: 'slide_from_bottom' }} />
        </Stack>
      </AuthGuard>
    </AuthProvider>
  );
}
