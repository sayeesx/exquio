import { View, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { BlurView } from "expo-blur";
import Animated, { useAnimatedStyle, withSpring, useSharedValue, withSequence } from "react-native-reanimated";
import { Feather, MaterialIcons, FontAwesome } from "@expo/vector-icons";
import React, { createContext, useState, useContext } from 'react';

// Create a context for tab bar visibility
export const TabBarContext = createContext({
  isTabBarVisible: true,
  setTabBarVisible: () => {},
});

// Custom hook to manage tab bar visibility
export const useTabBar = () => {
  const context = useContext(TabBarContext);
  if (!context) {
    throw new Error('useTabBar must be used within a TabBarProvider');
  }
  return context;
};

// Provider component to wrap the app
export const TabBarProvider = ({ children }) => {
  const [isTabBarVisible, setIsTabBarVisible] = useState(true);

  const setTabBarVisible = (visible) => {
    setIsTabBarVisible(visible);
  };

  return (
    <TabBarContext.Provider value={{ isTabBarVisible, setTabBarVisible }}>
      {children}
    </TabBarContext.Provider>
  );
};

// Create an animated version of TouchableOpacity
const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

const CustomTabBar = ({ state, descriptors, navigation }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { isTabBarVisible } = useTabBar();

  // Shared values for animations
  const scale = useSharedValue(1);

  const handlePress = (route) => {
    // Animate the button press
    scale.value = withSequence(
      withSpring(0.9, { damping: 10, stiffness: 400 }),
      withSpring(1, { damping: 15, stiffness: 400 })
    );

    // Navigate to the route after the animation
    setTimeout(() => {
      router.push(route);
    }, 150); // Slight delay to match the animation duration
  };

  const getIconColor = (route) => (pathname.startsWith(`/${route}`) ? "#fff" : "rgba(0, 0, 0, 0.5)");

  const isRouteActive = (route) => pathname.startsWith(`/${route}`);

  if (!isTabBarVisible) {
    return null; // Don't render tab bar when not visible
  }

  return (
    <View style={styles.tabBar}>
      <BlurView intensity={80} style={styles.blurContainer}>
        <View style={styles.content}>
          {/* Hospital Button */}
          <AnimatedTouchableOpacity
            style={[
              styles.tabButton,
              isRouteActive("hospital") && styles.activeButton,
            ]}
            onPress={() => handlePress("/hospitals")}
          >
            <MaterialIcons name="local-hospital" size={28} color={getIconColor("hospital")} />
          </AnimatedTouchableOpacity>

          {/* Bookings Button */}
          <AnimatedTouchableOpacity
            style={[
              styles.tabButton,
              isRouteActive("appointment") && styles.activeButton,
            ]}
            onPress={() => handlePress("appointment")}
          >
            <Feather name="calendar" size={28} color={getIconColor("appointment")} />
          </AnimatedTouchableOpacity>

          {/* Home Button (Centered) */}
          <AnimatedTouchableOpacity
            style={[
              styles.centerButton,
              isRouteActive("home") && styles.activeButton,
            ]}
            onPress={() => handlePress("home")}
          >
            <Feather name="home" size={28} color={isRouteActive("home") ? "#fff" : "rgba(0, 0, 0, 0.5)"} />
          </AnimatedTouchableOpacity>

          {/* Lab Records Button */}
          <AnimatedTouchableOpacity
            style={[
              styles.tabButton,
              isRouteActive("lab-records") && styles.activeButton,
            ]}
            onPress={() => handlePress("lab-records")}
          >
            <FontAwesome name="flask" size={28} color={getIconColor("lab-records")} />
          </AnimatedTouchableOpacity>

          {/* Profile Button */}
          <AnimatedTouchableOpacity
            style={[
              styles.tabButton,
              isRouteActive("profile") && styles.activeButton,
            ]}
            onPress={() => handlePress("profile")}
          >
            <Feather name="user" size={28} color={getIconColor("profile")} />
          </AnimatedTouchableOpacity>
        </View>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    height: 60,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    elevation: 8,
    shadowColor: '#000',
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
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  centerButton: {
    marginBottom: 0,
  },
  activeButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
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
  },
});

export default CustomTabBar;