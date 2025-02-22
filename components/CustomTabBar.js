import { View, TouchableOpacity, StyleSheet, Platform, Keyboard } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { BlurView } from "expo-blur";
import Animated, { 
  useAnimatedStyle, 
  withTiming,
  useSharedValue,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import React, { useState, useEffect } from 'react';

const TabButton = ({ route, icon, isActive, onPress }) => {
  const opacity = useSharedValue(1);

  const handlePress = () => {
    opacity.value = withTiming(0.6, { duration: 100 }, () => {
      opacity.value = withTiming(1, { duration: 200 });
    });
    onPress();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.tabButton, animatedStyle]}>
      <TouchableOpacity
        onPress={handlePress}
        style={styles.touchable}
      >
        <Ionicons
          name={icon}
          size={24}
          color={isActive ? "#3b39e4" : "rgba(0, 0, 0, 0.5)"}
          style={styles.icon}
        />
      </TouchableOpacity>
    </Animated.View>
  );
};

const CustomTabBar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setKeyboardVisible(true)
    );
    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardVisible(false)
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  if (isKeyboardVisible) {
    return null;
  }

  const isRouteActive = (route) => pathname.startsWith(`/${route}`);

  const tabs = [
    { route: "/hospitals", icon: "medical-outline" },
    { route: "appointment", icon: "calendar-clear-outline" },
    { route: "/home", icon: "home-outline" },
    { route: "lab-records", icon: "flask-outline" },
    { route: "profile", icon: "person-outline" }
  ];

  return (
    <View style={styles.tabBar}>
      <BlurView intensity={80} style={styles.blurContainer}>
        <View style={styles.content}>
          {tabs.map((tab) => (
            <TabButton
              key={tab.route}
              route={tab.route}
              icon={tab.icon}
              isActive={isRouteActive(tab.route.replace("/", ""))}
              onPress={() => router.push(tab.route)}
            />
          ))}
        </View>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    height: 58,
  
  },
  blurContainer: {
    flex: 1,
    height: '100%',
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  content: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 10,
  },
  tabButton: {
    padding: 8,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 60,
  },
  touchable: {
    padding: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    opacity: 0.95,
  }
});

export default CustomTabBar;