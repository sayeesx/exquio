"use client"

import { View } from 'react-native';
import { MotiView } from 'moti';
import { BlurView } from 'expo-blur';
import { useRef } from "react"

export function BlurFade({
  children,
  style,
  duration = 400,
  delay = 0,
  offset = 6,
  direction = "down",
  initialBlur = 10,
  ...props
}) {
  const getTransform = () => {
    const transform = [];
    if (direction === "left" || direction === "right") {
      transform.push({ translateX: direction === "right" ? -offset : offset });
    } else {
      transform.push({ translateY: direction === "down" ? -offset : offset });
    }
    return transform;
  };

  return (
    <MotiView
      from={{
        opacity: 0,
        transform: getTransform(),
        blurRadius: initialBlur,
      }}
      animate={{
        opacity: 1,
        transform: [{ translateX: 0 }, { translateY: 0 }],
        blurRadius: 0,
      }}
      transition={{
        type: 'timing',
        duration: duration,
        delay: delay,
      }}
      style={[
        {
          overflow: 'hidden',
        },
        style
      ]}
      {...props}
    >
      {children}
    </MotiView>
  )
}

export function BlurText({ text, delay = 0, duration = 400 }) {
  return (
    <BlurFade
      delay={delay}
      duration={duration}
      style={{
        padding: 10,
      }}
    >
      {text}
    </BlurFade>
  );
}
