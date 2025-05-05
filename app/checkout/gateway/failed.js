import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';

export default function Failed() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <LottieView
        source={require('../../../assets/animations/failed.json')}
        autoPlay
        loop={false}
        style={styles.animation}
      />
      <Text style={styles.title}>Payment Failed</Text>
      <Text style={styles.message}>
        Something went wrong with your payment. 
        Don't worry, you can try booking again with the same doctor.
      </Text>
      
      <TouchableOpacity 
        style={styles.button}
        onPress={() => {
          // Get the doctorId from params and navigate back to doctor's page
          const params = router.params;
          router.push({
            pathname: '/doctors/[id]',
            params: { id: params?.doctorId }
          });
        }}
      >
        <LinearGradient
          colors={['#4E54C8', '#8F94FB']}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={styles.buttonText}>Book Again</Text>
        </LinearGradient>
      </TouchableOpacity>

      <Text style={styles.retryText}>
        Please try another payment method or contact support if the issue persists
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  // ... same styles as success.js ...
  title: {
    fontSize: 24,
    fontFamily: 'InterBold',
    color: '#EF4444',
    marginBottom: 8
  },
  retryText: {
    fontSize: 14,
    fontFamily: 'InterRegular',
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 16,
    paddingHorizontal: 20
  }
});
