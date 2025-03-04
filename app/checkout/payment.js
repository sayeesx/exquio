import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Image,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Dimensions,
  Animated,
  Easing,
  StatusBar, // Add this import
  Appearance, // Add this import
  UIManager, // Add this import
  NativeModules, // Add this import
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Haptics from 'expo-haptics';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { useFonts } from 'expo-font';

const upiOptions = [
  {
    id: 'gpay',
    name: 'Google Pay',
    logo: 'https://play-lh.googleusercontent.com/HArtbyi53u0jnqhnnxkQnMx9dHOERNcprZyKnInd2nrfM7Wd9ivMNTiz7IJP6-mSpwk', // Updated Google Pay logo
  },
  {
    id: 'phonepe',
    name: 'PhonePe',
    logo: 'https://download.logo.wine/logo/PhonePe/PhonePe-Logo.wine.png',
  },
  {
    id: 'paytm',
    name: 'Paytm',
    logo: 'https://download.logo.wine/logo/Paytm/Paytm-Logo.wine.png',
  },
  {
    id: 'bhim',
    name: 'BHIM UPI',
    logo: 'https://play-lh.googleusercontent.com/B5cNBA15IxjCT-d9TnuM39RPaLU1lGi6BvhWudR8g_QStDoNyEaQ8g_fwuKWSjrUvCw', // Updated BHIM logo
  },
  {
    id: 'amazonpay',
    name: 'Amazon Pay',
    logo: 'https://download.logo.wine/logo/Amazon_Pay/Amazon_Pay-Logo.wine.png',
  }
];

// Create a new function for the main header back button
const renderMainBackButton = (onPress) => (
  <TouchableOpacity 
    style={styles.simpleBackButton}
    onPress={() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }}
  >
    <View style={styles.backButtonInner}>
      <Icon name="arrow-left" size={24} color="#FFF" />
    </View>
  </TouchableOpacity>
);

// Keep the original renderBackButton for other sections
const renderBackButton = (onPress) => (
  <TouchableOpacity 
    style={styles.standardBackButton}
    onPress={() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }}
  >
    <LinearGradient
      colors={['#4E54C8', '#8F94FB']}
      style={styles.standardBackGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
    >
      <Icon name="arrow-left" size={18} color="#FFF" />
    </LinearGradient>
  </TouchableOpacity>
);

