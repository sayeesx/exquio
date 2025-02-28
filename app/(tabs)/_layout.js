import React, { useEffect, useState } from 'react';
import { Tabs, usePathname } from 'expo-router';
import { Animated, StatusBar, Platform } from 'react-native';
import CustomTabBar from '../../components/CustomTabBar';
import { useKeyboardStatus } from '../../hooks/useKeyboardStatus';

export default function Layout() {
  const { isKeyboardVisible } = useKeyboardStatus();
  const [tabBarHeight] = useState(new Animated.Value(49));
  const pathname = usePathname();

  // Define routes where tab bar should be visible
  const showTabBarRoutes = [
    '/home',
    '/hospitals',
    '/appointment',
    '/profile',
    '/lab-records'  // Added lab-records route
  ];

  const shouldShowTabBar = showTabBarRoutes.includes(pathname);

  useEffect(() => {
    Animated.timing(tabBarHeight, {
      toValue: isKeyboardVisible || !shouldShowTabBar ? 0 : 49,
      duration: 250,
      useNativeDriver: false,
    }).start();
  }, [isKeyboardVisible, shouldShowTabBar]);

  useEffect(() => {
    const setupStatusBar = () => {
      if (Platform.OS === 'android') {
        StatusBar.setTranslucent(true);
        StatusBar.setBackgroundColor('transparent');
      }
      StatusBar.setBarStyle('light-content');
    };

    setupStatusBar();
    return () => setupStatusBar();
  }, []);

  return (
    <>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            height: tabBarHeight,
            overflow: 'hidden',
            display: shouldShowTabBar ? 'flex' : 'none',
          },
        }}
        tabBar={(props) => shouldShowTabBar ? <CustomTabBar {...props} /> : null}
      >
        <Tabs.Screen 
          name="home"
          options={{
            href: '/'
          }}
        />
        <Tabs.Screen 
          name="hospitals"
          options={{
            href: null
          }}
        />
        <Tabs.Screen 
          name="appointment"
          options={{
            href: null
          }}
        />
        <Tabs.Screen 
          name="lab-records"
          options={{
            href: null
          }}
        />
        <Tabs.Screen 
          name="profile"
          options={{
            href: null
          }}
        />
      </Tabs>
    </>
  );
}