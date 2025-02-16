import React, { useState, useRef, forwardRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform, 
  Modal, 
  Animated, 
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  Keyboard,
  Easing,
  Image
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import Checkbox from 'expo-checkbox';
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

// Initialize Supabase client
const supabaseUrl = Constants?.expoConfig?.extra?.SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = Constants?.expoConfig?.extra?.SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Ensure we have the required configuration
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase configuration. Please check your environment variables.');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const FloatingLabelInput = forwardRef(({ label, value, onChangeText, secureTextEntry, style, keyboardType, ...props }, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const animatedValue = useRef(new Animated.Value(value ? 1 : 0)).current;
  const isPhoneInput = keyboardType === 'phone-pad';
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  React.useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: (isFocused || value) ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();

    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => setKeyboardVisible(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => setKeyboardVisible(false)
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, [isFocused, value]);

  const labelStyle = {
    position: 'absolute',
    left: 16,
    top: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [16, -8],
    }),
    fontSize: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 12],
    }),
    color: '#666',
    backgroundColor: '#fff',
    paddingHorizontal: 4,
    zIndex: 1,
  };

  const prefixStyle = {
    opacity: animatedValue,
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <View style={[styles.inputContainer, style]}>
      <Animated.Text style={labelStyle}>{label}</Animated.Text>
      <View style={styles.inputWrapper}>
        {isPhoneInput && (
          <Animated.Text style={[styles.phonePrefix, prefixStyle]}>+91 </Animated.Text>
        )}
        <TextInput
          ref={ref}
          style={[
            styles.input,
            { paddingTop: 16, paddingRight: secureTextEntry ? 50 : 16, paddingLeft: isPhoneInput ? 48 : 16 }
          ]}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          keyboardType={keyboardType}
          {...props}
        />
        {secureTextEntry && (
          <TouchableOpacity style={styles.eyeIcon} onPress={togglePasswordVisibility}>
            <MaterialIcons
              name={isPasswordVisible ? 'visibility' : 'visibility-off'}
              size={24}
              color="#666"
            />
          </TouchableOpacity>
        )}
        {(label === "Email" || label === "Phone Number") && (
          <MaterialIcons
            name={label === "Email" ? "email" : "phone"}
            size={24}
            color="#666"
            style={styles.inputIcon}
          />
        )}
      </View>
    </View>
  );
});

