import { useRef, useEffect } from 'react';
import { Animated, Easing } from 'react-native';

export const useShakeAnimation = () => {
  const bellAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shakeAnimation = Animated.sequence([
      Animated.timing(bellAnim, {
        toValue: 1,
        duration: 100,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      Animated.timing(bellAnim, {
        toValue: -1,
        duration: 100,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      Animated.timing(bellAnim, {
        toValue: 0,
        duration: 100,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ]);

    const intervalId = setInterval(() => {
      shakeAnimation.start();
    }, 3000);

    return () => clearInterval(intervalId);
  }, [bellAnim]);

  return bellAnim;
};