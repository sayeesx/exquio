import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import Svg, { Polyline } from 'react-native-svg';
import { MaterialCommunityIcons } from "@expo/vector-icons";

const AnimatedPolyline = Animated.createAnimatedComponent(Polyline);

const LoadingSpinner = () => {
  // Animation value for the dash offset
  const dashOffset = useRef(new Animated.Value(192)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(dashOffset, {
        toValue: 0,
        duration: 1200, // 1.4s from CSS
        useNativeDriver: true,
      })
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [dashOffset]);

  return (
    <View style={styles.container}>
      <Svg height={48} width={64}>
        {/* Back polyline */}
        <Polyline
          points="0.157 23.954, 14 23.954, 21.843 48, 43 0, 50 24, 64 24"
          fill="none"
          stroke="#grey" // Light red with opacity from CSS
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Front polyline */}
        <AnimatedPolyline
          points="0.157 23.954, 14 23.954, 21.843 48, 43 0, 50 24, 64 24"
          fill="none"
          stroke="blue" // Solid red from CSS
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={[48, 144]}
          strokeDashoffset={dashOffset}
        />
      </Svg>
    </View>
  );
};

const LoadingAnimation = ({ size = 40, color = "#3B39E4" }) => {
  const spinValue = new Animated.Value(0);

  React.useEffect(() => {
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  return (
    <View style={styles.container}>
      <Animated.View style={{ transform: [{ rotate: spin }] }}>
        <MaterialCommunityIcons 
          name="loading" 
          size={size} 
          color={color} 
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 64,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LoadingSpinner;
export { LoadingAnimation };