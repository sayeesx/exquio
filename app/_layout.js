import { Stack } from "expo-router";
import { Keyboard } from 'react-native';
import { useState, useEffect } from 'react';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';

export default function RootLayout() {
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  let [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold
  });

  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener('keyboardWillShow', () => {
      setKeyboardVisible(true);
    });
    const keyboardWillHide = Keyboard.addListener('keyboardWillHide', () => {
      setKeyboardVisible(false);
    });

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="(tabs)"
        options={{
          headerShown: false,
          animation: 'none',
        }}
      />
      <Stack.Screen
        name="checkout/checkout"
        options={{
          headerShown: false
        }}
      />
      <Stack.Screen
        name="checkout/payment"
        options={{
          headerShown: false
        }}
      />
      <Stack.Screen
        name="checkout/gateway/success"
        options={{
          headerShown: false,
          animation: 'fade',
          presentation: 'modal'
        }}
      />
      <Stack.Screen
        name="checkout/gateway/failed"
        options={{
          headerShown: false,
          animation: 'fade',
          presentation: 'modal'
        }}
      />
      <Stack.Screen
        name="checkout/gateway/pending"
        options={{
          headerShown: false,
          animation: 'fade',
          presentation: 'modal'
        }}
      />
    </Stack>
  );
}
