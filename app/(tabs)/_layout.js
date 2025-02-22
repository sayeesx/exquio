import React from 'react';
import { Tabs } from 'expo-router';
import CustomTabBar from '../../components/CustomTabBar';

export default function Layout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          display: 'none'
        }
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