import { useState, useRef, useEffect } from 'react'
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  Animated,
  Easing,
  Alert,
  ActivityIndicator,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import AgePicker from './AgePicker'
import RequiredModal from './RequiredModal'

const STEPS = {
  NAME: 0,
  AGE: 1,
  PHONE: 2,
  GENDER: 3
}

export default function PatientDetailsForm({ visible, onClose, onSubmit }) {
  const [hasPatientId, setHasPatientId] = useState(false)
  const [formData, setFormData] = useState({
    patientId: '',
    hospitalId: '',
    name: '',
    age: '',
    phone: '',
    gender: ''
  })

  const [slideAnim] = useState(new Animated.Value(0))
  const [overlayOpacity] = useState(new Animated.Value(0))
  const translateX = useRef(new Animated.Value(0)).current
  const [currentStep, setCurrentStep] = useState(STEPS.NAME)
  const inputRef = useRef(null)
  const [inputAnim] = useState(new Animated.Value(1))
  const [isLoading, setIsLoading] = useState(false)
  const [currentAge, setCurrentAge] = useState(null)
  const [headerHeight, setHeaderHeight] = useState(0)
  const [requiredModal, setRequiredModal] = useState({
    visible: false,
    message: ''
  })

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 1,
          duration: 300,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start()
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start()
    }
  }, [visible])

  useEffect(() => {
    Animated.spring(translateX, {
      toValue: hasPatientId ? 160 : 0,
      damping: 20,
      stiffness: 90,
      mass: 1,
      useNativeDriver: true,
    }).start()
  }, [hasPatientId])

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [300, 0]
  })

  const animateNextInput = () => {
    Animated.sequence([
      Animated.timing(inputAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(inputAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      })
    ]).start()
  }

  const handleBack = () => {
    if (currentStep > STEPS.NAME) {
      animateNextInput()
      setTimeout(() => {
        setCurrentStep(currentStep - 1)
      }, 200)
    }
  }

  const showErrorAlert = (message) => {
    setRequiredModal({
      visible: true,
      message
    });
  }

  const handleNextStep = () => {
    if (currentStep === STEPS.NAME && !formData.name) {
      showErrorAlert('Please enter your name')
      return
    }
    if (currentStep === STEPS.AGE && !formData.age) {
      showErrorAlert('Please select your age')
      return
    }
    
    animateNextInput()
    setTimeout(() => {
      if (currentStep < STEPS.GENDER) {
        setCurrentStep(currentStep + 1)
      } else {
        handleSubmit()
      }
    }, 200)
  }

  const validateForm = () => {
    if (!formData.name || formData.name.trim() === '') {
      showErrorAlert('Please enter your name');
      return false;
    }
    if (!formData.age) {
      showErrorAlert('Please select your age');
      return false;
    }
    if (!formData.phone || formData.phone.length < 10) {
      showErrorAlert('Please enter a valid phone number');
      return false;
    }
    if (!formData.gender) {
      showErrorAlert('Please select your gender');
      return false;
    }
    return true;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      const patientDetails = {
        name: formData.name,
        age: parseInt(formData.age),
        gender: formData.gender,
        phone: formData.phone,
        isNewPatient: !hasPatientId,
        patientId: hasPatientId ? formData.patientId : null
      };

      // Add fade out animation
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start(() => {
        onSubmit(patientDetails);
      });
    }
  }

  const renderAgeInput = () => (
    <View style={styles.inputGroup}>
      <Text style={styles.stepTitle}>How old are you?</Text>
      <View style={styles.agePickerContainer}>
        <AgePicker
          value={currentAge}
          onChange={(age) => {
            setCurrentAge(age)
            setFormData(prev => ({ ...prev, age: age.toString() }))
          }}
        />
      </View>
    </View>
  )

  const renderGenderSection = () => (
    <View style={styles.inputGroup}>
      <Text style={styles.stepTitle}>Select your gender</Text>
      <View style={styles.genderContainer}>
        {['Male', 'Female', 'Other'].map((gender) => (
          <TouchableOpacity
            key={gender}
            style={[
              styles.genderButton,
              formData.gender === gender && styles.activeGender
            ]}
            onPress={() => setFormData({...formData, gender: gender})}
          >
            <View style={styles.genderContent}>
              <View style={[
                styles.genderIcon,
                formData.gender === gender && styles.activeGenderIcon
              ]}>
                <Ionicons 
                  name={gender === 'Male' ? 'male' : gender === 'Female' ? 'female' : 'person'} 
                  size={24} 
                  color={formData.gender === gender ? '#fff' : '#666'} 
                />
              </View>
              <Text style={[
                styles.genderText,
                formData.gender === gender && styles.activeGenderText
              ]}>
                {gender}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
      {formData.gender && (
        <TouchableOpacity 
          style={[styles.bookButton, isLoading && styles.bookButtonLoading]} 
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color="#fff" size="small" />
              <Text style={styles.bookButtonText}>Booking...</Text>
            </View>
          ) : (
            <Text style={styles.bookButtonText}>Book Appointment</Text>
          )}
        </TouchableOpacity>
      )}
    </View>
  )

  const renderCurrentInput = () => {
    if (hasPatientId) {
      return (
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Patient ID*</Text>
          <TextInput
            ref={inputRef}
            style={styles.input}
            value={formData.patientId}
            onChangeText={(text) => setFormData({...formData, patientId: text})}
            placeholder="Enter your patient ID"
            onSubmitEditing={handleSubmit}
            returnKeyType="done"
            keyboardType="numeric"
          />
        </View>
      )
    }

    const inputs = {
      [STEPS.NAME]: (
        <View style={styles.inputGroup}>
          <Text style={styles.stepTitle}>What's your name?</Text>
          <TextInput
            ref={inputRef}
            style={styles.input}
            value={formData.name}
            onChangeText={(text) => setFormData({...formData, name: text})}
            placeholder="Enter your full name"
            onSubmitEditing={handleNextStep}
            returnKeyType="next"
            autoFocus
          />
        </View>
      ),
      [STEPS.AGE]: renderAgeInput(),
      [STEPS.PHONE]: (
        <View style={styles.inputGroup}>
          <Text style={styles.stepTitle}>What's your phone number?</Text>
          <TextInput
            ref={inputRef}
            style={styles.input}
            value={formData.phone}
            onChangeText={(text) => setFormData({...formData, phone: text})}
            keyboardType="phone-pad"
            placeholder="Enter your phone number"
            onSubmitEditing={handleNextStep}
            returnKeyType="next"
            autoFocus
          />
        </View>
      ),
      [STEPS.GENDER]: renderGenderSection()
    }

    return (
      <View style={styles.formSection}>
        <View style={styles.inputContainer}>
          {inputs[currentStep]}
        </View>
      </View>
    )
  }

  const renderBackButton = () => {
    if (hasPatientId) return null;
    
    if (currentStep > STEPS.NAME) {
      return (
        <TouchableOpacity 
          style={styles.simpleBackButton}
          onPress={handleBack}
        >
          <Ionicons name="chevron-back" size={28} color="#4C35E3" />
        </TouchableOpacity>
      );
    }
    return null;
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View 
        style={[styles.overlay, { opacity: overlayOpacity }]}
      >
        <Animated.View
          style={[styles.modalContent, { transform: [{ translateY }] }]}
        >
          <View 
            style={styles.headerContainer}
            onLayout={(event) => setHeaderHeight(event.nativeEvent.layout.height)}
          >
            <View style={styles.header}>
              <Text style={styles.title}>Patient Details</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.selectorContainer}>
              <Animated.View style={[styles.activeBackground, { transform: [{ translateX }] }]} />
              <TouchableOpacity
                style={styles.selectorButton}
                onPress={() => setHasPatientId(false)}
              >
                <Text style={[styles.selectorText, !hasPatientId && styles.activeText]}>
                  New Patient
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.selectorButton}
                onPress={() => setHasPatientId(true)}
              >
                <Text style={[styles.selectorText, hasPatientId && styles.activeText]}>
                  Existing Patient
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={[styles.formContentContainer, { marginTop: headerHeight - 20 }]}>
            {renderBackButton()}
            {renderCurrentInput()}

            <View style={styles.bottomContainer}>
              {(hasPatientId || currentStep !== STEPS.GENDER) && (
                <TouchableOpacity 
                  style={[
                    styles.continueButton,
                    currentStep === STEPS.AGE && !currentAge && styles.continueButtonDisabled
                  ]} 
                  onPress={hasPatientId ? handleSubmit : handleNextStep}
                  disabled={currentStep === STEPS.AGE && !currentAge}
                >
                  <Text style={styles.continueButtonText}>
                    {currentStep === STEPS.GENDER ? 'Submit' : 'Continue'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          <RequiredModal 
            visible={requiredModal.visible}
            message={requiredModal.message}
            onClose={() => setRequiredModal(prev => ({ ...prev, visible: false }))}
          />
        </Animated.View>
      </Animated.View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    maxHeight: '90%',
    minHeight: 500,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  closeButton: {
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 20,
    textAlign: 'center',
  },
  selectorContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 24,
    padding: 3,
    position: 'relative',
    height: 40,
    marginBottom: 20,
  },
  activeBackground: {
    position: 'absolute',
    width: '48%',
    height: 34,
    backgroundColor: '#4C35E3',
    borderRadius: 20,
    top: 3,
    left: 3,
    shadowColor: "#4C35E3",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  selectorButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  selectorText: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: '#64748B',
  },
  activeText: {
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  inputGroup: {
    marginBottom: 8,
    marginTop: 0,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontFamily: 'Inter_500Medium',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    backgroundColor: '#F8FAFC',
  },
  genderContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  genderButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  activeGender: {
    backgroundColor: '#4C35E3',
    borderColor: '#4C35E3',
  },
  genderContent: {
    alignItems: 'center',
    gap: 8,
  },
  genderIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EDF2F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeGenderIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  genderText: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: '#666',
  },
  activeGenderText: {
    color: '#fff',
  },
  stepTitle: {
    fontSize: 22,
    fontFamily: 'Inter_600SemiBold',
    color: '#1A1A1A',
    marginBottom: 12,
    textAlign: 'center',
  },
  continueButton: {
    backgroundColor: '#4C35E3',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    top: 0,
    marginBottom: 16,
    shadowColor: "#4C35E3",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  simpleBackButton: {
    position: 'absolute',
    left: 16,
    top: -4,
    padding: 8,
    zIndex: 100,
  },
  bookButton: {
    backgroundColor: '#4C35E3',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 32,
    shadowColor: "#4C35E3",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  bookButtonLoading: {
    opacity: 0.8,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    zIndex: 10,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
  },
  formContentContainer: {
    flex: 1,
    position: 'relative',
    paddingHorizontal: 24,
    paddingTop: 0,
    marginTop: -60,
    justifyContent: 'space-between',
  },
  agePickerContainer: {
    height: 200,
    marginTop: -20,
    marginBottom: 16,
  },
  formSection: {
    flex: 1,
  },
  inputContainer: {
    paddingBottom: 8,
  },
  bottomContainer: {
    marginTop: 'auto',
    paddingTop: 16,
    paddingBottom: 16,
  },
  alertContainer: {
    borderRadius: 16,
    backgroundColor: '#FFF',
    padding: 20,
  },
  alertTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
    color: '#EF4444',
    marginBottom: 8,
  },
  alertMessage: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
})