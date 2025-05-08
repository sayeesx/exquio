import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  TextInput, 
  StyleSheet, 
  Platform, 
  TouchableOpacity,
  Animated,
  Easing,
  Text
} from 'react-native';
import { MaterialCommunityIcons } from "@expo/vector-icons";

const STATIC_TEXT = "Search for";
const ROTATING_WORDS = ["Doctors", "Specialities", "Hospitals"];
const WORD_CHANGE_INTERVAL = 3000; // Time between complete rotations

const SearchBar = ({ value, onChangeText, onPress, inHeader = false }) => {
  // State for tracking active word index
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState(1);
  
  // Animation refs
  const animationValue = useRef(new Animated.Value(0)).current;
  const isAnimating = useRef(false);
  const timeoutRef = useRef(null);

  // Clean up all animations and timeouts on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      animationValue.stopAnimation();
    };
  }, []);

  // Start animation cycle when in header mode
  useEffect(() => {
    if (inHeader) {
      scheduleNextAnimation();
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [inHeader, currentIndex]);

  const scheduleNextAnimation = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      if (!isAnimating.current) {
        runAnimation();
      }
    }, WORD_CHANGE_INTERVAL);
  };

  // Function to run the animation sequence
  const runAnimation = () => {
    isAnimating.current = true;
    
    // Reset animation value
    animationValue.setValue(0);
    
    // Calculate next index
    const next = (currentIndex + 1) % ROTATING_WORDS.length;
    setNextIndex(next);
    
    // Run the animation
    Animated.timing(animationValue, {
      toValue: 1,
      duration: 750,
      easing: Easing.bezier(0.645, 0.045, 0.355, 1.000), // Cubic bezier for smooth motion
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        // Update to next word
        setCurrentIndex(next);
        isAnimating.current = false;
        scheduleNextAnimation();
      }
    });
  };

  // Front card animations - rotating DOWN
  const frontRotateX = animationValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['0deg', '90deg', '90deg'],
  });
  
  const frontOpacity = animationValue.interpolate({
    inputRange: [0, 0.25, 0.5, 1],
    outputRange: [1, 0.5, 0, 0],
  });
  
  const frontTranslateY = animationValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, -8, -8],
  });

  // Back card animations - rotating UP (opposite direction)
  const backRotateX = animationValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['90deg', '90deg', '0deg'], // Changed from -90deg to 90deg for opposite rotation
  });
  
  const backOpacity = animationValue.interpolate({
    inputRange: [0, 0.5, 0.75, 1],
    outputRange: [0, 0, 0.5, 1],
  });
  
  const backTranslateY = animationValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [8, 8, 0], // Positive value for coming from bottom
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.searchBox}
        onPress={onPress}
        activeOpacity={0.7}
        disabled={!inHeader}
      >
        <MaterialCommunityIcons name="magnify" size={22} color="#64748B" />
        
        {inHeader ? (
          <View style={styles.placeholderContainer}>
            <Text style={styles.staticText}>{STATIC_TEXT}</Text>
            <View style={styles.rotatingTextContainer}>
              {/* Container with fixed height and overflow hidden for clean animation */}
              <View style={styles.animationContainer}>
                {/* Front card (current word) - rotates down */}
                <Animated.View
                  style={[
                    styles.wordWrapper,
                    {
                      opacity: frontOpacity,
                      transform: [
                        { perspective: 800 },
                        { rotateX: frontRotateX },
                        { translateY: frontTranslateY }
                      ],
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      backfaceVisibility: 'hidden'
                    }
                  ]}
                >
                  <Text style={styles.rotatingText}>
                    {ROTATING_WORDS[currentIndex]}
                  </Text>
                </Animated.View>

                {/* Back card (next word) - rotates up */}
                <Animated.View
                  style={[
                    styles.wordWrapper,
                    {
                      opacity: backOpacity,
                      transform: [
                        { perspective: 800 },
                        { rotateX: backRotateX },
                        { translateY: backTranslateY }
                      ],
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      backfaceVisibility: 'hidden'
                    }
                  ]}
                >
                  <Text style={styles.rotatingText}>
                    {ROTATING_WORDS[nextIndex]}
                  </Text>
                </Animated.View>
              </View>
            </View>
          </View>
        ) : (
          <TextInput
            style={styles.input}
            placeholder={`${STATIC_TEXT} ${ROTATING_WORDS[0]}`}
            placeholderTextColor="#94A3B8"
            value={value}
            onChangeText={onChangeText}
            editable={!inHeader}
            pointerEvents={inHeader ? 'none' : 'auto'}
            autoCorrect={false}
            autoCapitalize="none"
          />
        )}

        {value?.length > 0 && !inHeader && (
          <TouchableOpacity 
            onPress={() => onChangeText('')} 
            style={styles.clearButton}
          >
            <MaterialCommunityIcons 
              name="close-circle-outline" 
              size={20} 
              color="#94A3B8" 
            />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 2,
    paddingVertical: 8,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    height: 50,
    borderRadius: 26,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  placeholderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  staticText: {
    fontSize: 16,
    color: '#94A3B8',
    fontFamily: 'Inter_400Regular',
    marginRight: 6,
  },
  rotatingTextContainer: {
    width: 120,
    height: 24,
    position: 'relative',
  },
  animationContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
    overflow: 'hidden', // Important to clip the animation
  },
  wordWrapper: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  rotatingText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#94A3B8',
    fontFamily: 'Inter_400Regular',
    includeFontPadding: false,
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1E293B',
    fontFamily: 'Inter_500Medium',
    padding: 0,
  },
  clearButton: {
    padding: 4,
  },
});

export default SearchBar;