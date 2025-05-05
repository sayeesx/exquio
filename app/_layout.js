import { Stack } from 'expo-router';
import { View } from 'react-native';
import { AuthProvider } from './auth/context/AuthContext';

export default function Layout() {
  return (
    <AuthProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          animationDuration: 200,
          contentStyle: { backgroundColor: '#fff' },
          presentation: 'card',
        }}
      >
        <Stack.Screen
          name="(tabs)"
          options={{
            animation: 'fade',
          }}
        />
        <Stack.Screen
          name="offers"
          options={{
            animation: 'slide_from_right',
            animationDuration: 200,
            gestureEnabled: true,
            gestureDirection: 'horizontal',
            presentation: 'card',
            transitionSpec: {
              open: {
                animation: 'timing',
                config: {
                  duration: 200,
                },
              },
              close: {
                animation: 'timing',
                config: {
                  duration: 200,
                },
              },
            },
          }}
        />
      </Stack>
    </AuthProvider>
  );
}
