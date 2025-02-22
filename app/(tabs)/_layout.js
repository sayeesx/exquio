import React, { useEffect, useState } from 'react';
import { Tabs } from 'expo-router';
import { Animated } from 'react-native';
import CustomTabBar from '../../components/CustomTabBar';
import { useKeyboardStatus } from '../../hooks/useKeyboardStatus';

export default function Layout() {
  const { isKeyboardVisible } = useKeyboardStatus();
  const [tabBarHeight] = useState(new Animated.Value(49));

  useEffect(() => {
    Animated.timing(tabBarHeight, {
      toValue: isKeyboardVisible ? 0 : 49,
      duration: 250,
      useNativeDriver: false,
    }).start();
  }, [isKeyboardVisible]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          height: tabBarHeight,
          overflow: 'hidden',
        },
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
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
  );
}