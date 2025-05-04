import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';

export default function Success() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <LottieView
        source={require('../../../assets/animations/success.json')}
        autoPlay
        loop={false}
        style={styles.animation}
      />
      <Text style={styles.title}>Payment Successful!</Text>
      <Text style={styles.message}>Your appointment has been confirmed</Text>
      
      <TouchableOpacity 
        style={styles.button}
        onPress={() => router.push('/(tabs)')} // This will navigate to the home/index page
      >
        <LinearGradient
          colors={['#4E54C8', '#8F94FB']}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={styles.buttonText}>Go to Home</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 20
  },
  animation: {
    width: 200,
    height: 200,
    marginBottom: 20
  },
  title: {
    fontSize: 24,
    fontFamily: 'InterBold',
    color: '#22C55E',
    marginBottom: 8
  },
  message: {
    fontSize: 16,
    fontFamily: 'InterMedium',
    color: '#6B7280',
    marginBottom: 32
  },
  button: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden'
  },
  gradient: {
    paddingVertical: 16,
    alignItems: 'center'
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'InterSemiBold'
  }
});
