"use client";
import { useEffect, useRef } from "react";
import { View, StyleSheet, TouchableOpacity, Dimensions, Animated, Easing, Text } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from 'expo-blur';
import { useFonts, Inter_700Bold } from '@expo-google-fonts/inter';

const { width, height } = Dimensions.get("window");

const CAROUSEL_WIDTH = width;
const CAROUSEL_HEIGHT = 200;
const LOGO_WIDTH = 200;
const LOGO_HEIGHT = 100;
const LOGO_SPACING = 20;

const logos = [
  require("../assets/hospital-logos/avs.png"),
  require("../assets/hospital-logos/almas.png"),
  require("../assets/hospital-logos/aster.png"),
  require("../assets/hospital-logos/hms.png"),
];

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

export default function AnimatedLogo() {
  const router = useRouter();
  const carouselPosition = useRef(new Animated.Value(0)).current;
  const textFadeIn = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const signInArrowRotation = useRef(new Animated.Value(0)).current;
  const signUpArrowRotation = useRef(new Animated.Value(0)).current;
  const blurIntensity = useRef(new Animated.Value(100)).current; // increased from 40 to 100

  const [fontsLoaded] = useFonts({
    Inter_700Bold,
  });

  // Calculate total width of all logos plus spacing
  const totalWidth = (LOGO_WIDTH + LOGO_SPACING) * logos.length;
  const centerPoint = width / 2;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(textFadeIn, {
        toValue: 1,
        duration: 3500, // increased from 2500
        easing: Easing.bezier(0.4, 0, 0.2, 1),
        useNativeDriver: true,
      }),
      // Slower, smoother blur animation
      Animated.spring(blurIntensity, {
        toValue: 0,
        duration: 4000, // increased from 3000
        delay: 800,    // increased from 300
        friction: 90,  // increased from 60
        tension: 15,   // decreased from 20
        useNativeDriver: false,
      })
    ]).start();

    const animateCarousel = () => {
      carouselPosition.setValue(0);
      Animated.loop(
        Animated.sequence([
          Animated.timing(carouselPosition, {
            toValue: -totalWidth,
            duration: 15000,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        ]),
        {
          iterations: -1,
        }
      ).start();
    };

    animateCarousel();
  }, []);

  const getOpacityStyle = (index) => {
    const inputRange = [];
    const outputRange = [];
    const itemPosition = Number(index) * (LOGO_WIDTH + LOGO_SPACING);
    
    // Create a range of positions for opacity interpolation
    for (let i = -2; i <= logos.length + 2; i++) {
      const position = i * (LOGO_WIDTH + LOGO_SPACING);
      inputRange.push(position);
      // Original opacity values
      outputRange.push(i === 0 ? 1 : 0.3);
    }

    return {
      opacity: carouselPosition.interpolate({
        inputRange: inputRange.map(x => x - centerPoint + LOGO_WIDTH / 2),
        outputRange,
        extrapolate: 'clamp'
      })
    };
  };

  const animateButtonPress = (arrowRotation, callback) => {
    Animated.parallel([
      Animated.sequence([
        Animated.timing(buttonScale, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(buttonScale, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.timing(arrowRotation, {
          toValue: 1,
          duration: 200,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
          useNativeDriver: true,
        }),
        Animated.timing(arrowRotation, {
          toValue: 0,
          duration: 200,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      setTimeout(callback, 200);
    });
  };

  if (!fontsLoaded) {
    return null;
  }

  // Create a duplicated array of logos for seamless looping
  const extendedLogos = [...logos, ...logos, ...logos, ...logos, ...logos];  

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#000033", "#000"]} style={styles.gradient} />

      <View style={styles.textContainer}>
        <AnimatedBlurView
          intensity={blurIntensity}
          tint="dark"
          style={styles.blurContainer}
        >
          <Animated.Text
            style={[
              styles.heading,
              {
                opacity: textFadeIn
              }
            ]}
          >
            Book Doctors in Kottakkal
          </Animated.Text>
        </AnimatedBlurView>
      </View>

      {/* Carousel Container */}
      <View style={styles.carouselWrapper}>
        <LinearGradient
          colors={['#000', 'transparent']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 0.15, y: 0.5 }}
          style={styles.gradientFade}
        />
        
        <Animated.View
          style={[
            styles.carouselContainer,
            {
              transform: [{ translateX: carouselPosition }],
            },
          ]}
        >
          <View style={styles.carousel}>
            {extendedLogos.map((logo, index) => (
              <Animated.Image
                key={`${index}-${logo}`}
                source={logo}
                style={[
                  styles.logo,
                  getOpacityStyle(index),
                ]}
                resizeMode="contain"
              />
            ))}
          </View>
        </Animated.View>

        <LinearGradient
          colors={['transparent', '#000']}
          start={{ x: 0.85, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={[styles.gradientFade, { right: 0 }]}
        />
      </View>

      {/* Footer with Animated Buttons */}
      <View style={styles.footer}>
        <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
          <TouchableOpacity
            style={[styles.button, styles.signInButton]}
            onPress={() =>
              animateButtonPress(signInArrowRotation, () =>
                router.replace("/auth/login?form=signin")
              )
            }
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Sign In  </Text>
            <Animated.View
              style={[
                styles.arrowContainer,
                {
                  transform: [
                    {
                      rotate: signInArrowRotation.interpolate({
                        inputRange: [0, 1],
                        outputRange: ["0deg", "90deg"],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Text style={styles.arrow}>→</Text>
            </Animated.View>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
          <TouchableOpacity
            style={[styles.button, styles.signUpButton]}
            onPress={() =>
              animateButtonPress(signUpArrowRotation, () =>
                router.replace("/auth/login?form=signup")
              )
            }
            activeOpacity={0.8}
          >
            <Text style={[styles.buttonText, styles.signUpText]}>Sign Up</Text>
            <Animated.View
              style={[
                styles.arrowContainer,
                {
                  transform: [
                    {
                      rotate: signUpArrowRotation.interpolate({
                        inputRange: [0, 1],
                        outputRange: ["0deg", "90deg"],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Text style={[styles.arrow, styles.signUpArrow]}>→</Text>
            </Animated.View>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  textContainer: {
    marginTop: 50,
    paddingHorizontal: 20,
  },
  blurContainer: {
    borderRadius: 15,
    overflow: 'hidden',
    padding: 20,
    backgroundColor: 'transparent'
  },
  heading: {
    fontFamily: 'Inter_700Bold',
    fontSize: 36,
    color: "#fff",
    textAlign: "center",
    marginBottom: 15,
    lineHeight: 44,
    letterSpacing: 0.5,
    textShadowColor: "rgba(0, 0, 255, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  carouselWrapper: {
    height: CAROUSEL_HEIGHT,
    position: "absolute",
    bottom: 150,
    left: 0,
    right: 0,
    overflow: "hidden",
  },
  gradientFade: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: width * 0.15,
    zIndex: 1,
  },
  carouselContainer: {
    flexDirection: "row",
    height: CAROUSEL_HEIGHT,
  },
  carousel: {
    flexDirection: "row",
    alignItems: "center",
    gap: LOGO_SPACING,
  },
  logo: {
    width: LOGO_WIDTH,
    height: LOGO_HEIGHT,
    borderRadius: 10,
  },
  footer: {
    flexDirection: "row",
    position: "absolute",
    bottom: 50,
    left: 20,
    right: 20,
    justifyContent: "space-between",
  },
  button: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 35,
    marginHorizontal: 10,
  },
  signInButton: {
    backgroundColor: "#fff",
  },
  signUpButton: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: "#fff",
  },
  buttonText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
  signUpText: {
    color: "#fff",
  },
  arrowContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
  arrow: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  signUpArrow: {
    color: "#fff",
  },
});