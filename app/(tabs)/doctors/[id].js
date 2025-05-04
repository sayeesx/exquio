"use client"

import { useState, useEffect, useCallback } from "react"
import { 
  StyleSheet, 
  Text, 
  View, 
  Image, 
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView, 
  StatusBar, 
  ActivityIndicator,
  Platform,
  RefreshControl,
  Alert
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import { LinearGradient } from 'expo-linear-gradient'
import { useLocalSearchParams } from 'expo-router'
import { supabase } from '../../../lib/supabase'
import { format, addMonths } from 'date-fns'
import { RealtimeChannel } from '@supabase/supabase-js'
import PatientDetailsForm from '../../../components/PatientDetailsForm'
import { useRouter } from "expo-router"
import AlertModal from '../../../components/AlertModal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LoadingAnimation } from '../../../components/LoadingAnimation';
import { secureLog } from '../../../utils/secureLogging';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function DoctorProfile() {
  const { id } = useLocalSearchParams()
  const navigation = useNavigation()
  const router = useRouter()
  const [doctor, setDoctor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentToken, setCurrentToken] = useState(null)
  const [myToken, setMyToken] = useState(null)
  const [tokenSubscription, setTokenSubscription] = useState(null)
  const [user, setUser] = useState(null)
  const [showPatientForm, setShowPatientForm] = useState(false)
  const [availableTokens, setAvailableTokens] = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  const [maxTokens] = useState(50) // Set maximum tokens per day
  const [isBooking, setIsBooking] = useState(false);
  const [activeTab, setActiveTab] = useState("Schedule");
  const [dataLoading, setDataLoading] = useState(true);
  const [alert, setAlert] = useState({
    visible: false,
    type: 'success',
    title: '',
    message: '',
    showCancel: false
  });
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [dateTokens, setDateTokens] = useState({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDateTokens, setSelectedDateTokens] = useState({ available: 0, total: 0 });

  const showAlert = (type, title, message, showCancel = false, onConfirm = null) => {
    setAlert({
      visible: true,
      type,
      title,
      message,
      showCancel,
      onConfirm: onConfirm || (() => setAlert(prev => ({ ...prev, visible: false })))
    });
  };

  // Add function to store user data
  const storeUserData = async (userData) => {
    try {
      if (userData) {
        await AsyncStorage.setItem('user', JSON.stringify(userData));
      } else {
        await AsyncStorage.removeItem('user');
      }
    } catch (error) {
      console.error('Error storing user data:', error);
    }
  };

  // Add auth session state
  const [session, setSession] = useState(null);

  // Update and combine auth initialization
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // First check AsyncStorage
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser && mounted) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        }

        // Then verify with Supabase
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (mounted) {
          if (session) {
            setSession(session);
            setUser(session.user);
            await AsyncStorage.setItem('user', JSON.stringify(session.user));
            await AsyncStorage.setItem('session', JSON.stringify(session));
          } else {
            // Clear stored data if no active session
            await AsyncStorage.removeItem('user');
            await AsyncStorage.removeItem('session');
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Clear stored data on error
        await AsyncStorage.removeItem('user');
        await AsyncStorage.removeItem('session');
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        secureLog('Auth event:', { event, session: newSession });
        if (mounted) {
          if (newSession) {
            setSession(newSession);
            setUser(newSession.user);
            await AsyncStorage.setItem('user', JSON.stringify(newSession.user));
            await AsyncStorage.setItem('session', JSON.stringify(newSession));
          } else {
            setSession(null);
            setUser(null);
            await AsyncStorage.removeItem('user');
            await AsyncStorage.removeItem('session');
          }
        }
      }
    );

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  // Combine all data fetching into one optimized function
  const fetchAllData = async () => {
    setDataLoading(true);
    try {
      // Fetch doctor and token data in parallel
      const [doctorResponse, tokensResponse, currentTokenResponse, myTokenResponse] = await Promise.all([
        supabase
          .from('doctors')
          .select(`
            id,
            name,
            image_url,
            qualification,
            experience_years,
            consultation_fee,
            available,
            available_tokens,
            max_tokens,
            specialties:specialty_id (name),
            hospitals:hospital_id (name)
          `)
          .eq('id', id)
          .single(),
        
        supabase
          .from('tokens')
          .select('id', { count: 'exact' })
          .eq('doctor_id', id)
          .eq('booking_date', format(new Date(), 'yyyy-MM-dd')),
        
        supabase
          .from('tokens')
          .select('*')
          .eq('doctor_id', id)
          .eq('booking_date', format(new Date(), 'yyyy-MM-dd'))
          .eq('status', 'in-progress')
          .single(),
        
        user ? supabase
          .from('tokens')
          .select('*')
          .eq('doctor_id', id)
          .eq('patient_id', user.id)
          .eq('booking_date', format(new Date(), 'yyyy-MM-dd'))
          .single() : null
      ]);

      // Handle doctor data
      if (doctorResponse.error) throw doctorResponse.error;
      setDoctor(doctorResponse.data);

      // Handle tokens count
      if (!tokensResponse.error) {
        const availableCount = doctorResponse.data.max_tokens - (tokensResponse.count || 0);
        setAvailableTokens(availableCount > 0 ? availableCount : 0);
      }

      // Handle current token
      if (!currentTokenResponse.error) {
        setCurrentToken(currentTokenResponse.data);
      }

      // Handle my token
      if (myTokenResponse && !myTokenResponse.error) {
        setMyToken(myTokenResponse.data);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      showAlert('error', 'Error', 'Unable to load doctor details. Please try again.');
    } finally {
      setDataLoading(false);
      setLoading(false);
    }
  };

  // Update useEffect to use combined fetch
  useEffect(() => {
    fetchAllData();
  }, [id, user]);

  // Add effect to fetch tokens when date changes
  useEffect(() => {
    const loadSelectedDateTokens = async () => {
      setDataLoading(true);
      try {
        const { data: bookedTokens, error: bookedError } = await supabase
          .from('tokens')
          .select('token_number', { count: 'exact' })
          .eq('doctor_id', id)
          .eq('booking_date', selectedDate)
          .eq('status', 'booked');

        if (bookedError) throw bookedError;

        setSelectedDateTokens({
          total: bookedTokens.length,
          available: maxTokens - bookedTokens.length
        });
      } catch (error) {
        console.error('Error fetching date tokens:', error);
        setSelectedDateTokens({ available: maxTokens, total: 0 });
      } finally {
        setDataLoading(false);
      }
    };

    loadSelectedDateTokens();
  }, [selectedDate, id, maxTokens]);

  // Update refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAllData();
    setRefreshing(false);
  }, [id, user]);

  const checkTokenAvailability = async () => {
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select('available_tokens, max_tokens, available')
        .eq('id', id)
        .single();

      if (error) throw error;

      return {
        hasTokens: data.available_tokens > 0 && data.available,
        availableTokens: data.available_tokens,
        maxTokens: data.max_tokens
      };
    } catch (error) {
      console.error('Error checking availability:', error);
      return { hasTokens: false, availableTokens: 0 };
    }
  };

  const handleBooking = async (patientDetails) => {
    setIsBooking(true);
    try {
      // Check token availability for selected date
      const { available } = await fetchDateTokens(selectedDate);
      
      if (available === 0) {
        showAlert(
          "warning",
          "No Tokens Available",
          "Sorry, no tokens are available for the selected date."
        );
        return;
      }

      // Save patient details first with explicit id from auth
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const { data: patientData, error: patientError } = await supabase
        .from('patients')
        .upsert([
          {
            id: user.id,           // Explicitly set the id to match auth.uid()
            name: patientDetails.name,
            age: patientDetails.age,
            gender: patientDetails.gender,
            phone: patientDetails.phone,
            created_at: new Date().toISOString(), // Add created_at
            updated_at: new Date().toISOString()  // Add updated_at
          }
        ], { 
          onConflict: 'id',
          returning: true         // Get the result back
        });

      if (patientError) {
        console.error('Patient save error:', patientError);
        throw patientError;
      }

      // Rest of your code...
      // ...existing token calculation and navigation code...

    } catch (error) {
      console.error('Booking error:', error);
      showAlert(
        "error",
        "Booking Failed", 
        error.message || "Unable to proceed with booking. Please try again."
      );
    } finally {
      setIsBooking(false);
    }
  };

  // Add helper function to calculate token time
  const getTokenTime = (tokenNumber) => {
    const startTime = new Date();
    startTime.setHours(9, 0, 0); // Assuming clinic starts at 9 AM
    const minutesPerToken = 15; // Average time per patient
    const additionalMinutes = (tokenNumber - 1) * minutesPerToken;
    startTime.setMinutes(startTime.getMinutes() + additionalMinutes);
    return format(startTime, 'hh:mm a');
  };

  // Update booking function with proper auth handling
  const bookToken = async (patientDetails) => {
    try {
      setIsBooking(true);

      // Check availability
      const { hasTokens } = await checkTokenAvailability();
      if (!hasTokens) {
        showAlert('warning', 'No Tokens', 'No tokens available for today');
        return;
      }

      // Add all required doctor details to navigation params
      router.push({
        pathname: '/(tabs)/checkout/payment', // Updated path
        params: {
          amount: doctor.consultation_fee,
          doctorId: id,
          doctorName: doctor.name,
          doctorImage: doctor.image_url,
          specialty: doctor.specialties?.name,
          hospitalName: doctor.hospitals?.name,
          patientDetails: JSON.stringify(patientDetails)
        }
      });

    } catch (error) {
      showAlert(
        'error',
        'Booking Failed',
        'Unable to complete booking. Please try again.'
      );
    } finally {
      setIsBooking(false);
    }
  };

  // Add this function to fetch tokens for a specific date
  const fetchDateTokens = async (date) => {
    try {
      // Get total booked tokens for the date
      const { data: bookedTokens, error: bookedError } = await supabase
        .from('tokens')
        .select('token_number', { count: 'exact' })
        .eq('doctor_id', id)
        .eq('booking_date', date)
        .eq('status', 'booked');

      if (bookedError) throw bookedError;

      // Get available tokens for the date
      const { data: availableTokens, error: availableError } = await supabase
        .from('tokens')
        .select('token_number', { count: 'exact' })
        .eq('doctor_id', id)
        .eq('booking_date', date)
        .eq('status', 'available');

      if (availableError) throw availableError;

      return {
        total: bookedTokens.length,
        available: maxTokens - bookedTokens.length
      };
    } catch (error) {
      console.error('Error fetching date tokens:', error);
      return { total: 0, available: maxTokens };
    }
  };

  // Add date picker handler
  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      setSelectedDate(formattedDate);
      setDataLoading(true); // Will trigger the above effect
    }
  };

  // Update loading state render
  if (loading || !doctor) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <LoadingAnimation message="Loading doctor details..." />
      </View>
    );
  }

  // Update TokenStatus component to show loading state
  const TokenStatus = () => {
    if (dataLoading) {
      return (
        <View style={styles.loadingTokenContainer}>
          <ActivityIndicator size="small" color="#4C35E3" />
          <Text style={styles.loadingText}>Loading availability...</Text>
        </View>
      );
    }

    if (!doctor.available || availableTokens === 0) {
      return (
        <View style={styles.unavailableContainer}>
          <Text style={styles.unavailableText}>
            This doctor is not available today
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.scheduleContainer}>
        <TouchableOpacity 
          style={styles.datePickerButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Ionicons name="calendar-outline" size={24} color="#4C35E3" />
          <Text style={styles.datePickerText}>
            {format(new Date(selectedDate), 'MMMM d, yyyy')}
          </Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={new Date(selectedDate)}
            mode="date"
            display="default"
            onChange={onDateChange}
            minimumDate={new Date()}
            maximumDate={addMonths(new Date(), 2)}
          />
        )}

        <View style={styles.selectedDateInfo}>
          {dataLoading ? (
            <ActivityIndicator size="small" color="#4C35E3" />
          ) : (
            <>
              <Text style={styles.availableTokensText}>
                Available Tokens: {selectedDateTokens.available}
              </Text>
              <View style={styles.tokenStatsContainer}>
                <Text style={styles.bookedTokensText}>
                  Total Booked: {selectedDateTokens.total}
                </Text>
                <Text style={styles.maxTokensText}>
                  Max Tokens: {maxTokens}
                </Text>
              </View>
              {selectedDateTokens.available === 0 && (
                <Text style={styles.noTokensWarning}>
                  No tokens available for this date
                </Text>
              )}
            </>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      <LinearGradient
        colors={["#4C35E3", "#4B47E5", "#5465FF"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.gradientHeader, { paddingTop: Platform.OS === 'ios' ? 60 : StatusBar.currentHeight + 10 }]}
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.push("/(tabs)/doctors")} // Updated path
        >
          <Ionicons name="chevron-back" size={28} color="#fff" />
        </TouchableOpacity>

        <View style={styles.profileSection}>
          <Image 
            source={{ uri: doctor.image_url || 'https://via.placeholder.com/100' }} 
            style={styles.doctorImage} 
          />
          <View style={styles.doctorInfo}>
            <Text style={styles.doctorName}>{doctor.name}</Text>
            <Text style={styles.qualification}>{doctor.qualification}</Text>
            <Text style={styles.specialization}>{doctor.specialties?.name}</Text>
            <Text style={styles.hospitalName}>{doctor.hospitals?.name}</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.contentContainer}>
        <ScrollView 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#4C35E3"
              colors={["#4C35E3"]}
            />
          }
        >
          <View style={styles.tabsContainer}>
            {["Schedule", "About"].map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[styles.tab, activeTab === tab && styles.activeTab]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.tabContent}>
            {activeTab === "Schedule" && <TokenStatus />}
            {activeTab === "About" && (
              <View style={styles.aboutContainer}>
                <Text style={styles.aboutText}>
                  {`Experience: ${doctor.experience_years} years`}
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </View>

      <View style={styles.footer}>
        <View style={styles.feeContainer}>
          <Text style={styles.feeAmount}>₹{doctor.consultation_fee}</Text>
          {doctor.available_tokens > 0 && (
            <Text style={styles.tokensLeft}>
              {doctor.available_tokens} tokens left
            </Text>
          )}
        </View>
        <TouchableOpacity 
          style={[
            styles.bookButton,
            (!doctor.available || doctor.available_tokens === 0) && styles.disabledButton
          ]}
          disabled={!doctor.available || doctor.available_tokens === 0 || isBooking}
          onPress={() => {
            setShowPatientForm(true);
            setIsBooking(false); // Reset booking state when opening form
          }}
        >
          <Text style={styles.bookButtonText}>
            {isBooking ? 'Booking...' : 
             !doctor.available ? 'Not Available' :
             doctor.available_tokens === 0 ? 'No Tokens Left' : 
             'Book Token'}
          </Text>
        </TouchableOpacity>
      </View>

      <PatientDetailsForm
        visible={showPatientForm}
        onClose={() => {
          setShowPatientForm(false);
          setIsBooking(false);
        }}
        onSubmit={handleBooking}
        doctorInfo={{
          id: doctor.id,
          name: doctor.name,
          consultationFee: doctor.consultation_fee?.toString(),
          image: doctor.image_url,
          specialty: doctor.specialties?.name,
          hospitalName: doctor.hospitals?.name,
          nextToken: (availableTokens > 0 ? maxTokens - availableTokens + 1 : 0).toString(),
          appointmentDate: format(new Date(), 'yyyy-MM-dd'),
          appointmentTime: getTokenTime(maxTokens - availableTokens + 1)
        }}
      />

      <AlertModal
        visible={alert.visible}
        type={alert.type}
        title={alert.title}
        message={alert.message}
        showCancel={alert.showCancel}
        onClose={() => setAlert(prev => ({ ...prev, visible: false }))}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  gradientHeader: {
    paddingTop: Platform.OS === "ios" ? 60 : StatusBar.currentHeight + 10,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight + 10,
    left: 16,
    padding: 8,
    zIndex: 1,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  doctorImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: '#fff',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  doctorInfo: {
    alignItems: 'center',
    gap: 4,
  },
  doctorName: {
    fontSize: 24,
    color: '#fff',
    fontFamily: 'Inter_600SemiBold',
  },
  qualification: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Inter_500Medium',
  },
  specialization: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter_500Medium',
  },
  hospitalName: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Inter_400Regular',
  },
  contentContainer: {
    flex: 1,
    marginTop: -20,
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  tabsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  activeTab: {
    backgroundColor: '#4C35E3',
  },
  tabText: {
    color: '#666',
    fontFamily: 'Inter_500Medium',
  },
  activeTabText: {
    color: '#fff',
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  feeAmount: {
    fontSize: 20,
    color: '#4C35E3',
    fontFamily: 'Inter_600SemiBold',
  },
  bookButton: {
    backgroundColor: '#4C35E3',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  bookButtonText: {
    color: '#fff',
    fontFamily: 'Inter_600SemiBold',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  noSlotsContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginVertical: 10,
  },
  noSlotsText: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'Inter_500Medium',
    textAlign: 'center',
  },
  aboutContainer: {
    padding: 8,
  },
  aboutText: {
    fontSize: 14,
    color: "#555",
    lineHeight: 22,
  },
  tokenContainer: {
    padding: 16,
    gap: 16,
  },
  currentTokenBox: {
    backgroundColor: '#4C35E3',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  currentTokenLabel: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  currentTokenNumber: {
    color: '#fff',
    fontSize: 32,
    fontFamily: 'Inter_700Bold',
  },
  myTokenBox: {
    backgroundColor: '#f0f4f8',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4C35E3',
  },
  myTokenLabel: {
    color: '#4C35E3',
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  myTokenNumber: {
    color: '#4C35E3',
    fontSize: 32,
    fontFamily: 'Inter_700Bold',
  },
  tokenStatus: {
    color: '#666',
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    textTransform: 'capitalize',
    marginTop: 8,
  },
  waitingText: {
    color: '#666',
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    marginTop: 4,
  },
  availabilityBox: {
    backgroundColor: '#F0F9FF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4C35E3',
    marginBottom: 16,
  },
  availabilityLabel: {
    fontSize: 16,
    color: '#4C35E3',
    fontFamily: 'Inter_600SemiBold',
  },
  availabilityCount: {
    fontSize: 32,
    color: '#4C35E3',
    fontFamily: 'Inter_700Bold',
    marginVertical: 8,
  },
  noTokensText: {
    color: '#EF4444',
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
  },
  tokensLeft: {
    fontSize: 14,
    color: '#4B5563',
    fontFamily: 'Inter_400Regular',
    marginTop: 4,
  },
  unavailableContainer: {
    backgroundColor: '#FEE2E2',
    padding: 16,
    borderRadius: 12,
    marginVertical: 8,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748B',
    fontFamily: 'Inter_500Medium',
  },
  loadingTokenContainer: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    marginVertical: 8,
    flexDirection: 'row',
    gap: 8,
  },
  scheduleContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    margin: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  selectedDateInfo: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f8f9ff',
    borderRadius: 12,
  },
  selectedDateTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: '#1a237e',
    marginBottom: 10,
  },
  tokenInfoBox: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e6ff',
  },
  availableTokensText: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: '#4C35E3',
    marginBottom: 5,
  },
  bookedTokensText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#666',
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9ff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e6ff',
    justifyContent: 'center',
    gap: 8,
  },
  datePickerText: {
    fontSize: 16,
    color: '#4C35E3',
    fontFamily: 'Inter_500Medium',
  },
  tokenStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e6ff',
  },
  maxTokensText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#666',
  },
  noTokensWarning: {
    color: '#EF4444',
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    marginTop: 8,
    textAlign: 'center',
  },
})

