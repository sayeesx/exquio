import { useRef, useEffect } from 'react';
import { Animated } from 'react-native';

export const useAmbulanceAnimation = () => {
  const shimmerX = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    const shimmerAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerX, {
          toValue: 200,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.delay(1000),
        Animated.timing(shimmerX, {
          toValue: -100,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );

    shimmerAnimation.start();

    return () => {
      shimmerAnimation.stop();
    };
  }, []);

  return shimmerX;
};
