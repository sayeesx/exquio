import { useRef, useState, useEffect } from 'react';
import { Animated } from 'react-native';

export const useIntroAnimation = (userName) => {
  const introBoxWidth = useRef(new Animated.Value(32)).current;
  const introBoxOpacity = useRef(new Animated.Value(0)).current;
  const introTextOpacity = useRef(new Animated.Value(0)).current;
  const [introText, setIntroText] = useState("");

  useEffect(() => {
    const animateIntroBox = () => {
      const baseWidth = 32;
      const charWidth = 8;
      const padding = 40;
      const greetingWidth = userName.length * charWidth + padding;
      const questionWidth = "How are you feeling today?".length * charWidth + padding;

      Animated.sequence([
        Animated.parallel([
          Animated.timing(introBoxOpacity, { toValue: 1, duration: 300, useNativeDriver: false }),
          Animated.timing(introBoxWidth, { toValue: greetingWidth, duration: 500, useNativeDriver: false }),
        ]),
        Animated.timing(introTextOpacity, { toValue: 1, duration: 300, useNativeDriver: false }),
        Animated.delay(2000),
        Animated.timing(introTextOpacity, { toValue: 0, duration: 300, useNativeDriver: false }),
        Animated.timing(introBoxWidth, { toValue: questionWidth, duration: 300, useNativeDriver: false }),
        Animated.timing(introTextOpacity, { toValue: 1, duration: 300, useNativeDriver: false }),
        Animated.delay(3000),
        Animated.parallel([
          Animated.timing(introBoxWidth, { toValue: baseWidth, duration: 1000, useNativeDriver: false }),
          Animated.timing(introBoxOpacity, { toValue: 0, duration: 1000, useNativeDriver: false }),
          Animated.timing(introTextOpacity, { toValue: 0, duration: 500, useNativeDriver: false }),
        ]),
      ]).start();
    };

    animateIntroBox();

    setTimeout(() => setIntroText(userName), 800);
    setTimeout(() => setIntroText("How are you feeling today?"), 3400);
  }, [userName]);

  return {
    introBoxWidth,
    introBoxOpacity,
    introTextOpacity,
    introText
  };
}; 