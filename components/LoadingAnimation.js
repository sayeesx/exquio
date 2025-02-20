import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';

const LoadingSpinner = ({
  size = 60,
  color = '#3B39E4',
  thickness = 4,
  spinDuration = 800,  // Faster spin duration
  pauseDuration = 200, // Brief pause at bottom
  secondaryOpacity = 0.2,
  pulseEnabled = true,
}) => {
  // Create memoized animated values
  const { spinValue, pulseValue } = useMemo(
    () => ({
      spinValue: new Animated.Value(0),
      pulseValue: new Animated.Value(1),
    }),
    []
  );

  useEffect(() => {
    // Create a custom spinning animation sequence
    const spinSequence = Animated.sequence([
      // Fast spin to bottom (180 degrees)
      Animated.timing(spinValue, {
        toValue: 0.5,
        duration: spinDuration / 2,
        easing: Easing.bezier(0.4, 0.0, 0.2, 1),
        useNativeDriver: true,
      }),
      // Brief pause at bottom
      Animated.delay(pauseDuration),
      // Complete the rotation
      Animated.timing(spinValue, {
        toValue: 1,
        duration: spinDuration / 2,
        easing: Easing.bezier(0.4, 0.0, 0.2, 1),
        useNativeDriver: true,
      }),
    ]);

    // Create the main animation loop
    const spinAnimation = Animated.loop(
      Animated.sequence([
        spinSequence,
        // Reset to start
        Animated.timing(spinValue, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );

    // Pulse animation
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: 1.1,
          duration: spinDuration,
          easing: Easing.bezier(0.4, 0.0, 0.2, 1),
          useNativeDriver: true,
        }),
        Animated.timing(pulseValue, {
          toValue: 1,
          duration: spinDuration,
          easing: Easing.bezier(0.4, 0.0, 0.2, 1),
          useNativeDriver: true,
        }),
      ])
    );

    // Start animations
    spinAnimation.start();
    if (pulseEnabled) {
      pulseAnimation.start();
    }

    return () => {
      spinAnimation.stop();
      pulseEnabled && pulseAnimation.stop();
    };
  }, [spinValue, pulseValue, spinDuration, pauseDuration, pulseEnabled]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const containerSize = size + thickness * 2;

  return (
    <View style={[styles.container, { width: containerSize, height: containerSize }]}>
      <Animated.View
        style={[
          styles.spinner,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: thickness,
            borderColor: `${color}${Math.round(secondaryOpacity * 255).toString(16).padStart(2, '0')}`,
            borderTopColor: color,
            transform: [
              { rotate: spin },
              { scale: pulseEnabled ? pulseValue : 1 },
            ],
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinner: {
    borderStyle: 'solid',
  },
});

export default LoadingSpinner;