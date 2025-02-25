import React, { useEffect, useRef, memo } from 'react';
import { StyleSheet, TouchableOpacity, Text, Animated, View, Easing } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const ShimmerEffect = memo(() => {
  const translateX = useRef(new Animated.Value(-200)).current;

  useEffect(() => {
    let isMounted = true;
    let shimmerAnimation;

    if (isMounted) {
      shimmerAnimation = Animated.loop(
        Animated.timing(translateX, {
          toValue: 400,
          duration: 1500,
          useNativeDriver: true,
          easing: Easing.ease,
        })
      );
      shimmerAnimation.start();
    }

    return () => {
      isMounted = false;
      if (shimmerAnimation) {
        shimmerAnimation.stop();
      }
    };
  }, []);

  return (
    <View style={styles.shimmerContainer}>
      <Animated.View
        style={[
          styles.shimmer,
          {
            transform: [{ translateX }],
          },
        ]}
      >
        <LinearGradient
          colors={['transparent', 'rgba(255,255,255,0.4)', 'transparent']}
          locations={[0.35, 0.5, 0.65]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
});

const FloatingBookButton = ({ onPress, scrollY }) => {
  const buttonTranslate = scrollY.interpolate({
    inputRange: [-1, 0, 100, 200],
    outputRange: [0, 0, 50, 100],
    extrapolate: 'clamp'
  });

  return (
    <Animated.View
      style={[
        styles.bottomButtonContainer,
        {
          transform: [{ translateY: buttonTranslate }]
        }
      ]}
    >
      <LinearGradient
        colors={["#4C35E3", "#4B47E5", "#5465FF"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.buttonGradient}
      >
        <TouchableOpacity 
          style={styles.bookNowButton}
          onPress={onPress}
          activeOpacity={0.8}
        >
          <Text style={styles.bookNowText}>Book Appointment</Text>
          <MaterialCommunityIcons name="arrow-right" size={20} color="#fff" />
          <ShimmerEffect />
        </TouchableOpacity>
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  bottomButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 10,
    paddingHorizontal: 16,
    marginBottom: 0,
    backgroundColor: 'transparent',
  },
  buttonGradient: {
    borderRadius: 12,
    elevation: 8,
    shadowColor: '#4C35E3',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    overflow: 'hidden', // Important for shimmer effect
  },
  bookNowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    position: 'relative', // Important for shimmer positioning
  },
  bookNowText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    marginRight: 8,
  },
  shimmerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  shimmerGradient: {
    flex: 1,
    transform: [{ skewX: '-25deg' }],
  },
  shimmerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.5,
  },
  shimmerGradient: {
    flex: 1,
    width: '50%', // Adjusted width
  },
});

export default FloatingBookButton;
