import { useEffect, useCallback } from 'react';
import { StatusBar, Platform } from 'react-native';
import { useIsFocused, useNavigation } from '@react-navigation/native';

export const useStatusBarEffect = () => {
  const isFocused = useIsFocused();
  const navigation = useNavigation();

  const setupStatusBar = useCallback(() => {
    if (Platform.OS === 'android') {
      StatusBar.setTranslucent(true);
      StatusBar.setBackgroundColor('transparent');
    }
    StatusBar.setBarStyle('light-content');
  }, []);

  useEffect(() => {
    setupStatusBar();

    const subscribe = navigation.addListener('beforeRemove', setupStatusBar);
    const focusSubscribe = navigation.addListener('focus', setupStatusBar);
    const blurSubscribe = navigation.addListener('blur', setupStatusBar);
    const stateSubscribe = navigation.addListener('state', setupStatusBar);

    return () => {
      subscribe();
      focusSubscribe();
      blurSubscribe();
      stateSubscribe();
    };
  }, [navigation, setupStatusBar]);

  return null;
};
