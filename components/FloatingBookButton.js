import React from 'react';
import { StyleSheet, TouchableOpacity, Text, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const FloatingBookButton = ({ onPress, scrollY }) => {
  // Remove opacity interpolation and only keep translation
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
          // Removed opacity animation
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
        >
          <Text style={styles.bookNowText}>Book Appointment</Text>
          <MaterialCommunityIcons name="arrow-right" size={20} color="#fff" />
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
    paddingBottom: 10, // Increased padding to move button down
    paddingHorizontal: 16,
    marginBottom: 0, // Increased margin from tab bar
    backgroundColor: 'transparent',
  },
  buttonGradient: {
    borderRadius: 12,
    elevation: 8,
    shadowColor: '#4C35E3',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  bookNowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  bookNowText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    marginRight: 8,
  },
});

export default FloatingBookButton;
