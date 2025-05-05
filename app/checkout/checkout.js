import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  StatusBar,
  Platform,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { useFonts } from 'expo-font';

export default function Checkout() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [fontsLoaded] = useFonts({
    InterRegular: Inter_400Regular,
    InterMedium: Inter_500Medium,
    InterSemiBold: Inter_600SemiBold,
    InterBold: Inter_700Bold,
  });

  const [isConfirming, setIsConfirming] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [appliedCoupon] = useState(params.couponCode || null);
  const [discountAmount] = useState(params.discountAmount || 0);

  const handleConfirmPayment = () => {
    setIsConfirming(true);
    
    // Simulate payment process
    setTimeout(() => {
      setIsConfirming(false);
      
      // Random payment result for demo
      const result = Math.random();
      if (result > 0.7) {
        router.push('/checkout/gateway/failed');
      } else if (result > 0.4) {
        router.push('/checkout/gateway/pending');
      } else {
        router.push('/checkout/gateway/success');
      }
    }, 2000);
  };

  if (!fontsLoaded) {
    return null;
  }

  const renderDoctorImage = () => {
    return (
      <View style={styles.doctorImageContainer}>
        <Image 
          source={{ 
            uri: appointmentDetails.doctor.image,
            cache: 'force-cache',
          }}
          style={styles.doctorImage}
          onError={() => {
            setImageError(true);
          }}
        />
        <View style={styles.verifiedBadge}>
          <Icon name="check-decagram" size={16} color="#4E54C8" />
        </View>
      </View>
    );
  };

  const getPaymentMethodLogo = (methodName) => {
    if (methodName.includes('Debit')) {
      return 'https://cdn.iconscout.com/icon/free/png-512/visa-3-226460.png';
    } else if (methodName.includes('Credit')) {
      return 'https://cdn.iconscout.com/icon/free/png-512/mastercard-3521564-2944982.png';
    } else if (methodName.includes('Google Pay')) {
      return 'https://play-lh.googleusercontent.com/HArtbyi53u0jnqhnnxkQnMx9dHOERNcprZyKnInd2nrfM7Wd9ivMNTiz7IJP6-mSpwk';
    } else if (methodName.includes('PhonePe')) {
      return 'https://download.logo.wine/logo/PhonePe/PhonePe-Logo.wine.png';
    } else if (methodName.includes('Paytm')) {
      return 'https://download.logo.wine/logo/Paytm/Paytm-Logo.wine.png';
    } else if (methodName.includes('BHIM')) {
      return 'https://play-lh.googleusercontent.com/B5cNBA15IxjCT-d9TnuM39RPaLU1lGi6BvhWudR8g_QStDoNyEaQ8g_fwuKWSjrUvCw';
    } else if (methodName.includes('Amazon Pay')) {
      return 'https://download.logo.wine/logo/Amazon_Pay/Amazon_Pay-Logo.wine.png';
    }
    return null;
  };

  const renderPaymentMethod = () => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Payment Method</Text>
      {params.paymentMethod && (
        <View style={styles.enhancedMethodInfo}>
          <View style={styles.methodLogoContainer}>
            {getPaymentMethodLogo(params.paymentMethod) ? (
              <Image 
                source={{ uri: getPaymentMethodLogo(params.paymentMethod) }}
                style={styles.methodLogo}
                resizeMode="contain"
              />
            ) : (
              <Icon name="credit-card-check" size={24} color="#22C55E" />
            )}
          </View>
          <View style={styles.methodDetails}>
            <Text style={styles.methodName}>{params.paymentMethod}</Text>
            <Text style={styles.methodStatus}>Payment method selected</Text>
          </View>
          <View style={styles.methodBadge}>
            <Icon name="shield-check" size={16} color="#22C55E" />
            <Text style={styles.methodBadgeText}>Secure</Text>
          </View>
        </View>
      )}
    </View>
  );

  const renderPriceBreakdown = () => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Price Details</Text>
      <View style={styles.priceContainer}>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Consultation Fee</Text>
          <Text style={styles.priceValue}>₹{params.amount}</Text>
        </View>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Platform Fee</Text>
          <Text style={styles.priceValue}>₹1,000</Text>
        </View>
        {params.couponCode && (
          <View style={styles.couponRow}>
            <View style={styles.couponInfo}>
              <Icon name="ticket-percent" size={16} color="#22C55E" />
              <Text style={styles.couponLabel}>
                Coupon ({params.couponCode})
              </Text>
            </View>
            <Text style={styles.couponDiscount}>-₹{params.discountAmount}</Text>
          </View>
        )}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Amount</Text>
          <Text style={styles.totalValue}>
            ₹{params.couponCode 
              ? (parseInt(params.amount.replace(',', '')) + 1000 - parseInt(params.discountAmount.replace(',', ''))).toLocaleString()
              : (parseInt(params.amount.replace(',', '')) + 1000).toLocaleString()
            }
          </Text>
        </View>
      </View>
    </View>
  );

  const renderPrivacySection = () => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Important Information</Text>
      <View style={styles.privacyContainer}>
        <View style={styles.privacyItem}>
          <Icon name="shield-lock" size={20} color="#4E54C8" />
          <Text style={styles.privacyText}>
            Your payment information is encrypted and secure
          </Text>
        </View>
        <View style={styles.privacyItem}>
          <Icon name="calendar-check" size={20} color="#4E54C8" />
          <Text style={styles.privacyText}>
            Appointment confirmation will be sent via email and SMS
          </Text>
        </View>
        <View style={styles.privacyItem}>
          <Icon name="clock-outline" size={20} color="#4E54C8" />
          <Text style={styles.privacyText}>
            Please arrive 15 minutes before your scheduled time
          </Text>
        </View>
      </View>

      <View style={styles.policyContainer}>
        <Text style={styles.policyTitle}>Cancellation Policy</Text>
        <Text style={styles.policyText}>
          Free cancellation up to 24 hours before your appointment. 
          Cancellations within 24 hours may incur a fee of 10% of the consultation charges.
        </Text>
      </View>

      <TouchableOpacity style={styles.termsButton}>
        <Text style={styles.termsText}>
          By confirming, you agree to our Terms & Conditions and Privacy Policy
        </Text>
        <Icon name="chevron-right" size={16} color="#6B7280" />
      </TouchableOpacity>
    </View>
  );

  const renderDoctorCard = () => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Appointment Details</Text>
      <View style={styles.doctorCard}>
        <Image 
          source={{ uri: params.doctorImage }}
          style={styles.doctorImage}
          defaultSource={require('../../assets/default-avatar.png')}
        />
        <View style={styles.doctorInfo}>
          <Text style={styles.doctorName}>{params.doctorName}</Text>
          <Text style={styles.doctorSpecialty}>{params.specialty}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        backgroundColor="#4E54C8"
        barStyle="light-content"
        translucent={true}
      />
      <LinearGradient 
        colors={['#4E54C8', '#8F94FB']} 
        style={[styles.gradient, { paddingTop: StatusBar.currentHeight }]}
      >
        <View style={styles.header}>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Checkout</Text>
            <Text style={styles.headerSubtitle}>Review your appointment</Text>
          </View>
        </View>
        <View style={styles.cardContainer}>
          <ScrollView 
            style={styles.card}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.cardContent}
          >
            {/* Appointment Details */}
            {renderDoctorCard()}

            {renderPaymentMethod()}

            {renderPriceBreakdown()}

            {renderPrivacySection()}

            {/* Confirm Button */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleConfirmPayment}
                disabled={isConfirming}
              >
                <LinearGradient
                  colors={['#4E54C8', '#8F94FB']}
                  style={styles.confirmGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  {isConfirming ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <>
                      <Icon name="check-circle" size={24} color="#FFF" style={styles.confirmIcon} />
                      <Text style={styles.confirmText}>Confirm Payment</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4E54C8',
  },
  gradient: {
    flex: 1,
    paddingTop: (StatusBar.currentHeight || 0) - 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // Changed from space-between to center
    paddingTop: 13,
    paddingBottom: 16,
    paddingHorizontal: 16,
    height: 76,
    marginTop: 27,
  },
  headerTitleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    // Remove position absolute and related positioning
    flex: 1,
  },
  // ... copy relevant styles from payment.js and add new ones ...
  headerTitle: {
    fontFamily: 'InterBold',
    fontSize: 34,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 0, // Remove bottom margin to keep title in place
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontFamily: 'InterRegular',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.85)',
    letterSpacing: 0.3,
    marginTop: 8, // Add top margin to move only subtitle down
  },
  cardContainer: {
    flex: 1,
    marginHorizontal: Platform.OS === 'android' ? 12 : 16,
    marginTop: 5,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden', // This will hide content outside the rounded corners
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  card: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  cardContent: {
    padding: Platform.OS === 'android' ? 16 : 20,
  },
  summarySection: {
    alignItems: 'center',
    padding: 20,
  },
  summaryTitle: {
    fontFamily: 'InterSemiBold',
    fontSize: 18,
    color: '#1F2937',
    marginBottom: 16,
  },
  methodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
  },
  methodText: {
    fontFamily: 'InterMedium',
    fontSize: 16,
    color: '#22C55E',
    marginLeft: 8,
  },
  amountDetails: {
    alignItems: 'center',
  },
  totalAmount: {
    fontFamily: 'InterBold',
    fontSize: 36,
    color: '#1F2937',
    marginBottom: 8,
  },
  processingInfo: {
    fontFamily: 'InterRegular',
    fontSize: 14,
    color: '#6B7280',
  },
  sectionContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  doctorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  doctorImageContainer: {
    position: 'relative',
    marginRight: 12,
  },
  doctorImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#4C35E3',
  },
  defaultImageContainer: {
    backgroundColor: '#F0F3FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontFamily: 'InterSemiBold',
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 4,
  },
  doctorSpecialty: {
    fontFamily: 'InterMedium',
    fontSize: 14,
    color: '#6B7280',
  },
  detailsContainer: {
    marginTop: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailTexts: {
    marginLeft: 12,
    flex: 1,
  },
  detailLabel: {
    fontFamily: 'InterRegular',
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  detailValue: {
    fontFamily: 'InterMedium',
    fontSize: 14,
    color: '#1F2937',
  },
  priceContainer: {
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 4, // Add some bottom margin
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    marginTop: 8,
  },
  totalLabel: {
    fontFamily: 'InterSemiBold',
    fontSize: 16,
    color: '#1F2937',
  },
  totalValue: {
    fontFamily: 'InterBold',
    fontSize: 20,
    color: '#1F2937',
    textAlign: 'right',
  },
  buttonContainer: {
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
  },
  confirmButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#4E54C8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  confirmGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  confirmIcon: {
    marginRight: 8,
  },
  confirmText: {
    fontFamily: 'InterBold',
    fontSize: 16,
    color: '#FFF',
    letterSpacing: 0.5,
  },
  enhancedMethodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    padding: 16,
    borderRadius: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#22C55E20',
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  methodLogoContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  methodLogo: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  methodDetails: {
    flex: 1,
    marginLeft: 12,
  },
  methodName: {
    fontFamily: 'InterSemiBold',
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 2,
  },
  methodStatus: {
    fontFamily: 'InterMedium',
    fontSize: 12,
    color: '#6B7280',
  },
  methodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 8,
  },
  methodBadgeText: {
    fontFamily: 'InterMedium',
    fontSize: 12,
    color: '#22C55E',
    marginLeft: 4,
  },
  privacyContainer: {
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  privacyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  privacyText: {
    fontFamily: 'InterMedium',
    fontSize: 13,
    color: '#1F2937',
    marginLeft: 12,
    flex: 1,
  },
  policyContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FCD34D20',
  },
  policyTitle: {
    fontFamily: 'InterSemiBold',
    fontSize: 14,
    color: '#92400E',
    marginBottom: 4,
  },
  policyText: {
    fontFamily: 'InterRegular',
    fontSize: 13,
    color: '#92400E',
    lineHeight: 18,
  },
  termsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    padding: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  termsText: {
    fontFamily: 'InterRegular',
    fontSize: 12,
    color: '#6B7280',
    flex: 1,
    marginRight: 8,
  },
  priceLabel: {
    fontFamily: 'InterMedium',
    fontSize: 14,
    color: '#374151',
  },
  discountAmount: {
    fontFamily: 'InterSemiBold',
    fontSize: 14,
    color: '#374151',
  },
  couponRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    borderStyle: 'dashed',
  },

  couponInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  couponLabel: {
    fontFamily: 'InterMedium',
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
  },

  couponCode: {
    fontFamily: 'InterBold',
    fontSize: 14,
    color: '#22C55E',
    marginLeft: 4,
  },

  couponDiscount: {
    fontFamily: 'InterSemiBold',
    fontSize: 14,
    color: '#374151', // Changed from green to regular text color
  },
});
