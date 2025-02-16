import React from 'react';
import { View } from 'react-native';
import { Tabs } from 'expo-router';
import CustomTabBar from '../../components/CustomTabBar';

export default function Layout() {
  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
        }}
        tabBar={(props) => <CustomTabBar {...props} />}
      >
        <Tabs.Screen 
          name="home"
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
          name="hospitals"
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
    </View>
  );
}