export default function Payment() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [amount] = useState(params.amount || '0');
  const [doctorName] = useState(params.doctorName || '');
  const [doctorId] = useState(params.doctorId);
  const [patientDetails] = useState(
    params.patientDetails ? JSON.parse(params.patientDetails) : null
  );
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [showCardForm, setShowCardForm] = useState(false);
  const [isCardSaved, setIsCardSaved] = useState(false);
  const [savedCards, setSavedCards] = useState([]);
  const [showSavedCards, setShowSavedCards] = useState(false);
  const [fontsLoaded] = useFonts({
    InterRegular: Inter_400Regular,
    InterMedium: Inter_500Medium,
    InterSemiBold: Inter_600SemiBold,
    InterBold: Inter_700Bold,
  });
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [selectedCardIndex, setSelectedCardIndex] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [showUpiOptions, setShowUpiOptions] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedUpi, setSelectedUpi] = useState(null);
  const spinValue = new Animated.Value(0);
  const scaleValue = new Animated.Value(1);
  const opacityValue = new Animated.Value(1);
  const successOpacity = new Animated.Value(0);
  const shimmerAnimation = useMemo(() => new Animated.Value(0), []);
  const shimmerAnimatedValue = useMemo(() => new Animated.Value(0), []);
  const shimmerColors = useMemo(() => ['rgba(255,255,255,0)', 'rgba(255,255,255,0.3)', 'rgba(255,255,255,0)'], []);

  const animatedValues = useMemo(() => ({
    buttonScale: new Animated.Value(1),
    buttonOpacity: new Animated.Value(1),
    loadingProgress: new Animated.Value(0),
    loadingRotation: new Animated.Value(0),
    successScale: new Animated.Value(0),
    rippleScale: new Animated.Value(0),
    rippleOpacity: new Animated.Value(0),
  }), []);

  const [showCouponPopup, setShowCouponPopup] = useState(false);
  const [appliedCouponCode, setAppliedCouponCode] = useState('');
  const popupAnimation = useRef(new Animated.Value(0)).current;
  const [isCouponApplied, setIsCouponApplied] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor('#4E54C8');
      StatusBar.setBarStyle('light-content');
      StatusBar.setTranslucent(true);
      
      // Use SystemUI to set navigation bar color
      if (NativeModules.StatusBarManager) {
        NativeModules.StatusBarManager.setColor('#4E54C8', false);
      }
    }
  }, []);

  useEffect(() => {
    const startShimmerAnimation = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerAnimation, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
            easing: Easing.linear,
          }),
          Animated.timing(shimmerAnimation, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
            easing: Easing.linear,
          }),
        ])
      ).start();
    };

    startShimmerAnimation();
  }, [shimmerAnimation]);

  useEffect(() => {
    const startShimmerAnimation = () => {
      shimmerAnimatedValue.setValue(0);
      Animated.loop(
        Animated.timing(shimmerAnimatedValue, {
          toValue: 1,
          duration: 2000,
          easing: Easing.bezier(0.4, 0.0, 0.2, 1),
          useNativeDriver: true,
        })
      ).start();
    };

    startShimmerAnimation();
  }, [shimmerAnimatedValue]);

  if (!fontsLoaded) {
    return null;
  }

  // Add card type images to payment methods array
  const paymentMethods = [
    { 
      id: 'debit', 
      name: 'Debit Card',
      image: 'https://cdn.iconscout.com/icon/free/png-512/visa-3-226460.png',
      cardIcon: 'https://cdn.iconscout.com/icon/free/png-512/visa-3-226460.png',
    },
    { 
      id: 'credit', 
      name: 'Credit Card',
      image: 'https://cdn.iconscout.com/icon/free/png-512/mastercard-3521564-2944982.png',
      cardIcon: 'https://cdn.iconscout.com/icon/free/png-512/mastercard-3521564-2944982.png',
    },
    { 
      id: 'upi', 
      name: 'UPI Payment',
      image: 'https://cdn.iconscout.com/icon/free/png-512/upi-2085056-1747946.png',
    },
  ];

  const renderNoSavedCards = () => (
    <View style={styles.noCardsContainer}>
      <View style={styles.sectionHeader}>
        <View style={styles.headerLeft}>
          {renderBackButton(() => {
            setShowSavedCards(false);
            setSelectedMethod(null);
          })}
          <Text style={styles.mainHeaderTitle}>
            {selectedMethod === 'debit' ? 'Debit Card' : 'Credit Card'}
          </Text>
        </View>
      </View>
      
      <View style={styles.noCardsContent}>
        <Icon name="credit-card-off" size={48} color="#8F94FB" style={styles.noCardsIcon} />
        <Text style={styles.noCardsTitle}>No Saved Cards</Text>
        <Text style={styles.noCardsText}>You haven't saved any cards yet</Text>
        <TouchableOpacity 
          style={styles.addFirstCardButton}
          onPress={() => {
            setShowSavedCards(false);
            setShowCardForm(true);
          }}
        >
          <LinearGradient
            colors={['#4E54C8', '#8F94FB']}
            style={styles.addFirstCardGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Icon name="credit-card-plus" size={18} color="#FFF" />
            <Text style={styles.addFirstCardText}>Add New Card</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );

  const handleMethodSelect = (methodId) => {
    setSelectedMethod(methodId);
    if (methodId === 'debit' || methodId === 'credit') {
      setShowSavedCards(true);
      setShowCardForm(false);
      setShowPaymentOptions(false);
      setShowUpiOptions(false);
    } else if (methodId === 'upi') {
      setShowUpiOptions(true);
      setShowSavedCards(false);
      setShowCardForm(false);
      setShowPaymentOptions(false);
    }
  };

  const handleBackToMethods = () => {
    setSelectedMethod(null);
    setShowCardForm(false);
    setShowSavedCards(false);
    setShowPaymentOptions(false);
    setShowUpiOptions(false);
    setCardNumber('');
    setCardName('');
    setExpiry('');
    setCvv('');
    setSelectedCardIndex(null);
  };

  const handleCardNumberChange = (text) => {
    let cleaned = text.replace(/\D/g, '');
    cleaned = cleaned.slice(0, 16);
    let formatted = '';
    for (let i = 0; i < cleaned.length; i += 4) {
      if (i > 0) formatted += ' ';
      formatted += cleaned.slice(i, i + 4);
    }
    setCardNumber(formatted.trim());
  };

  const handleExpiryChange = (text) => {
    let cleaned = text.replace(/\D/g, '');
    cleaned = cleaned.slice(0, 4);
    if (cleaned.length >= 2) {
      cleaned = cleaned.slice(0, 2) + '/' + cleaned.slice(2);
    }
    setExpiry(cleaned);
  };

  const handleNameChange = (text) => {
    const formatted = text.replace(/[^A-Za-z\s]/g, '').toUpperCase();
    setCardName(formatted);
  };

  const handleSubmitCard = () => {
    if (cardNumber && cardName && expiry && cvv) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const newCard = {
        type: selectedMethod,
        number: cardNumber,
        name: cardName,
        expiry: expiry,
        lastFour: cardNumber.slice(-4)
      };
      setSavedCards(prevCards => [...prevCards, newCard]);
      setIsCardSaved(true);
      setCardNumber('');
      setCardName('');
      setExpiry('');
      setCvv('');
      setShowCardForm(false);
      setShowSavedCards(true);
    }
  };

  const startSpinAnimation = () => {
    spinValue.setValue(0);
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  };

  const startPaymentAnimation = () => {
    // Reset values
    scaleValue.setValue(1);
    opacityValue.setValue(1);
    successOpacity.setValue(0);
    spinValue.setValue(0);

    // Create animation sequence
    Animated.sequence([
      // First shrink and fade
      Animated.parallel([
        Animated.timing(scaleValue, {
          toValue: 0.95,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacityValue, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        })
      ]),
      // Then spin loader
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      // Show success state
      Animated.parallel([
        Animated.spring(scaleValue, {
          toValue: 1.1,
          friction: 4,
          useNativeDriver: true,
        }),
        Animated.timing(successOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        })
      ]),
      // Return to normal size
      Animated.spring(scaleValue, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      })
    ]).start(() => {
      // Reset after animation completes
      setTimeout(() => {
        setIsProcessing(false);
        successOpacity.setValue(0);
      }, 1000);
    });
  };

  const handlePayment = () => {
    setIsProcessing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  
    // Use smoother animation sequence
    Animated.sequence([
      Animated.spring(animatedValues.buttonScale, {
        toValue: 0.95,
        useNativeDriver: true,
        damping: 15,
        stiffness: 300
      }),
      Animated.parallel([
        Animated.loop(
          Animated.sequence([
            Animated.timing(animatedValues.loadingRotation, {
              toValue: 1,
              duration: 1000,
              easing: Easing.linear,
              useNativeDriver: true
            }),
            Animated.timing(animatedValues.loadingRotation, {
              toValue: 0,
              duration: 0,
              useNativeDriver: true
            })
          ])
        )
      ])
    ]).start();
  
    // Navigate after animation
    setTimeout(() => {
      router.push({
        pathname: '/checkout/checkout',
        params: {
          amount: params.amount,
          doctorName: params.doctorName,
          doctorImage: params.doctorImage,
          specialty: params.specialty,
          paymentMethod: selectedCard 
            ? `${selectedCard.type === 'debit' ? 'Debit' : 'Credit'} Card ending ${selectedCard.lastFour}`
            : selectedUpi 
              ? selectedUpi.name 
              : 'Selected payment method',
          couponCode: isCouponApplied ? couponCode : null,
          discountAmount: isCouponApplied ? '2,000' : '0'
        }
      });
    }, 2000);
  };

  // Update the card selection to include the card icon
  const handleCardSelect = (card, index) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedCardIndex(index);
    setSelectedCard({
      ...card,
      cardIcon: paymentMethods.find(method => method.id === card.type)?.cardIcon
    });
    setSelectedUpi(null); // Clear any selected UPI
    setSelectedMethod(card.type);
    setTimeout(() => {
      setShowSavedCards(false);
    }, 300);
  };

  const handleUpiSelect = (app) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedUpi(app);
    setSelectedCard(null); // Clear any selected card
    setShowUpiOptions(false);
  };

  // Update the renderSelectedCardBanner function
  const renderSelectedCardBanner = () => {
    if (!selectedCard || showSavedCards || showCardForm) return null;
    return (
      <View style={styles.selectedCardBanner}>
        <View style={styles.selectedCardInfo}>
          <View style={styles.selectedCardIconContainer}>
            {selectedCard.cardIcon ? (
              <Image 
                source={{ uri: selectedCard.cardIcon }}
                style={styles.selectedCardIcon}
                resizeMode="contain"
              />
            ) : (
              <Icon name="shield-check" size={18} color="#22C55E" />
            )}
          </View>
          <View style={styles.selectedCardTextContainer}>
            <Text style={styles.selectedCardTitle}>
              {selectedCard.type === 'debit' ? 'Debit Card' : 'Credit Card'} ending {selectedCard.lastFour}
            </Text>
            <Text style={styles.selectedCardDetails}>
              Selected for payment
            </Text>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.changeCardButton}
          onPress={() => {
            setShowSavedCards(true);
            setSelectedMethod(selectedCard.type);
          }}
        >
          <Icon name="pencil" size={18} color="#22C55E" />
        </TouchableOpacity>
      </View>
    );
  };

  // Update the renderPaymentMethods function
  const renderPaymentMethods = () => {
    const spin = spinValue.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg']
    });

    const showPayButton = selectedCard || selectedUpi;

    const translateX = shimmerAnimatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [-400, 400],
    });

    const shimmerOpacity = shimmerAnimatedValue.interpolate({
      inputRange: [0, 0.2, 0.5, 0.8, 1],
      outputRange: [0, 0.4, 0.6, 0.4, 0],
    });

    const rotation = animatedValues.loadingRotation.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg']
    });

    const rippleScale = animatedValues.rippleScale.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 2]
    });

    const rippleOpacity = animatedValues.rippleScale.interpolate({
      inputRange: [0, 0.2, 1],
      outputRange: [0.4, 0.2, 0]
    });

    return (
      <View style={styles.methodsSection}>
        <Text style={styles.sectionTitle}>
          {(selectedCard || selectedUpi) ? 'Select Another Method' : 'Select Payment Method'}
        </Text>
        <View style={styles.methodsContainer}>
          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.methodCard,
                selectedMethod === method.id && styles.methodCardSelected
              ]}
              onPress={() => handleMethodSelect(method.id)}
              activeOpacity={0.7}
            >
              <View style={styles.methodMain}>
                <Image source={{ uri: method.image }} style={styles.methodIcon} />
                <Text style={styles.methodTitle}>{method.name}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
        {showPayButton && (
          <View style={styles.payButtonWrapper}>
            <Animated.View
              style={[
                styles.buttonContainer,
                {
                  transform: [{ scale: animatedValues.buttonScale }]
                }
              ]}
            >
              <TouchableOpacity
                style={styles.mainPayButton}
                onPress={handlePayment}
                disabled={isProcessing}
              >
                <LinearGradient
                  colors={['#4E54C8', '#8F94FB']}
                  style={styles.mainPayGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  {isProcessing ? (
                    <Animated.View style={styles.loadingContainer}>
                      <Animated.View 
                        style={[
                          styles.loadingIconContainer,
                          { transform: [{ rotate: rotation }] }
                        ]}
                      >
                        <Icon name="loading" size={24} color="#FFF" />
                      </Animated.View>
                      <Animated.View
                        style={[
                          styles.successIcon,
                          {
                            transform: [{ scale: animatedValues.successScale }],
                            opacity: animatedValues.successScale
                          }
                        ]}
                      >
                        <Icon name="check-circle" size={24} color="#FFF" />
                      </Animated.View>
                    </Animated.View>
                  ) : (
                    <View style={styles.buttonContentContainer}>
                      <Icon name="shield-check" size={24} color="#FFF" />
                      <Text style={styles.mainPayText}>Pay Securely</Text>
                    </View>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          </View>
        )}
      </View>
    );
  };

  const renderCardForm = () => (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.cardFormContainer}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <ScrollView 
        style={styles.cardFormScroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={styles.cardFormScrollContent}
      >
        <View style={styles.sectionHeader}>
          <View style={styles.headerLeft}>
            {renderBackButton(handleBackToMethods)}
            <Text style={styles.standardHeaderTitle}>Add Card</Text>
          </View>
        </View>
        <View style={[styles.cardForm, Platform.OS === 'android' && styles.cardFormAndroid]}>
          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>Card Number</Text>
            <TextInput
              style={styles.cardInput}
              placeholder="1234 5678 9012 3456"
              placeholderTextColor="#999"
              value={cardNumber}
              onChangeText={handleCardNumberChange}
              keyboardType="numeric"
              maxLength={19}
              returnKeyType="done"
              autoComplete="cc-number"
            />
          </View>
          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>Cardholder Name</Text>
            <TextInput
              style={styles.cardInput}
              placeholder="CARDHOLDER NAME"
              placeholderTextColor="#999"
              value={cardName}
              onChangeText={handleNameChange}
              autoCapitalize="characters"
            />
          </View>
          <View style={styles.inputRowHalf}>
            <View style={styles.halfInput}>
              <Text style={styles.inputLabel}>Expiry Date</Text>
              <TextInput
                style={styles.cardInput}
                placeholder="MM/YY"
                placeholderTextColor="#999"
                value={expiry}
                onChangeText={handleExpiryChange}
                keyboardType="numeric"
                maxLength={5}
              />
            </View>
            <View style={styles.halfInput}>
              <Text style={styles.inputLabel}>CVV</Text>
              <TextInput
                style={styles.cardInput}
                placeholder="•••"
                placeholderTextColor="#999"
                value={cvv}
                onChangeText={setCvv}
                keyboardType="numeric"
                maxLength={3}
                secureTextEntry
              />
            </View>
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmitCard}
            >
              <LinearGradient
                colors={['#4E54C8', '#8F94FB']}
                style={styles.submitGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.submitText}>Save Card Details</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );

  // Update the renderSavedCards function
  const renderSavedCards = () => {
    const filteredCards = savedCards.filter(card => card.type === selectedMethod);
    return (
      <View style={styles.savedCardsContainer}>
        {filteredCards.length === 0 ? (
          renderNoSavedCards()
        ) : (
          <>
            <View style={styles.sectionHeader}>
              <View style={styles.headerLeft}>
                {renderBackButton(() => {
                  setShowSavedCards(false);
                  setSelectedMethod(null);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                })}
                <Text style={styles.mainHeaderTitle}>
                  {selectedMethod === 'debit' ? 'Debit Card' : 'Credit Card'}
                </Text>
              </View>
              <TouchableOpacity 
                style={styles.addNewCardButton}
                onPress={() => setShowCardForm(true)}
              >
                <LinearGradient
                  colors={['#4E54C8', '#8F94FB']}
                  style={styles.addNewCardGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Icon name="credit-card-plus" size={14} color="#FFF" />
                  <Text style={styles.addNewCardText}>Add Card</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.savedCardsList}>
              {filteredCards.map((card, index) => (
                <TouchableOpacity 
                  key={index}
                  style={styles.savedCardItem}
                  onPress={() => handleCardSelect(card, index)}
                  activeOpacity={0.7}
                >
                  <View style={styles.savedCardInfo}>
                    <View style={styles.cardIconContainer}>
                      <Icon 
                        name={card.type === 'debit' ? 'credit-card' : 'credit-card-outline'} 
                        size={24} 
                        color="#4E54C8"
                      />
                    </View>
                    <View style={styles.savedCardDetails}>
                      <Text style={styles.savedCardType}>
                        {card.type === 'debit' ? 'Debit Card' : 'Credit Card'}
                      </Text>
                      <Text style={styles.savedCardNumber}>
                        •••• •••• •••• {card.lastFour}
                      </Text>
                    </View>
                  </View>
                  <Icon name="chevron-right" size={22} color="#666" />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}
      </View>
    );
  };

  const renderUpiOptions = () => (
    <View style={styles.upiContainer}>
      <View style={styles.sectionHeader}>
        {renderBackButton(() => {
          setShowUpiOptions(false);
          setSelectedMethod(null);
        })}
        <Text style={styles.standardHeaderTitle}>UPI Payment</Text>
      </View>
      <ScrollView 
        style={styles.upiList}
        showsVerticalScrollIndicator={false}
      >
        {upiOptions.map((app) => (
          <TouchableOpacity
            key={app.id}
            style={styles.upiOption}
            onPress={() => handleUpiSelect(app)}
          >
            <Image 
              source={{ uri: app.logo }}
              style={styles.upiLogo}
              resizeMode="contain"
            />
            <Text style={styles.upiAppName}>{app.name}</Text>
            <Icon name="chevron-right" size={20} color="#666" />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderSelectedUpiBanner = () => {
    if (!selectedUpi || showUpiOptions) return null;
    return (
      <View style={styles.selectedCardBanner}>
        <View style={styles.selectedCardInfo}>
          <View style={styles.selectedUpiIconContainer}>
            <Image 
              source={{ uri: selectedUpi.logo }} 
              style={styles.selectedUpiIcon}
              resizeMode="contain"
            />
          </View>
          <View style={styles.selectedCardTextContainer}>
            <Text style={styles.selectedCardTitle}>
              {selectedUpi.name}
            </Text>
            <Text style={styles.selectedCardDetails}>
              Selected for payment
            </Text>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.changeCardButton}
          onPress={() => {
            setShowUpiOptions(true);
            setSelectedMethod('upi');
          }}
        >
          <Icon name="pencil" size={18} color="#22C55E" />
        </TouchableOpacity>
      </View>
    );
  };

  const showCouponSuccessPopup = () => {
    setShowCouponPopup(true);
    setAppliedCouponCode(couponCode);
    setIsCouponApplied(true); // Set coupon as applied
    
    Animated.sequence([
      Animated.spring(popupAnimation, {
        toValue: 1,
        useNativeDriver: true,
        friction: 8
      }),
      Animated.delay(2000),
      Animated.timing(popupAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true
      })
    ]).start(() => {
      setShowCouponPopup(false);
    });
  };

  // Update the renderCouponSection function
  const renderCouponSection = () => (
    <View style={styles.couponSection}>
      <View style={styles.couponBox}>
        <Icon 
          name={isCouponApplied ? "ticket-confirmation" : "ticket-percent-outline"}
          size={22} 
          color={isCouponApplied ? "#22C55E" : "#4E54C8"} 
          style={styles.couponIcon} 
        />
        <TextInput
          style={[
            styles.couponInput,
            isCouponApplied && styles.couponInputDisabled,
            { flex: isCouponApplied ? 0 : 1 } // Remove flex when applied
          ]}
          placeholder="Enter coupon code"
          placeholderTextColor="#999"
          value={couponCode}
          onChangeText={setCouponCode}
          autoCapitalize="characters"
          editable={!isCouponApplied}
        />
        {isCouponApplied ? (
          <View style={styles.appliedButton}>
            <Icon name="check-circle" size={16} color="#22C55E" />
            <Text style={styles.appliedButtonText}>Applied</Text>
          </View>
        ) : (
          <TouchableOpacity 
            style={[styles.applyButton, !couponCode && styles.applyButtonDisabled]}
            onPress={() => {
              if (couponCode) {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                showCouponSuccessPopup();
              }
            }}
            disabled={!couponCode}
          >
            <Text style={styles.applyButtonText}>Apply</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Coupon Success Popup */}
      {showCouponPopup && (
        <Animated.View 
          style={[
            styles.couponPopup,
            {
              transform: [
                { scale: popupAnimation },
                {
                  translateY: popupAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0]
                  })
                }
              ],
              opacity: popupAnimation
            }
          ]}
        >
          <Icon name="check-circle" size={20} color="#22C55E" />
          <Text style={styles.couponPopupText}>
            Coupon {appliedCouponCode} applied successfully!
          </Text>
        </Animated.View>
      )}
    </View>
  );

  // Update the renderAmountSection function
  const renderAmountSection = () => (
    <View style={styles.amountSection}>
      <View style={styles.doctorHeader}>
        <Image 
          source={{ uri: params.doctorImage }} 
          style={styles.doctorImage}
        />
        <View style={styles.doctorTextInfo}>
          <Text style={styles.doctorName}>{params.doctorName}</Text>
          <Text style={styles.doctorSpecialty}>{params.specialty}</Text>
          <Text style={styles.hospitalName}>{params.hospitalName}</Text>
        </View>
      </View>

      {/* Add Token Details */}
      <View style={styles.tokenDetails}>
        <Text style={styles.tokenTitle}>Token Details</Text>
        <View style={styles.tokenInfo}>
          <View style={styles.tokenRow}>
            <Text style={styles.tokenLabel}>Token Number</Text>
            <Text style={styles.tokenValue}>#{params.tokenNumber}</Text>
          </View>
          <View style={styles.tokenRow}>
            <Text style={styles.tokenLabel}>Appointment Date</Text>
            <Text style={styles.tokenValue}>{params.tokenDate}</Text>
          </View>
          <View style={styles.tokenRow}>
            <Text style={styles.tokenLabel}>Expected Time</Text>
            <Text style={styles.tokenValue}>{params.tokenTime}</Text>
          </View>
        </View>
      </View>

      <Text style={styles.amountTitle}>Consultation Fee</Text>
      <Text style={styles.amount}>₹{amount}</Text>
      <View style={styles.breakdown}>
        <View style={styles.breakdownRow}>
          <Text style={styles.breakdownLabel}>Consultation Fee</Text>
          <Text style={styles.breakdownValue}>₹{amount}</Text>
        </View>
        <View style={styles.breakdownRow}>
          <Text style={styles.breakdownLabel}>Platform Fee</Text>
          <Text style={styles.breakdownValue}>₹1,000</Text>
        </View>
      </View>
    </View>
  );

  const renderContent = () => {
    if (showCardForm) {
      return <View style={styles.formSection}>{renderCardForm()}</View>;
    }
    if (showSavedCards) {
      return <View style={styles.cardsSection}>{renderSavedCards()}</View>;
    }
    if (showUpiOptions) {
      return <View style={styles.upiSection}>{renderUpiOptions()}</View>;
    }
    return (
      <View style={styles.methodsWrapper}>
        {selectedCard && renderSelectedCardBanner()}
        {!selectedCard && selectedUpi && renderSelectedUpiBanner()}
        {renderPaymentMethods()}
      </View>
    );
  };

  // Fix the main return statement for scrolling
  return (
    <SafeAreaView style={[styles.container]}>
      <StatusBar
        backgroundColor="#4E54C8"
        barStyle="light-content"
        translucent={true}
      />
      <LinearGradient 
        colors={['#4E54C8', '#8F94FB']} 
        style={[styles.gradient]}
      >
        <View style={styles.header}>
          {renderMainBackButton(() => router.back())}
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Payment</Text>
            <Text style={styles.headerSubtitle}>Choose your method</Text>
          </View>
        </View>
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.card}>
            {renderAmountSection()}
            {renderCouponSection()}
            {renderContent()}
          </View>
        </ScrollView>
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
    paddingTop: (StatusBar.currentHeight || 0) - 12, // Reduced padding to move content up
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Keep original value
    paddingTop: 20,
    paddingBottom: 16,
    paddingHorizontal: 16,
    height: 76,
    marginTop: 22,
  },
  headerTitleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    position: 'absolute', // Keep original positioning
    left: 0,
    right: 0,
    top: -2,
  },
  headerTitle: {
    fontFamily: 'InterBold',
    fontSize: 34, // Increased font size
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 1, // Reduced from 6 to 3
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  headerSubtitle: {
    fontFamily: 'InterRegular',
    fontSize: 14, // Slightly increased
    color: 'rgba(255, 255, 255, 0.85)', // Made more visible
    letterSpacing: 0.3,
  },
  headerRightSpace: {
    width: 32, // Same as back button width
  },
  card: {
    flex: 1,
    backgroundColor: '#FFF',
    marginHorizontal: Platform.OS === 'android' ? 12 : 16,
    marginTop: 10, // Adjusted margin to compensate for header
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Platform.OS === 'android' ? 16 : 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    marginBottom: 0,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  amountSection: {
    alignItems: 'center',
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  amountTitle: {
    fontFamily: 'InterMedium',
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  amount: {
    fontFamily: 'InterBold',
    fontSize: 32,
    fontWeight: '700',
    color: '#000',
    marginBottom: 16,
  },
  breakdown: {
    width: '100%',
    paddingHorizontal: 20,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  breakdownLabel: {
    fontFamily: 'InterRegular',
    color: '#666',
    fontSize: 14,
  },
  breakdownValue: {
    fontFamily: 'InterMedium',
    color: '#000',
    fontSize: 14,
    fontWeight: '500',
  },
  couponSection: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    width: '100%',
  },
  couponBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: 6,
    marginHorizontal: 20,
    height: 52, // Slightly increased height
    alignItems: 'center', // Centers items vertically
  },
  couponIcon: {
    marginHorizontal: 6,
    fontSize: 18,
  },
  couponInput: {
    flex: 1,
    fontFamily: 'InterRegular',
    fontSize: 13,
    color: '#000',
    paddingVertical: 8, // Increased padding
    paddingHorizontal: 8,
    height: '100%',
  },
  applyButton: {
    backgroundColor: '#4E54C8',
    borderRadius: 8,
    paddingHorizontal: 16, // Increased padding
    marginLeft: 8,
    height: 32, // Increased height
    justifyContent: 'center', // Added alignment
    alignItems: 'center', // Added alignment
  },
  applyButtonText: {
    fontFamily: 'InterSemiBold',
    color: '#FFF',
    fontSize: 13, // Increased font size
    textAlign: 'center', // Added text alignment
    paddingVertical: 2, // Added padding
  },
  sectionTitle: {
    fontFamily: 'InterBold',
    fontSize: Platform.OS === 'android' ? 16 : 16,
    color: '#000',
    marginTop: 4, // Reduced top margin
    marginBottom: 8, // Reduced bottom margin
    marginLeft: Platform.OS === 'android' ? 16 : 16,
    letterSpacing: 0.3,
  },
  methodsSection: {
    flex: 1,
    paddingTop: 0, // Reduced top padding
  },
  methodsContainer: {
    paddingHorizontal: 16,
    marginTop: 4, // Added small top margin
    marginBottom: 2.5,
  },
  payButtonWrapper: {
    paddingHorizontal: 16,
    marginTop: 'auto', // Push button to bottom of available space
    marginBottom: 20,
    paddingVertical: 8, // Added vertical padding
  },
  methodCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: Platform.OS === 'android' ? 10 : 10,
    marginBottom: 10, // Reduced margin
    borderWidth: 1,
    borderColor: '#E0E0E0',
    height: 60, // Reduced height
  },
  methodMain: {
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
  },
  methodIcon: {
    width: 32, // Slightly smaller
    height: 32, // Slightly smaller
    marginRight: 12,
    marginLeft: 8,
    resizeMode: 'contain',
  },
  methodTitle: {
    fontFamily: 'InterSemiBold',
    fontSize: 15,
    color: '#000',
  },
  methodsWrapper: {
    flex: 1,
  },
  inputRow: {
    marginBottom: Platform.OS === 'android' ? 20 : 12,
  },
  inputRowHalf: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  halfInput: {
    width: '47%',
  },
  inputLabel: {
    fontFamily: 'InterMedium',
    fontSize: Platform.OS === 'android' ? 14 : 12,
    color: '#666',
    marginBottom: Platform.OS === 'android' ? 8 : 6,
  },
  cardInput: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: Platform.OS === 'android' ? 12 : 10,
    fontFamily: 'InterRegular',
    fontSize: Platform.OS === 'android' ? 15 : 14,
    color: '#000',
    height: Platform.OS === 'android' ? 50 : 44,
  },
  cardFormContainer: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  cardFormScroll: {
    flex: 1,
  },
  cardFormScrollContent: {
    flexGrow: 1,
    paddingBottom: Platform.OS === 'android' ? 40 : 200,
  },
  cardForm: {
    padding: 16,
    backgroundColor: '#FFF',
  },
  cardFormAndroid: {
    paddingHorizontal: 12,
  },
  buttonContainer: {
    width: '100%',
  },
  submitButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#4E54C8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  submitGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  submitText: {
    fontFamily: 'InterSemiBold',
    fontSize: 16,
    color: '#FFF',
    letterSpacing: 0.5,
  },
  selectedCardBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10, // Reduced bottom margin
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: '#22C55E',
    height: 56,
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedCardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  selectedCardIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  selectedCardTextContainer: {
    flex: 1,
  },
  selectedCardTitle: {
    fontFamily: 'InterSemiBold',
    fontSize: 13,
    color: '#22C55E',
    marginBottom: 2,
  },
  selectedCardDetails: {
    fontFamily: 'InterMedium',
    fontSize: 12,
    color: '#4B5563',
    lineHeight: 16,
  },
  changeCardButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DCFCE7',
    width: 32,
    height: 32,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#22C55E',
  },
  savedCardsContainer: {
    flex: 1,
    paddingTop: 8,
    marginHorizontal: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#FFF',
    marginBottom: 27, // Reduced margin
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  standardHeaderTitle: {
    fontFamily: 'InterBold',
    fontSize: 16,
    color: '#1F2937',
    marginLeft: 1, // Reduced from 12 to 4
  },
  mainHeaderTitle: {
    fontFamily: 'InterBold',
    fontSize: 17,
    color: '#1F2937',
    marginLeft: 1,
  },
  savedCardsList: {
    paddingHorizontal: 16,
  },
  savedCardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    padding: 12,
    marginBottom: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    paddingRight: 16, // Add padding for the icons
  },
  savedCardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8, // Add margin to separate from the right icon
  },
  cardIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  savedCardDetails: {
    flex: 1,
  },
  savedCardType: {
    fontFamily: 'InterSemiBold',
    fontSize: 13,
    color: '#1F2937',
    marginBottom: 2,
  },
  savedCardNumber: {
    fontFamily: 'InterMedium',
    fontSize: 11,
    color: '#6B7280',
    letterSpacing: 0.3,
  },
  selectedIndicator: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 24, // Fixed width for consistency
  },
  addNewCardButton: {
    overflow: 'hidden',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#4E54C8',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
  addNewCardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    minWidth: 64,
  },
  addNewCardText: {
    fontFamily: 'InterSemiBold',
    fontSize: 10,
    color: '#FFF',
    marginLeft: 3,
  },
  noCardsContainer: {
    flex: 1,
  },
  noCardsContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 0, // Removed top padding
    marginTop: -40, // Added negative margin to move up
  },
  noCardsIcon: {
    marginBottom: 12, // Reduced margin
    opacity: 0.9,
  },
  noCardsTitle: {
    fontFamily: 'InterSemiBold',
    fontSize: 18,
    color: '#333',
    marginBottom: 6, // Reduced margin
  },
  noCardsText: {
    fontFamily: 'InterRegular',
    fontSize: 14,
    color: '#666',
    marginBottom: 20, // Reduced margin
    textAlign: 'center',
  },
  addFirstCardButton: {
    width: 'auto',
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#4E54C8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
    minWidth: 160,
  },
  addFirstCardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  addFirstCardText: {
    fontFamily: 'InterSemiBold',
    fontSize: 14,
    color: '#FFF',
    marginLeft: 8,
  },
  formSection: {
    flex: 1,
  },
  cardsSection: {
    flex: 1,
  },
  methodsWrapper: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 8 : 0,
  },
  mainPayButton: {
    width: '100%',
    borderRadius: 25, // Increased border radius for more curve
    overflow: 'hidden',
    shadowColor: '#4E54C8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  mainPayButtonProcessing: {
    opacity: 0.8,
  },
  mainPayGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 25,
    minHeight: 56,
  },
  mainPayText: {
    fontFamily: 'InterBold',
    fontSize: 18,
    color: '#FFF',
    marginLeft: 8,
    letterSpacing: 0.5,
  },
  upiContainer: {
    flex: 1,
    paddingTop: 4, // Reduced padding
  },
  upiList: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 4, // Reduced padding
    paddingBottom: Platform.OS === 'android' ? 16 : 20, // Added bottom padding
  },
  upiOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    height: 64, // Increased height slightly
  },
  upiLogo: {
    width: 50, // Made logo smaller and square
    height: 50,
    marginRight: 16,
    resizeMode: 'contain',
    borderRadius: 8, // Added border radius for app-like icons
  },
  upiAppName: {
    fontFamily: 'InterMedium',
    fontSize: 14,
    color: '#1F2937',
    flex: 1,
  },
  upiSection: {
    flex: 1,
  },
  simpleBackButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    shadowColor: '#FFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButtonInner: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  successIcon: {
    position: 'absolute',
    alignSelf: 'center',
  },
  standardBackButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: 12,
    shadowColor: '#4E54C8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  standardBackGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedUpiIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    overflow: 'hidden',
  },
  selectedUpiIcon: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  selectedCardIcon: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  shimmerOverlay: {
    position: 'absolute',
    top: -20,
    left: -100,
    right: -100,
    bottom: -20,
    borderRadius: 25,
  },
  shimmerGradient: {
    flex: 1,
    width: '200%',
    height: '100%',
  },
  buttonAnimationContainer: {
    width: '100%',
    borderRadius: 25,
    overflow: 'hidden',
  },
  rippleEffect: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    width: '200%',
    height: '200%',
    top: '-50%',
    left: '-50%',
    borderRadius: 999,
    zIndex: 1, // Add this to keep ripple below content
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 24,
  },
  loadingIconContainer: {
    position: 'absolute',
  },
  buttonContentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyButtonDisabled: {
    backgroundColor: '#A5A6F6',
  },
  couponPopup: {
    position: 'absolute',
    bottom: -45,
    left: 20,
    right: 20,
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#22C55E20',
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    zIndex: 1000,
  },
  couponPopupText: {
    fontFamily: 'InterMedium',
    fontSize: 14,
    color: '#22C55E',
    marginLeft: 8,
  },
  couponInputDisabled: {
    color: '#22C55E',
    fontFamily: 'InterBold',
    fontSize: 15,
    flex: 1,
    textAlign: 'left',
    paddingHorizontal: 8,
  },
  appliedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
    paddingHorizontal: 16,
    marginLeft: 'auto', // This will push it to the right
    height: 36,
    borderWidth: 1,
    borderColor: '#22C55E20',
  },
  appliedButtonText: {
    fontFamily: 'InterBold', // Keep InterBold
    fontSize: 15, // Increased from 13 to 15 for more prominence
    color: '#22C55E',
    marginLeft: 4,
    fontWeight: '700', // Added explicit font weight
  },
  doctorName: {
    fontFamily: 'InterMedium',
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  doctorImageContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  doctorImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#4C35E3',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  doctorSpecialty: {
    fontFamily: 'InterMedium',
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  doctorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  doctorImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#4C35E3',
  },
  doctorTextInfo: {
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
  scrollView: {
    flex: 1,
  },
  tokenDetails: {
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    marginBottom: 20,
    width: '100%',
  },
  tokenTitle: {
    fontSize: 16,
    fontFamily: 'InterSemiBold',
    color: '#1F2937',
    marginBottom: 12,
  },
  tokenInfo: {
    gap: 8,
  },
  tokenRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tokenLabel: {
    fontSize: 14,
    fontFamily: 'InterRegular',
    color: '#6B7280',
  },
  tokenValue: {
    fontSize: 14,
    fontFamily: 'InterMedium',
    color: '#1F2937',
  },
});