import { View, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { BlurView } from "expo-blur";
import Animated, { 
  useAnimatedStyle, 
  withSpring,
  useSharedValue,
  Layout,
  FadeIn,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import React from 'react';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

const TabButton = ({ route, icon, isActive, onPress }) => {
  const scale = useSharedValue(1);

  const handlePress = () => {
    scale.value = withSpring(0.9, {}, () => {
      scale.value = withSpring(1);
    });
    onPress();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedTouchableOpacity
      style={[
        styles.tabButton,
        isActive && styles.activeButton,
        animatedStyle
      ]}
      onPress={handlePress}
      layout={Layout.springify()}
    >
      <Ionicons
        name={icon}
        size={22}
        color={isActive ? "#fff" : "rgba(0, 0, 0, 0.5)"}
      />
    </AnimatedTouchableOpacity>
  );
};

const CustomTabBar = () => {
  const router = useRouter();
  const pathname = usePathname();

  const isRouteActive = (route) => pathname.startsWith(`/${route}`);

  const tabs = [
    { route: "/hospitals", icon: "medical-outline" },
    { route: "appointment", icon: "calendar-clear-outline" },
    { route: "home", icon: "home-outline" },
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
    backgroundColor: '#fff',
    height: 50,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    overflow: 'hidden',
    elevation: 8,
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  blurContainer: {
    flex: 1,
    height: 60,
    borderRadius: 32,
    borderColor: "rgba(2, 0, 3, 0.2)",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
  },
  content: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 16,
  },
  tabButton: {
    padding: 8,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    width: 44,
    height: 44,
    transform: [{ translateY: 0 }],
    backfaceVisibility: 'hidden', // Reduces visual glitches
  },
  centerButton: {
    marginBottom: 0,
    width: 48,
    height: 48,
  },
  activeButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#3b39e4",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#3b39e4",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    transform: [{ translateY: -2 }], // Slight lift effect when active
  },
});

export default CustomTabBar;