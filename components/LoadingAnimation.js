import React, { useEffect } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';

export default function LoadingAnimation() {
  const spinValue = new Animated.Value(0);
  const scaleValue = new Animated.Value(0.3);

  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(scaleValue, {
            toValue: 1,
            duration: 500,
            easing: Easing.bezier(0.4, 0, 0.2, 1),
            useNativeDriver: true,
          }),
          Animated.timing(scaleValue, {
            toValue: 0.3,
            duration: 500,
            easing: Easing.bezier(0.4, 0, 0.2, 1),
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();
  }, []);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.circle,
          {
            transform: [
              { rotate: spin },
              { scale: scaleValue },
            ],
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  circle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 4,
    borderColor: '#3B39E4',
    borderTopColor: 'rgba(59, 57, 228, 0.2)',
  },
});