export default function Login() {
  const router = useRouter();
  const { form } = useLocalSearchParams();
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isSignIn, setIsSignIn] = useState(form === 'signin');
  const [isSignUp, setIsSignUp] = useState(form === 'signup');
  const [isPhoneLogin, setIsPhoneLogin] = useState(true);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showSignUpSuccess, setShowSignUpSuccess] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '']);
  const otpRefs = useRef([...Array(4)].map(() => React.createRef()));
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const signInButtonAnimation = useRef(new Animated.Value(0)).current;
  const fadeScaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const translateYAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.out(Easing.exp),
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.out(Easing.back(1.5)),
      }),
      Animated.timing(translateYAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.out(Easing.exp),
      }),
    ]).start();
  }, []);

  useEffect(() => {
    // Handle form switching
    if (form === 'signin') {
      setIsSignIn(true);
      setIsSignUp(false);
    } else if (form === 'signup') {
      setIsSignIn(false);
      setIsSignUp(true);
    }
  }, [form]);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(null);
    }, 2000);
  };

  const handleOtpChange = (text, index) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < 3) {
      otpRefs.current[index + 1].current.focus();
    }
  };

  const animateSignInButton = () => {
    setLoading(true);
    Animated.timing(signInButtonAnimation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: false,
      easing: Easing.inOut(Easing.ease)
    }).start();
  };

  const resetSignInButton = () => {
    Animated.timing(signInButtonAnimation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
      easing: Easing.inOut(Easing.ease)
    }).start(() => {
      setLoading(false);
    });
  };

  const handleSignIn = async () => {
    if (isPhoneLogin && !formData.phone) {
      showToast('error', 'Please enter your phone number');
      return;
    }
    if (!isPhoneLogin && !formData.email) {
      showToast('error', 'Please enter your email');
      return;
    }
    if (!formData.password) {
      showToast('error', 'Please enter your password');
      return;
    }

    try {
      setLoading(true);
      
      // Use Supabase's sign-in method with correct parameter handling
      const signInCredentials = isPhoneLogin 
        ? { phone: formData.phone, password: formData.password }
        : { email: formData.email, password: formData.password };

      const { data, error } = await supabase.auth.signInWithPassword(signInCredentials);

      if (error) {
        console.error('Supabase Sign In Error:', error);
        setLoading(false);
        showToast('error', error.message || 'Invalid login credentials');
        return;
      }

      // Log user details for debugging
      console.log('Signed In User:', data.user);

      showToast('success', 'Sign in successful');
      
      // Wait for toast to be visible before navigation
      setTimeout(() => {
        setLoading(false);
        router.replace('/(tabs)/home');
      }, 500);
      
    } catch (error) {
      console.error('Sign In Catch Error:', error);
      setLoading(false);
      showToast('error', 'Sign in failed: ' + error.message);
    }
  };

  const handleSignUp = async () => {
    if (!formData.name) {
      showToast('error', 'Please enter your name');
      return;
    }

    if (isPhoneLogin && !formData.phone) {
      showToast('error', 'Please enter your phone number');
      return;
    }

    if (!isPhoneLogin && !formData.email) {
      showToast('error', 'Please enter your email');
      return;
    }

    if (!formData.password) {
      showToast('error', 'Please enter a password');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      showToast('error', 'Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      
      // Use Supabase to sign up with correct parameter handling
      const signUpCredentials = isPhoneLogin 
        ? { phone: formData.phone, password: formData.password }
        : { email: formData.email, password: formData.password };

      const { data, error } = await supabase.auth.signUp(signUpCredentials);

      if (error) {
        console.error('Supabase Sign Up Error:', error);
        showToast('error', error.message || 'Sign up failed');
        return;
      }

      // Log sign-up details for debugging
      console.log('Signed Up User:', data.user);

      // Reset form and switch to sign-in
      setLoading(false);
      setIsSignUp(false);
      setIsSignIn(true);
      
      showToast('success', 'Sign up successful! Please sign in.');
      
    } catch (error) {
      console.error('Sign Up Catch Error:', error);
      setLoading(false);
      showToast('error', 'Sign up failed: ' + error.message);
    }
  };

  const handleForgotPassword = () => {
    setIsForgotPassword(true);
    setIsSignIn(false);
    setIsSignUp(false);
    setFormData({
      ...formData,
      phone: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
  };

  const handleForgotPasswordSubmit = () => {
    if (!formData.phone && !formData.email) {
      showToast('error', 'Please enter phone number or email');
      return;
    }
    showToast('success', 'OTP sent successfully');
    setShowOtpInput(true);
  };

  const verifyForgotPasswordOtp = () => {
    const enteredOtp = otp.join('');
    if (enteredOtp.length !== 4) {
      showToast('error', 'Please enter complete OTP');
      return;
    }
    setShowOtpInput(false);
    setShowNewPassword(true);
  };

  const handleResetPassword = () => {
    if (!formData.newPassword || !formData.confirmPassword) {
      showToast('error', 'Please enter both passwords');
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      showToast('error', 'Passwords do not match');
      return;
    }
    showToast('success', 'Password reset successful');
    setIsForgotPassword(false);
    setIsSignIn(true);
    setShowNewPassword(false);
    setFormData({ ...formData, newPassword: '', confirmPassword: '' });
  };

  const renderOtpInputs = () => (
    <View style={styles.otpContainer}>
      {otp.map((digit, index) => (
        <TextInput
          key={index}
          ref={otpRefs.current[index]}
          style={styles.otpInput}
          maxLength={1}
          keyboardType="number-pad"
          value={digit}
          onChangeText={(text) => handleOtpChange(text, index)}
          onKeyPress={({ nativeEvent }) => {
            if (nativeEvent.key === 'Backspace' && !digit && index > 0) {
              otpRefs.current[index - 1].current.focus();
            }
          }}
        />
      ))}
    </View>
  );

  const renderToggleButtons = () => (
    <View style={styles.toggleContainer}>
      <TouchableOpacity 
        style={[
          styles.toggleButton, 
          isPhoneLogin && styles.activeToggle
        ]} 
        onPress={() => setIsPhoneLogin(true)}
      >
        <MaterialIcons 
          name="phone" 
          size={20} 
          color={isPhoneLogin ? '#000' : '#666'} 
        />
        <Text style={[
          styles.toggleText, 
          isPhoneLogin && { color: '#000', fontWeight: '600' }
        ]}>
          Phone
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[
          styles.toggleButton, 
          !isPhoneLogin && styles.activeToggle
        ]} 
        onPress={() => setIsPhoneLogin(false)}
      >
        <MaterialIcons 
          name="email" 
          size={20} 
          color={!isPhoneLogin ? '#000' : '#666'} 
        />
        <Text style={[
          styles.toggleText, 
          !isPhoneLogin && { color: '#000', fontWeight: '600' }
        ]}>
          Email
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderSignInForm = () => (
    <>
      {renderToggleButtons()}

      {isPhoneLogin ? (
        <FloatingLabelInput
          label="Phone Number"
          value={formData.phone}
          onChangeText={(text) => setFormData({ ...formData, phone: text })}
          keyboardType="phone-pad"
        />
      ) : (
        <FloatingLabelInput
          label="Email"
          value={formData.email}
          onChangeText={(text) => setFormData({ ...formData, email: text })}
          keyboardType="email-address"
        />
      )}

      <FloatingLabelInput
        label="Password"
        secureTextEntry
        value={formData.password}
        onChangeText={(text) => setFormData({ ...formData, password: text })}
      />

      <TouchableOpacity
        style={styles.forgotPasswordButton}
        onPress={handleForgotPassword}
      >
        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[
          styles.signInButton,
          loading && styles.signInButtonLoading
        ]} 
        onPress={handleSignIn}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.signInButtonText}>Sign In</Text>
        )}
      </TouchableOpacity>

      <View style={styles.signUpContainer}>
        <Text style={styles.signUpText}>Don't have an account? </Text>
        <TouchableOpacity onPress={() => router.push('/auth/login?form=signup')}>
          <Text style={styles.signUpLink}>Sign up</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  const renderSignUpForm = () => (
    <>
      {renderToggleButtons()}

      <FloatingLabelInput
        label="Full Name"
        value={formData.name}
        onChangeText={(text) => setFormData({ ...formData, name: text })}
      />

      {isPhoneLogin ? (
        <FloatingLabelInput
          label="Phone Number"
          value={formData.phone}
          onChangeText={(text) => setFormData({ ...formData, phone: text })}
          keyboardType="phone-pad"
        />
      ) : (
        <FloatingLabelInput
          label="Email"
          value={formData.email}
          onChangeText={(text) => setFormData({ ...formData, email: text })}
          keyboardType="email-address"
        />
      )}

      <FloatingLabelInput
        label="Password"
        secureTextEntry
        value={formData.password}
        onChangeText={(text) => setFormData({ ...formData, password: text })}
      />

      <FloatingLabelInput
        label="Confirm Password"
        secureTextEntry
        value={formData.confirmPassword}
        onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
      />

      <View style={styles.termsContainer}>
        <Checkbox
          value={acceptedTerms}
          onValueChange={setAcceptedTerms}
          color={acceptedTerms ? '#0066FF' : undefined}
        />
        <Text style={styles.termsText}>
          I agree to the{' '}
          <Text style={styles.termsLink} onPress={() => setShowTermsModal(true)}>
            Terms and Conditions
          </Text>
        </Text>
      </View>

      <TouchableOpacity 
        style={[styles.signInButton, !acceptedTerms && styles.disabledButton]} 
        onPress={handleSignUp}
        disabled={!acceptedTerms}
      >
        <Text style={styles.signInButtonText}>Sign Up</Text>
      </TouchableOpacity>

      <View style={styles.signUpContainer}>
        <Text style={styles.signUpText}>Already have an account? </Text>
        <TouchableOpacity onPress={() => router.push('/auth/login?form=signin')}>
          <Text style={styles.signUpLink}>Sign in</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  const renderForgotPasswordForm = () => (
    <>
      {!showOtpInput && !showNewPassword && (
        <>
          {renderToggleButtons()}

          {isPhoneLogin ? (
            <FloatingLabelInput
              label="Phone Number"
              value={formData.phone}
              onChangeText={(text) => setFormData({ ...formData, phone: text })}
              keyboardType="phone-pad"
            />
          ) : (
            <FloatingLabelInput
              label="Email"
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              keyboardType="email-address"
            />
          )}
          <TouchableOpacity style={styles.signInButton} onPress={handleForgotPasswordSubmit}>
            <Text style={styles.signInButtonText}>Send OTP</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.backToSignIn} 
            onPress={() => {
              setIsForgotPassword(false);
              setIsSignIn(true);
            }}
          >
            <Text style={styles.backToSignInText}>Back to Sign In</Text>
          </TouchableOpacity>
        </>
      )}

      {showOtpInput && !showNewPassword && (
        <>
          <Text style={styles.otpTitle}>Enter OTP</Text>
          {renderOtpInputs()}
          <TouchableOpacity style={styles.signInButton} onPress={verifyForgotPasswordOtp}>
            <Text style={styles.signInButtonText}>Verify OTP</Text>
          </TouchableOpacity>
        </>
      )}

      {showNewPassword && (
        <>
          <FloatingLabelInput
            label="New Password"
            secureTextEntry
            value={formData.newPassword}
            onChangeText={(text) => setFormData({ ...formData, newPassword: text })}
          />
          <FloatingLabelInput
            label="Confirm Password"
            secureTextEntry
            value={formData.confirmPassword}
            onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
          />

          <TouchableOpacity style={styles.signInButton} onPress={handleResetPassword}>
            <Text style={styles.signInButtonText}>Reset Password</Text>
          </TouchableOpacity>
        </>
      )}
    </>
  );

  const CustomToast = ({ type, message }) => {
    const toastStyles = {
      backgroundColor: type === 'success' ? 'rgba(76, 175, 80, 0.9)' : 'rgba(244, 67, 54, 0.9)',
      borderRadius: 30,
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
      paddingHorizontal: 15,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 5,
    };
    const textStyles = {
      color: '#fff',
      fontSize: 14,
    };
    return (
      <Animated.View style={[styles.toastContainer, toastStyles]}>
        <MaterialIcons
          name={type === 'success' ? 'check-circle' : 'error'}
          size={20}
          color="#fff"
          style={{ marginRight: 8 }}
        />
        <Text style={[styles.toastMessage, textStyles]}>{message}</Text>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <Image 
              source={require('../../assets/main-logos/icon.png')}
              style={styles.icon}
              resizeMode="contain"
            />
            <Text style={styles.title}>
              {isForgotPassword ? 'Reset Password' : isSignIn ? 'Welcome Back!' : 'Create Account'}
            </Text>
            <Text style={styles.subtitle}>
              {isForgotPassword ? 'Enter your email to reset password' : isSignIn ? 'Sign in to continue' : 'Sign up to get started'}
            </Text>

            <View style={styles.formContainer}>
              {isSignIn && !isForgotPassword && renderSignInForm()}
              {isSignUp && !isForgotPassword && renderSignUpForm()}
              {isForgotPassword && renderForgotPasswordForm()}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {toast && (
        <CustomToast
          type={toast.type}
          message={toast.message}
        />
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={showTermsModal}
        onRequestClose={() => setShowTermsModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>Terms and Conditions</Text>
              <Text style={styles.modalText}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nunc id aliquam tincidunt, nisl nunc tincidunt nunc, vitae aliquam nunc nunc vitae nunc. Sed euismod, nunc id aliquam tincidunt, nisl nunc tincidunt nunc, vitae aliquam nunc nunc vitae nunc.
              </Text>
            </ScrollView>
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => {
                  setAcceptedTerms(true);
                  setShowTermsModal(false);
                }}
              >
                <Text style={styles.modalButtonText}>Accept</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setShowTermsModal(false)}
              >
                <Text style={styles.modalButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  icon: {
    width: 100,
    height: 100,
    alignSelf: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#000',
    textAlign: 'center',
    marginBottom: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#F0EFF4',
    borderRadius: 22,
    padding: 4,
    marginBottom: 32,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 18,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  activeToggle: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  toggleText: {
    color: '#666',
    fontSize: 14,
    marginLeft: 8,
  },
  formContainer: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 16,
    position: 'relative',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 30,
    fontSize: 16,
    borderWidth: 1.3,
    borderColor: '#7B7B7B',
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    top: 16,
  },
  inputIcon: {
    position: 'absolute',
    right: 16,
  },
  phonePrefix: {
    position: 'absolute',
    left: 16,
    top: 18,
    fontSize: 16,
    color: '#000',
    zIndex: 1,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  otpInput: {
    width: 60,
    height: 60,
    borderWidth: 1.3,
    borderColor: '#7B7B7B',
    borderRadius: 15,
    textAlign: 'center',
    fontSize: 24,
    color: '#000',
    fontWeight: '600',
  },
  forgotPasswordButton: {
    alignItems: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#3B39E4',
    fontSize: 16,
  },
  signInButtonContainer: {
    alignSelf: 'center',
    marginBottom: 24,
    overflow: 'hidden',
  },
  signInButton: {
    backgroundColor: '#0066FF',
    borderRadius: 30,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    alignSelf: 'center',
    width: '100%',
  },
  signInButtonLoading: {
    width: 56,
    borderRadius: 28,
    transform: [{ scale: 1 }],
  },
  signInButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  termsText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#000',
  },
  termsLink: {
    color: '#3B39E4',
    fontSize: 14,
  },
  disabledButton: {
    backgroundColor: '#A0A0A0',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 16,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    backgroundColor: '#3B39E4',
    padding: 12,
    borderRadius: 25,
    flex: 1,
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalCancelButton: {
    backgroundColor: '#E5E5E5',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  backToSignIn: {
    marginTop: 16,
    alignItems: 'center',
  },
  backToSignInText: {
    color: '#3B39E4',
    fontSize: 16,
    fontWeight: '600',
  },
  registerButton: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    marginLeft:1,
  },
  registerButtonText: {
    color: '#3B39E4',
    fontSize: 16,
  },
  toastContainer: {
    position: 'absolute',
    top: 40,
    left: 20,
    right: 20,
  },
  toastMessage: {
    fontSize: 14,
  },
  otpTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
    marginBottom: 24,
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  signUpText: {
    fontSize: 14,
    color: '#000',
  },
  signUpLink: {
    fontSize: 14,
    color: '#0066FF',
    fontWeight: '600',
  },
  
});
