import 'react-native-gesture-handler';
import { enableScreens } from 'react-native-screens';
import { LogBox } from 'react-native';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useFonts } from 'expo-font';
import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Toast, { BaseToast } from 'react-native-toast-message';

// Enable screens
enableScreens(true);

// Ignore specific LogBox warnings
LogBox.ignoreLogs([
  'Sending `topInsetsChange` with no listeners registered.',
  'ViewPropTypes will be removed',
  'ColorPropType will be removed',
]);

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

const toastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: '#3B39E4', backgroundColor: '#FFFFFF' }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 16,
        fontWeight: '600'
      }}
      text2Style={{
        fontSize: 14
      }}
    />
  ),
  error: ({ text1, text2, ...rest }) => (
    <Toast.ErrorToast
      {...rest}
      style={styles.errorToast}
      contentContainerStyle={styles.toastContainer}
      text1Style={styles.toastTitle}
      text2Style={styles.toastMessage}
      text1={text1}
      text2={text2}
    />
  ),
};

export default function App() {
  const [fontsLoaded] = useFonts({
    'Inter-Regular': require('@expo-google-fonts/inter/Inter_400Regular.ttf'),
    'Inter-Medium': require('@expo-google-fonts/inter/Inter_500Medium.ttf'),
    'Inter-SemiBold': require('@expo-google-fonts/inter/Inter_600SemiBold.ttf'),
    'Inter-Bold': require('@expo-google-fonts/inter/Inter_700Bold.ttf'),
  });

  React.useEffect(() => {
    if (fontsLoaded) {
      // Hide splash screen once fonts are loaded
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Slot />
      <StatusBar style="auto" />
      <Toast config={toastConfig} />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#151320',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 18,
  },
  toastContainer: {
    paddingHorizontal: 16,
    backgroundColor: 'transparent',
  },
  successToast: {
    backgroundColor: '#4CAF50',
    borderRadius: 10,
  },
  errorToast: {
    backgroundColor: '#FF6B6B',
    borderRadius: 10,
  },
  toastTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  toastMessage: {
    fontSize: 14,
    color: '#FFFFFF',
  },
});