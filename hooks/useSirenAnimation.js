import { useRef, useEffect } from 'react';
import { Animated } from 'react-native';

export const useSirenAnimation = () => {
  // Ensure we initialize with a number, not a string
  const sirenAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animateSiren = () => {
      Animated.sequence([
        Animated.timing(sirenAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(sirenAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start(() => animateSiren());
    };

    animateSiren();
  }, [sirenAnim]);

  return sirenAnim;
};