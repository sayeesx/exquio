"use client"

import { useState, useEffect } from "react"
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
  Linking,
  Alert,
  Modal,
  Platform,
  StatusBar,
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import Icon from "react-native-vector-icons/MaterialIcons"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useFonts, Inter_700Bold, Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from "@expo-google-fonts/inter"

const { width } = Dimensions.get("window")

const BackButton = () => {
  const router = useRouter()

  const handleBack = () => {
    // Navigate back to the appointments index page
    router.push("/appointment")
    // Alternative approaches:
    // router.back();
    // router.push("/(tabs)/appointment");
  }

  return (
    <TouchableOpacity style={styles.backButton} onPress={handleBack} activeOpacity={0.7}>
      <Icon name="arrow-back" size={24} color="#fff" />
    </TouchableOpacity>
  )
}

const handleCallHospital = () => {
  const hospitalNumber = "+1234567890"
  Alert.alert("Call Hospital", "Would you like to call Aster Hospital?", [
    {
      text: "Cancel",
      style: "cancel",
    },
    {
      text: "Call",
      onPress: () => Linking.openURL(`tel:${hospitalNumber}`), // Fixed template string syntax
    },
  ])
}

const CancelAlert = ({ visible, onClose, onConfirm }) => {
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.alertContainer, { width: '80%' }]}>
          <View style={[styles.alertContent, { padding: 20 }]}>
            <Text style={[styles.alertTitle, { fontSize: 18, marginBottom: 12 }]}>Cancel Appointment?</Text>
            <Text style={[styles.alertMessage, { fontSize: 14, marginBottom: 20 }]}>
              Are you sure you want to cancel this appointment?
            </Text>
            <View style={[styles.alertButtonsContainer, { gap: 8 }]}>
              <TouchableOpacity 
                style={[styles.alertButton, styles.alertButtonOutline, { paddingVertical: 8 }]} 
                onPress={onClose}
              >
                <Text style={[styles.alertButtonText, styles.alertButtonTextOutline, { fontSize: 14 }]}>NO</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.alertButton, { backgroundColor: '#FF0000', paddingVertical: 8 }]} 
                onPress={onConfirm}
              >
                <Text style={[styles.alertButtonText, { fontSize: 14 }]}>YES</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const FinalCancelAlert = ({ visible, onClose, onConfirm }) => {
  const [timeLeft, setTimeLeft] = useState(5)

  useEffect(() => {
    if (!visible) {
      setTimeLeft(5)
      return
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1)
    }, 1000)

    // Handle auto-cancellation in a separate effect
    if (timeLeft === 0) {
      clearInterval(timer)
      // Use setTimeout to avoid the setState warning
      setTimeout(() => {
        onConfirm()
      }, 0)
    }

    return () => {
      clearInterval(timer)
    }
  }, [visible, timeLeft, onConfirm])

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.alertContainer}>
          <View style={styles.alertContent}>
            <Text style={styles.alertTitle}>Final Confirmation</Text>
            <Text style={styles.alertMessage}>
              This action cannot be undone. Are you absolutely sure you want to cancel this appointment?
            </Text>
            <Text style={styles.timerText}>Auto-cancelling in {timeLeft}s</Text>
            <View style={styles.alertButtonsContainer}>
              <TouchableOpacity style={[styles.alertButton, styles.alertButtonOutline]} onPress={onClose}>
                <Text style={[styles.alertButtonText, styles.alertButtonTextOutline]}>NO, GO BACK</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.alertButton, styles.alertButtonDanger]} onPress={onConfirm}>
                <Text style={styles.alertButtonText}>YES, CONFIRM</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const SuccessAlert = ({ visible, onClose }) => {
  useEffect(() => {
    if (visible) {
      // Auto close after 2 seconds and redirect
      const timer = setTimeout(() => {
        onClose()
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [visible, onClose]) // Added onClose to dependencies

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.alertContainer}>
          <View style={styles.alertContent}>
            <Icon name="check-circle" size={50} color="#4CAF50" />
            <Text style={[styles.alertTitle, { marginTop: 16 }]}>Appointment Cancelled</Text>
            <Text style={styles.alertMessage}>Your appointment has been cancelled successfully</Text>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const ToastAlert = ({ visible, onClose }) => {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(onClose, 2000);
      return () => clearTimeout(timer);
    }
  }, [visible, onClose]);

  if (!visible) return null;

  return (
    <View style={styles.toastContainer}>
      <Text style={styles.toastText}>Feature coming soon!</Text>
    </View>
  );
};

const RescheduleAlert = ({ visible, onClose }) => {
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.alertContainer, { width: '75%' }]}>
          <View style={[styles.alertContent, { paddingVertical: 20 }]}>
            <Text style={[styles.alertTitle, { fontSize: 18 }]}>Coming Soon!</Text>
            <Text style={[styles.alertMessage, { fontSize: 14, marginBottom: 16 }]}>
              This feature will be available soon.
            </Text>
            <View style={styles.alertButtonsContainer}>
              <TouchableOpacity 
                style={[styles.alertButton, { backgroundColor: '#4C35E3', paddingVertical: 8 }]} 
                onPress={onClose}
              >
                <Text style={[styles.alertButtonText, { fontSize: 14 }]}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const AppointmentDetailsScreen = () => {
  const router = useRouter()
  const params = useLocalSearchParams()
  const [cancelAlertVisible, setCancelAlertVisible] = useState(false)
  const [finalCancelAlertVisible, setFinalCancelAlertVisible] = useState(false)
  const [successAlertVisible, setSuccessAlertVisible] = useState(false)
  const [toastVisible, setToastVisible] = useState(false);
  const [rescheduleAlertVisible, setRescheduleAlertVisible] = useState(false);

  const [fontsLoaded] = useFonts({
    Inter_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  })

  if (!fontsLoaded) {
    return (
      <View>
        <Text>Loading...</Text>
      </View>
    )
  }

  const handleCancelConfirm = () => {
    setCancelAlertVisible(false)
    setFinalCancelAlertVisible(true)
  }

  const handleFinalCancelConfirm = () => {
    setFinalCancelAlertVisible(false)
    setSuccessAlertVisible(true)
  }

  const handleSuccessClose = () => {
    setSuccessAlertVisible(false)
    router.push("/appointment")
  }

  // Get appointment details from params
  const appointment = {
    id: params.id,
    dateTime: params.date,
    doctorName: params.doctorName,
    specialization: params.specialization,
    // Add other appointment details you need
  }

  const handleReschedule = () => {
    setRescheduleAlertVisible(true);
  }

  const handleCancel = () => {
    setCancelAlertVisible(true)
  }

  return (
    <View style={styles.container}>
      <CancelAlert
        visible={cancelAlertVisible}
        onClose={() => setCancelAlertVisible(false)}
        onConfirm={handleCancelConfirm}
      />
      <FinalCancelAlert
        visible={finalCancelAlertVisible}
        onClose={() => setFinalCancelAlertVisible(false)}
        onConfirm={handleFinalCancelConfirm}
      />
      <SuccessAlert visible={successAlertVisible} onClose={handleSuccessClose} />
      <ToastAlert 
        visible={toastVisible} 
        onClose={() => setToastVisible(false)} 
      />
      <RescheduleAlert 
        visible={rescheduleAlertVisible} 
        onClose={() => setRescheduleAlertVisible(false)} 
      />
      <LinearGradient
        colors={["#4C35E3", "#4B47E5", "#5465FF"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBackground}
      >
        <View style={styles.header}>
          <BackButton />
          <Text style={styles.headerTitle}>Appointment Request</Text>
          <TouchableOpacity style={styles.hospitalCallButton} onPress={handleCallHospital} activeOpacity={0.7}>
            <Icon name="local-hospital" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.dateTimeSection}>
          <Text style={styles.date}>12 Jan 2020,</Text>
          <Text style={styles.time}>8am — 10am</Text>
        </View>
      </LinearGradient>

      <View style={styles.contentContainer}>
        <View style={styles.contentInner}>
          <View style={styles.profileSection}>
            <View style={styles.profileRow}>
              <View style={styles.doctorImageContainer}>
                <Image source={require("../../../assets/doctors/chandru.png")} style={styles.doctorImage} />
              </View>
              <View style={styles.logoContainer}>
                <Image source={require("../../../assets/hospital-logos/aster.png")} style={styles.hospitalLogo} />
              </View>
            </View>
            <View style={styles.nameSection}>
              <Text style={styles.name}>Dr.Chandru</Text>
              <Text style={styles.hospitalName}>Aster Mims</Text>
            </View>
          </View>

          <View style={styles.paymentSection}>
            <Text style={styles.paymentTitle}>Payment Receipt</Text>
            <View style={styles.paymentDetails}>
              <Text style={styles.paymentLabel}>Amount:</Text>
              <Text style={styles.paymentAmount}>$150.00</Text>
            </View>
            <View style={styles.paymentDetails}>
              <Text style={styles.paymentLabel}>Date:</Text>
              <Text style={styles.paymentAmount}>06 Mar 2020</Text>
            </View>
          </View>

          <View style={styles.commentSection}>
            <View style={styles.commentHeader}>
              <Icon name="chat" size={16} color="#4C35E3" />
              <Text style={styles.commentTitle}>Instructions</Text>
            </View>
            <View style={styles.commentBox}>
              <View style={styles.commentContent}>
                <Icon name="info-outline" size={20} color="#4C35E3" style={styles.commentIcon} />
                <Text style={styles.commentText}>
                  Hello Dr. Peterson, Please ensure you bring all relevant medical reports for a comprehensive evaluation.
                  Additionally, arrive punctually for your scheduled consultation to facilitate a smooth and efficient visit
                  with the doctor. Your cooperation is greatly appreciated.
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.rescheduleButton} onPress={handleReschedule}>
              <LinearGradient
                colors={["#4C35E3", "#4B47E5", "#5465FF"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.buttonGradient}
              >
                <Text style={[styles.buttonText, { color: "#fff" }]}>RESCHEDULE</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.declineButton} onPress={handleCancel}>
              <LinearGradient
                colors={["#FF0000", "#FF0000"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.buttonGradient}
              >
                <Text style={[styles.buttonText, { color: "#fff" }]}>CANCEL</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  gradientBackground: {
    paddingTop: Platform.OS === "ios" ? 25 : StatusBar.currentHeight - 5,
    paddingBottom: 35,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 18, // increased from 14
    color: "#fff",
    fontFamily: "Inter_600SemiBold", // added font family for better appearance
  },
  hospitalCallButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  dateTimeSection: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    marginTop: 10,
  },
  date: {
    fontSize: 28, // reduced from 32
    color: "#fff",
    fontFamily: "Inter_600SemiBold",
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.1)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 10,
  },
  time: {
    fontSize: 28, // reduced from 32
    color: "#fff",
    fontFamily: "Inter_600SemiBold",
    marginTop: 2, // reduced from 4
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.1)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 10,
  },
  contentContainer: {
    flex: 1,
    marginTop: -25,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  contentInner: {
    padding: 16, // reduced from 20
    paddingBottom: 60, // reduced from 80
  },
  profileSection: {
    marginTop: 15,
    marginBottom: 20,
    alignItems: "center",
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
    gap: 40,
  },
  doctorImageContainer: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  doctorImage: {
    width: 60, // reduced from 70
    height: 60, // reduced from 70
    borderRadius: 30,
    marginBottom: 8, // reduced from 12
    borderWidth: 2, // reduced from 3
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  hospitalLogo: {
    width: 65, // reduced from 80
    height: 65, // reduced from 80
    resizeMode: "contain",
  },
  nameSection: {
    alignItems: "center",
  },
  name: {
    fontSize: 18, // reduced from 20
    color: "#1a365d",
    fontWeight: "bold",
    marginBottom: 2, // reduced from 4
    textAlign: "center",
  },
  hospitalName: {
    fontSize: 14, // reduced from 16
    color: "#64748b",
    fontFamily: "Inter_500Medium",
    marginTop: 2, // reduced from 4
  },
  paymentSection: {
    backgroundColor: "#f8fafc",
    borderRadius: 14,
    padding: 10, // reduced from 12
    marginBottom: 10, // reduced from 12
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    width: "95%",
    alignSelf: "center",
  },
  paymentTitle: {
    fontSize: 12, // reduced from 13
    color: "#4C35E3",
    fontWeight: "600",
    marginBottom: 4, // reduced from 6
  },
  paymentDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
    paddingHorizontal: 4,
  },
  paymentLabel: {
    fontSize: 11, // reduced from 12
    color: "#64748b",
  },
  paymentAmount: {
    fontSize: 11, // reduced from 12
    color: "#1a365d",
    fontWeight: "600",
  },
  commentSection: {
    backgroundColor: "#f8fafc",
    borderRadius: 14,
    padding: 10, // reduced from 12
    marginBottom: 10, // reduced from 12
    width: "95%",
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  commentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8, // reduced from 12
    gap: 6, // reduced from 8
  },
  commentTitle: {
    fontSize: 12, // reduced from 13
    color: "#4C35E3",
    fontFamily: "Inter_600SemiBold",
  },
  commentBox: {
    backgroundColor: "#fff",
    borderRadius: 8, // reduced from 10
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  commentContent: {
    padding: 10, // reduced from 12
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8, // reduced from 12
  },
  commentIcon: {
    marginTop: 2,
  },
  commentText: {
    flex: 1,
    fontSize: 11, // reduced from 12
    lineHeight: 14, // reduced from 16
    color: "#475569",
    fontFamily: "Inter_400Regular",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 8, // increased from 6
    gap: 8, // increased from 6
    marginTop: 10, // increased from 8
    marginBottom: 12, // increased from 10
    backgroundColor: "#fff",
  },
  rescheduleButton: {
    flex: 1,
    height: 38, // increased from 32
    borderRadius: 8, // increased from 6
    overflow: "hidden",
    shadowColor: "#4C35E3",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  declineButton: {
    flex: 1,
    height: 38, // increased from 32
    borderRadius: 8, // increased from 6
    overflow: "hidden",
    shadowColor: "#FF0000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    fontSize: 12, // increased from 11
    fontWeight: "600",
    letterSpacing: 0.3, // increased from 0.2
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    maxWidth: 320,
    width: '80%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  alertContent: {
    padding: 20,
    alignItems: 'center',
  },
  alertTitle: {
    color: '#1a365d',
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    textAlign: 'center',
    marginBottom: 12,
  },
  alertMessage: {
    color: '#64748b',
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  alertButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
  },
  alertButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 80,
  },
  alertButtonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#4C35E3',
  },
  alertButtonText: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#fff',
    textAlign: 'center',
  },
  alertButtonTextOutline: {
    color: '#4C35E3',
  },
  alertButtonDanger: {
    backgroundColor: "#FF0000",
    shadowColor: "#FF0000",
  },
  timerText: {
    color: "#64748b",
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    marginTop: 8,
    marginBottom: 16,
    textAlign: "center",
  },
  successAlertContent: {
    padding: 24,
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 20,
  },
  successIcon: {
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 22,
    color: "#1a365d",
    fontFamily: "Inter_700Bold",
    marginBottom: 8,
    textAlign: "center",
  },
  successMessage: {
    fontSize: 16,
    color: "#64748b",
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    marginBottom: 24,
  },
  toastContainer: {
    position: 'absolute',
    bottom: 100,
    left: '10%',
    right: '10%',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 12,
    borderRadius: 8,
    zIndex: 1000,
    alignItems: 'center',
  },
  toastText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
  },
})

export default AppointmentDetailsScreen