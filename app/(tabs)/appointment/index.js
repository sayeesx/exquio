import React, { useState, useRef, useEffect } from "react"
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Animated,
  Pressable,
  Dimensions,
  Platform,
  StatusBar,
  Modal,
  Alert,
  Share,
  TextInput,
} from "react-native"
import Icon from "react-native-vector-icons/MaterialIcons"
import { LinearGradient } from "expo-linear-gradient"
import { useFonts, Inter_700Bold, Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from "@expo-google-fonts/inter"
import { useRouter } from "expo-router"

const { width } = Dimensions.get("window")
const CARD_WIDTH = width * 0.85 // Adjusted Card width
const CARD_GAP = 15 // Adjusted gap between cards
const TOTAL_WIDTH = CARD_WIDTH + CARD_GAP // Total width including gap

const AppointmentStatus = ({ dateTime }) => {
  const [isTime, setIsTime] = useState(false)

  useEffect(() => {
    const checkTime = () => {
      const appointmentTime = new Date(dateTime).getTime()
      const now = new Date().getTime()
      setIsTime(now >= appointmentTime)
    }

    const timer = setInterval(checkTime, 1000)
    checkTime()

    return () => clearInterval(timer)
  }, [dateTime])

  return (
    <View style={styles.statusContainer}>
      <View style={[styles.statusDot, isTime ? styles.statusDotUrgent : styles.statusDotUpcoming]} />
      {isTime && (
        <View style={styles.timeReachedContainer}>
          <Icon name="access-time-filled" size={14} color="#FF4444" />
          <Text style={styles.timeReachedText}>Current</Text>
        </View>
      )}
    </View>
  )
}

// Replace the existing CancelAlert component with this one
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

// Replace the existing FinalCancelAlert component with this one
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

const RecentAppointmentDetails = ({ visible, onClose, appointment }) => {
  const [prescriptionView, setPrescriptionView] = useState("default") // 'default', 'pdf', or 'text'

  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, { height: '85%' }]}>
          <LinearGradient
            colors={["#4C35E3", "#4B47E5", "#5465FF"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.modalHeaderGradient}
          >
            <TouchableOpacity style={styles.backButton} onPress={onClose}>
              <Icon name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.modalHeaderTitle}>Past Appointment</Text>
          </LinearGradient>

          <ScrollView style={styles.modalContent}>
            {/* Remove the Past Appointment section and start with date */}
            <View style={styles.appointmentSection}>
              <Text style={styles.appointmentDate}>{appointment?.dateTime}</Text>
            </View>

            {/* Patient Info */}
            <View style={styles.patientSection}>
              <Image source={appointment?.patientImage} style={styles.modalPatientImage} />
              <View style={styles.patientInfo}>
                <Text style={styles.patientName}>{appointment?.patientName}</Text>
                <Text style={styles.appointmentType}>General Checkup</Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Doctor's Notes */}
            <View style={styles.notesSection}>
              <Text style={styles.sectionTitle}>Doctor's Notes</Text>
              <View style={styles.noteCard}>
                <Text style={styles.noteText}>
                  Patient presented with mild fever and cough. Physical examination normal. Prescribed antibiotics and
                  rest for 5 days. Follow-up if symptoms persist.
                </Text>
                <View style={styles.vitalRow}>
                  <View style={styles.vitalItem}>
                    <Text style={styles.vitalLabel}>BP</Text>
                    <Text style={styles.vitalValue}>120/80</Text>
                  </View>
                  <View style={styles.vitalItem}>
                    <Text style={styles.vitalLabel}>Temp</Text>
                    <Text style={styles.vitalValue}>99.2°F</Text>
                  </View>
                  <View style={styles.vitalItem}>
                    <Text style={styles.vitalLabel}>Weight</Text>
                    <Text style={styles.vitalValue}>68 kg</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Prescriptions */}
            <View style={styles.prescriptionSection}>
              <View style={styles.sectionTitleRow}>
                <Text style={styles.sectionTitle}>Prescriptions</Text>
                <View style={styles.prescriptionActions}>
                  <Pressable
                    style={styles.actionButton}
                    onPress={() => setPrescriptionView("pdf")}
                  >
                    <Icon 
                      name="picture-as-pdf" 
                      size={20} 
                      color={prescriptionView === "pdf" ? "#4C35E3" : "#64748b"} 
                    />
                  </Pressable>
                  
                  <Pressable
                    style={styles.actionButton}
                    onPress={() => setPrescriptionView("text")}
                  >
                    <Icon 
                      name="text-snippet" 
                      size={20} 
                      color={prescriptionView === "text" ? "#4C35E3" : "#64748b"} 
                    />
                  </Pressable>
                  
                  <Pressable
                    style={styles.actionButton}
                    onPress={async () => {
                      try {
                        const prescriptionText =
                          "Prescription Details\n\n" +
                          "Patient: John Doe\n" +
                          "Date: " +
                          appointment?.dateTime +
                          "\n\n" +
                          "Medications:\n" +
                          "1. Amoxicillin 500mg\n" +
                          "   - 1 tablet twice daily for 5 days\n\n" +
                          "2. Paracetamol 500mg\n" +
                          "   - As needed for fever, max 4 times daily\n\n" +
                          "Doctor's Notes:\n" +
                          "Patient presented with mild fever and cough.\n" +
                          "Follow-up if symptoms persist.\n\n" +
                          "Hospital: Aster Hospital"

                        await Share.share(
                          {
                            message: prescriptionText,
                            title: "Prescription Details",
                          },
                          {
                            dialogTitle: "Share Prescription",
                            subject: "Prescription Details from Aster Hospital",
                          },
                        )
                      } catch (error) {
                        Alert.alert("Error", "Failed to share prescription")
                      }
                    }}
                  >
                    <Icon name="share" size={20} color="#64748b" />
                  </Pressable>
                </View>
              </View>

              {prescriptionView === "default" && (
                <View style={styles.prescriptionCard}>
                  <View style={styles.medicineItem}>
                    <Icon name="medication" size={20} color="#4C35E3" />
                    <View style={styles.medicineInfo}>
                      <Text style={styles.medicineName}>Amoxicillin 500mg</Text>
                      <Text style={styles.medicineInstructions}>1 tablet twice daily for 5 days</Text>
                    </View>
                  </View>
                  <View style={styles.medicineItem}>
                    <Icon name="medication" size={20} color="#4C35E3" />
                    <View style={styles.medicineInfo}>
                      <Text style={styles.medicineName}>Paracetamol 500mg</Text>
                      <Text style={styles.medicineInstructions}>As needed for fever, max 4 times daily</Text>
                    </View>
                  </View>
                </View>
              )}

              {prescriptionView === "text" && (
                <View style={styles.prescriptionCard}>
                  <Text style={styles.prescriptionText}>
                    PRESCRIPTION{" "}
                    <Text style={{ fontSize: 14, color: "#64748b", fontFamily: "Inter_400Regular" }}>
                      Date: {appointment?.dateTime}
                    </Text>{" "}
                    <Text style={{ fontSize: 14, color: "#64748b", fontFamily: "Inter_400Regular" }}>Medications:</Text>{" "}
                    <Text style={{ fontSize: 14, color: "#1a365d", fontFamily: "Inter_600SemiBold" }}>
                      1. Amoxicillin 500mg
                    </Text>{" "}
                    <Text style={{ fontSize: 14, color: "#64748b", fontFamily: "Inter_400Regular" }}>
                      Dosage: 1 tablet
                    </Text>{" "}
                    <Text style={{ fontSize: 14, color: "#64748b", fontFamily: "Inter_400Regular" }}>
                      Frequency: Twice daily
                    </Text>{" "}
                    <Text style={{ fontSize: 14, color: "#64748b", fontFamily: "Inter_400Regular" }}>
                      Duration: 5 days
                    </Text>{" "}
                    <Text style={{ fontSize: 14, color: "#1a365d", fontFamily: "Inter_600SemiBold" }}>
                      2. Paracetamol 500mg
                    </Text>{" "}
                    <Text style={{ fontSize: 14, color: "#64748b", fontFamily: "Inter_400Regular" }}>
                      Dosage: 1 tablet
                    </Text>{" "}
                    <Text style={{ fontSize: 14, color: "#64748b", fontFamily: "Inter_400Regular" }}>
                      Frequency: As needed
                    </Text>{" "}
                    <Text style={{ fontSize: 14, color: "#64748b", fontFamily: "Inter_400Regular" }}>
                      Max: 4 times daily
                    </Text>{" "}
                    <Text style={{ fontSize: 14, color: "#1a365d", fontFamily: "Inter_600SemiBold" }}>
                      Doctor's Notes:
                    </Text>{" "}
                    <Text style={{ fontSize: 14, color: "#64748b", fontFamily: "Inter_400Regular" }}>
                      Patient presented with mild fever and cough.
                    </Text>{" "}
                    <Text style={{ fontSize: 14, color: "#64748b", fontFamily: "Inter_400Regular" }}>
                      Follow-up if symptoms persist.
                    </Text>
                  </Text>
                </View>
              )}

              {prescriptionView === "pdf" && (
                <View style={styles.prescriptionCard}>
                  <View style={styles.pdfPreview}>
                    <Icon name="picture-as-pdf" size={40} color="#FF0000" />
                    <Text style={styles.pdfText}>PDF Preview</Text>
                    <Text style={styles.pdfNote}>
                      This is a preview of how the prescription would look in PDF format. Actual PDF functionality would
                      require additional implementation.
                    </Text>
                  </View>
                </View>
              )}
            </View>

            {/* Receipt Section */}
            <View style={styles.receiptSection}>
              <Text style={styles.sectionTitle}>Payment Receipt</Text>
              <View style={styles.receiptCard}>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Consultation Fee</Text>
                  <Text style={styles.receiptAmount}>$150.00</Text>
                </View>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Medicines</Text>
                  <Text style={styles.receiptAmount}>$45.00</Text>
                </View>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Lab Tests</Text>
                  <Text style={styles.receiptAmount}>$75.00</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.receiptRow}>
                  <Text style={styles.totalLabel}>Total Paid</Text>
                  <Text style={styles.totalAmount}>$270.00</Text>
                </View>
                <Text style={styles.paymentMethod}>Paid via Credit Card</Text>
              </View>
            </View>

            {/* Follow-up Instructions */}
            <View style={styles.followupSection}>
              <Text style={styles.sectionTitle}>Follow-up Instructions</Text>
              <View style={styles.followupCard}>
                <Text style={styles.followupText}>
                  Schedule follow-up visit in 2 weeks if symptoms persist. Continue medications as prescribed. Rest and
                  maintain hydration.
                </Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  )
}

// Update the CustomReminderModal component
const CustomReminderModal = ({ visible, onClose, onSave }) => {
  const [hours, setHours] = useState('0');
  const [minutes, setMinutes] = useState('0');
  const [timeUnit, setTimeUnit] = useState('minutes');

  const handleSave = () => {
    const totalHours = timeUnit === 'minutes' ? 
      (parseInt(minutes) || 0) / 60 : 
      (parseInt(hours) || 0);
    
    if (totalHours === 0) {
      Alert.alert('Invalid Time', 'Please enter a valid time');
      return;
    }

    onSave({ 
      hours: totalHours, 
      unit: timeUnit === 'minutes' ? 'hours' : timeUnit 
    });
    onClose();
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.menuOverlay} onPress={onClose}>
        <View style={styles.customReminderContainer}>
          <Text style={styles.customReminderTitle}>Set Custom Reminder</Text>
          <View style={styles.reminderInputContainer}>
            {timeUnit !== 'minutes' ? (
              <TextInput
                style={styles.reminderInput}
                value={hours}
                onChangeText={setHours}
                keyboardType="numeric"
                maxLength={2}
                placeholder="0"
              />
            ) : (
              <TextInput
                style={styles.reminderInput}
                value={minutes}
                onChangeText={setMinutes}
                keyboardType="numeric"
                maxLength={3}
                placeholder="0"
              />
            )}
            <View style={styles.timeUnitSelector}>
              {['minute', 'hours', 'days', 'weeks'].map((unit) => (
                <TouchableOpacity
                  key={unit}
                  style={[
                    styles.timeUnitButton,
                    timeUnit === unit && styles.timeUnitButtonActive
                  ]}
                  onPress={() => setTimeUnit(unit)}
                >
                  <Text style={[
                    styles.timeUnitText,
                    timeUnit === unit && styles.timeUnitTextActive
                  ]}>
                    {unit.charAt(0).toUpperCase() + unit.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={styles.reminderActionButtons}>
            <TouchableOpacity 
              style={[styles.reminderButton, styles.reminderButtonOutline]} 
              onPress={onClose}
            >
              <Text style={styles.reminderButtonTextOutline}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.reminderButton}
              onPress={handleSave}
            >
              <Text style={styles.reminderButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
};

const ReminderModal = ({ visible, onClose, onToggleReminder, reminders, onAddCustomReminder }) => {
  const [customReminderVisible, setCustomReminderVisible] = useState(false);
  
  const quickOptions = [
    { label: '30 minutes before', value: { hours: 0.5, unit: 'hours' } },
    { label: '1 hour before', value: { hours: 1, unit: 'hours' } },
    { label: '1 day before', value: { hours: 24, unit: 'hours' } },
  ];

  return (
    <>
      <Modal
        transparent
        visible={visible}
        animationType="fade"
        onRequestClose={onClose}
      >
        <Pressable style={styles.menuOverlay} onPress={onClose}>
          <View style={styles.reminderContainer}>
            {quickOptions.map((option, index) => (
              <Pressable
                key={index}
                style={styles.reminderItem}
                onPress={() => {
                  onAddCustomReminder(option.value);
                  onClose();
                }}
              >
                <Icon 
                  name="notifications-active"
                  size={20} 
                  color="#4C35E3"
                />
                <Text style={styles.reminderText}>{option.label}</Text>
              </Pressable>
            ))}
            <View style={styles.reminderDivider} />
            <Pressable
              style={styles.reminderItem}
              onPress={() => {
                setCustomReminderVisible(true);
                onClose();
              }}
            >
              <Icon name="add-alarm" size={20} color="#4C35E3" />
              <Text style={styles.reminderText}>Custom reminder</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
      <CustomReminderModal
        visible={customReminderVisible}
        onClose={() => setCustomReminderVisible(false)}
        onSave={onAddCustomReminder}
      />
    </>
  );
};

// Replace the ReminderCountdown component with this updated version
const AppointmentCard = ({ appointment, onPressIn, onPressOut, buttonScale, onCancelAppointment }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current
  const router = useRouter()
  const [cancelAlertVisible, setCancelAlertVisible] = useState(false)
  const [finalCancelAlertVisible, setFinalCancelAlertVisible] = useState(false)
  const [successAlertVisible, setSuccessAlertVisible] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [reminderModalVisible, setReminderModalVisible] = useState(false)
  const [hasReminder, setHasReminder] = useState(false)
  const [reminders, setReminders] = useState([]);

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start()
  }, [fadeAnim])

  const handleCancelPress = (appointment) => {
    setSelectedAppointment(appointment)
    setCancelAlertVisible(true)
  }

  const handleConfirmCancel = () => {
    setCancelAlertVisible(false)
    setFinalCancelAlertVisible(true)
  }

  const handleFinalCancel = () => {
    setFinalCancelAlertVisible(false)
    setSuccessAlertVisible(true)
    setTimeout(() => {
      setSuccessAlertVisible(false)
      setSelectedAppointment(null)
    }, 2000)
  }

  const handleAddReminder = (reminderTime) => {
    setReminders([...reminders, reminderTime]);
    setHasReminder(true);
  };

  const getNextReminderTime = () => {
    if (!reminders.length) return null;
    
    const appointmentDate = new Date(appointment.dateTime);
    const reminderTimes = reminders.map(reminder => {
      let msToSubtract = 0;
      const value = reminder.hours;
      
      switch (reminder.unit) {
        case 'weeks':
          msToSubtract = value * 7 * 24 * 60 * 60 * 1000;
          break;
        case 'days':
          msToSubtract = value * 24 * 60 * 60 * 1000;
          break;
        default: // hours
          msToSubtract = value * 60 * 60 * 1000;
      }
      
      return new Date(appointmentDate.getTime() - msToSubtract);
    });

    return reminderTimes.reduce((nearest, current) => {
      if (!nearest) return current;
      return Math.abs(current.getTime() - new Date().getTime()) < 
             Math.abs(nearest.getTime() - new Date().getTime()) ? current : nearest;
    }, null);
  };

  return (
    <Animated.View style={[styles.appointmentCard, { opacity: fadeAnim }]}>
      <CancelAlert
        visible={cancelAlertVisible}
        onClose={() => setCancelAlertVisible(false)}
        onConfirm={handleConfirmCancel}
      />
      <FinalCancelAlert
        visible={finalCancelAlertVisible}
        onClose={() => setFinalCancelAlertVisible(false)}
        onConfirm={handleFinalCancel}
      />
      <SuccessAlert visible={successAlertVisible} onClose={() => setSuccessAlertVisible(false)} />
      <LinearGradient
        colors={[
          "#4C35E3", // Rich indigo
          "#3B39E4", // Deep blue
          "#4B47E5", // Royal blue
          "#5465FF", // Bright blue
          "#6983FF", // Light blue
          "#7B9EF3", // Sky blue
          "#83A8FF", // Soft blue
        ]}
        start={{ x: -0.3, y: 0.2 }}
        end={{ x: 1.3, y: 0.8 }}
        locations={[0, 0.15, 0.3, 0.5, 0.7, 0.85, 1]}
        style={styles.cardHeader}
      >
        <View style={styles.gradientOverlay}>
          <LinearGradient
            colors={["rgba(255,255,255,0.1)", "rgba(255,255,255,0)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.shineEffect}
          />
        </View>
        <View style={styles.headerContent}>
          <Text style={styles.cardTitle}>Appointment Time</Text>
          <View style={styles.headerRow}>
            <View style={styles.dateTimeContainer}>
              <Icon name="access-time" size={24} color="#fff" />
              <Text style={styles.dateTime}>{appointment.dateTime}</Text>
            </View>
            <TouchableOpacity 
              style={styles.reminderButton}
              onPress={() => setReminderModalVisible(true)}
            >
              <Icon 
                name={hasReminder ? "notifications-active" : "notifications-none"} 
                size={24} 
                color="#fff" 
              />
              {hasReminder && (
                <View style={styles.reminderIndicator}>
                  <Icon name="check" size={12} color="#fff" />
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.cardContent}>
        <View style={styles.doctorInfo}>
          <Image style={styles.doctorImage} source={appointment.doctorImage} />
          <View style={styles.doctorDetails}>
            <Text style={styles.doctorName}>{appointment.doctorName}</Text>
            <Text style={styles.specialization}>{appointment.specialization}</Text>
          </View>
          <TouchableOpacity style={styles.infoButton} onPressIn={onPressIn} onPressOut={onPressOut}>
            <Icon name="info" size={16} color="#fff" />
          </TouchableOpacity>
        </View>

        {reminders.length > 0 && (
          <>
            <View style={styles.remindersList}>
              {reminders.map((reminder, index) => (
                <View key={index} style={styles.reminderChip}>
                  <Icon name="notifications-active" size={16} color="#4C35E3" />
                  <Text style={styles.reminderChipText}>
                    {reminder.hours < 1 ? 
                      `${Math.round(reminder.hours * 60)}m before` :
                      `${reminder.hours}${reminder.unit.charAt(0)} before`}
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      const newReminders = reminders.filter((_, i) => i !== index);
                      setReminders(newReminders);
                      if (newReminders.length === 0) setHasReminder(false);
                    }}
                  >
                    <Icon name="close" size={16} color="#64748b" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </>
        )}

        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.viewButtonContainer}
            onPress={() => router.push({
              pathname: "/appointment/appointment-details",
              params: {
                date: appointment.dateTime,
                doctorName: appointment.doctorName,
                specialization: appointment.specialization,
              }
            })}
          >
            <LinearGradient
              colors={['#4C35E3', '#4B47E5', '#5465FF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.viewButton}
            >
              <Text style={styles.buttonText}>View</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.cancelButtonContainer}
            onPress={() => handleCancelPress(appointment)}
          >
            <LinearGradient
              colors={['#FF0033', '#FF0033']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.cancelButton}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>

      <ReminderModal
        visible={reminderModalVisible}
        onClose={() => setReminderModalVisible(false)}
        onToggleReminder={() => setHasReminder(!hasReminder)}
        reminders={reminders}
        onAddCustomReminder={handleAddReminder}
      />
    </Animated.View>
  )
}

const AppointmentOptionsMenu = ({ visible, onClose, onOption }) => {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.menuOverlay} onPress={onClose}>
        <View style={styles.menuContainer}>
          <Pressable
            style={styles.menuItem}
            onPress={() => onOption('download')}
          >
            <Icon name="download" size={20} color="#1a365d" />
            <Text style={styles.menuItemText}>Download Report</Text>
          </Pressable>
          
          <Pressable
            style={styles.menuItem}
            onPress={() => onOption('share')}
          >
            <Icon name="share" size={20} color="#1a365d" />
            <Text style={styles.menuItemText}>Share Details</Text>
          </Pressable>
          
          <Pressable
            style={[styles.menuItem, styles.menuItemDanger]}
            onPress={() => onOption('delete')}
          >
            <Icon name="delete-outline" size={20} color="#FF4444" />
            <Text style={[styles.menuItemText, styles.menuItemTextDanger]}>Delete Record</Text>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
};

const AppointmentsScreen = () => {
  const [upcomingAppointments, setUpcomingAppointments] = useState([
    {
      id: "1",
      dateTime: "19 Feb 2025, 5pm",
      doctorName: "Dr. Sarah Johnson",
      specialization: "Cardiology",
      doctorImage: require("../../../assets/doctors/chandru.png"),
    },
    {
      id: "2",
      dateTime: "15 Jan 2025, 10am",
      doctorName: "Dr. Michael Smith",
      specialization: "Neurology",
      doctorImage: require("../../../assets/doctors/chandru.png"),
    },
    {
      id: "3",
      dateTime: "18 Jan 2025, 2pm",
      doctorName: "Dr. Emily White",
      specialization: "Dermatology",
      doctorImage: require("../../../assets/doctors/chandru.png"),
    },
  ])

  const [recentAppointments, setRecentAppointments] = useState([
    {
      id: "4",
      patientName: "John Doe",
      dateTime: "09 Jan 2025, 8am",
      patientImage: require("../../../assets/doctors/chandru.png"),
    },
    {
      id: "5",
      patientName: "Jane Smith",
      dateTime: "05 Jan 2025, 10am",
      patientImage: require("../../../assets/doctors/chandru.png"),
    },
  ])

  const scrollX = useRef(new Animated.Value(0)).current
  const buttonScale = useRef(new Animated.Value(1)).current
  const router = useRouter()
  const [selectedRecent, setSelectedRecent] = useState(null)
  const [detailsVisible, setDetailsVisible] = useState(false)
  const [cancelAlertVisible, setCancelAlertVisible] = useState(false)
  const [finalCancelAlertVisible, setFinalCancelAlertVisible] = useState(false)
  const [successAlertVisible, setSuccessAlertVisible] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedMenuAppointment, setSelectedMenuAppointment] = useState(null);

  const onPressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start()
  }

  const onPressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      useNativeDriver: true,
    }).start()
  }

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

  const renderPagination = () => {
    return (
      <View style={styles.pagination}>
        {upcomingAppointments.map((_, index) => {
          const inputRange = [(index - 1) * TOTAL_WIDTH, index * TOTAL_WIDTH, (index + 1) * TOTAL_WIDTH]

          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [8, 16, 8], // Active dot is wider
            extrapolate: "clamp",
          })

          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: "clamp",
          })

          return <Animated.View key={index} style={[styles.paginationDot, { width: dotWidth, opacity }]} />
        })}
      </View>
    )
  }

  const handleCancelAppointment = async (appointmentId) => {
    try {
      // Make API call to cancel appointment
      const response = await fetch(`your-api-endpoint/appointments/${appointmentId}`, {
        method: 'DELETE',
        // ...your headers and other config
      });

      if (response.ok) {
        // Remove the cancelled appointment from state
        setUpcomingAppointments(prevAppointments => 
          prevAppointments.filter(apt => apt.id !== appointmentId)
        );
        // Show success message
        Alert.alert('Success', 'Appointment cancelled successfully');
      }
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      Alert.alert('Error', 'Failed to cancel appointment');
    }
  };

  const handleMenuOption = (option) => {
    switch (option) {
      case 'download':
        Alert.alert('Download', 'Downloading appointment report...');
        break;
      case 'share':
        Share.share({
          message: `Appointment details for ${selectedMenuAppointment?.patientName} on ${selectedMenuAppointment?.dateTime}`,
        });
        break;
      case 'delete':
        Alert.alert(
          'Delete Record',
          'Are you sure you want to delete this appointment record?',
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'Delete',
              style: 'destructive',
              onPress: () => {
                setRecentAppointments(prev => 
                  prev.filter(apt => apt.id !== selectedMenuAppointment?.id)
                );
              },
            },
          ]
        );
        break;
    }
    setMenuVisible(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.pageTitle}>Appointments</Text>
      </View>
      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Latest Appointment</Text>
          <Animated.ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            scrollEventThrottle={16}
            decelerationRate={0.9}
            snapToInterval={TOTAL_WIDTH}
            snapToAlignment="start"
            contentContainerStyle={{
              paddingLeft: 10,
              paddingRight: 10,
            }}
            onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: false })}
            scrollEnabled={true}
          >
            {upcomingAppointments.map((appointment, index) => (
              <View
                key={appointment.id}
                style={{ width: CARD_WIDTH, marginRight: index === upcomingAppointments.length - 1 ? 0 : CARD_GAP }}
              >
                <AppointmentCard
                  appointment={appointment}
                  onPressIn={onPressIn}
                  onPressOut={onPressOut}
                  buttonScale={buttonScale}
                  onCancelAppointment={handleCancelAppointment}
                />
              </View>
            ))}
          </Animated.ScrollView>

          {renderPagination()}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Appointments</Text>
          {recentAppointments.map((appointment) => (
            <Animated.View
              key={appointment.id}
              style={[styles.recentAppointmentCard, { transform: [{ scale: buttonScale }] }]}
            >
              <Image style={styles.patientImage} source={appointment.patientImage} />
              <View style={styles.appointmentDetails}>
                <Text style={styles.patientName}>{appointment.patientName}</Text>
                <Text style={styles.appointmentDateTime}>{appointment.dateTime}</Text>
              </View>
              <TouchableOpacity
                style={styles.viewButtonContainer}
                onPress={() => {
                  setSelectedRecent(appointment)
                  setDetailsVisible(true)
                }}
              >
                <LinearGradient
                  colors={[
                    "#4C35E3", // Rich indigo
                    "#3B39E4", // Deep blue
                    "#4B47E5", // Royal blue
                    "#5465FF", // Bright blue
                    "#6983FF", // Light blue
                  ]}
                  start={{ x: -0.2, y: 0 }}
                  end={{ x: 1.2, y: 1 }}
                  style={styles.viewButton}
                >
                  <Text style={styles.viewButtonText}>View</Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setSelectedMenuAppointment(appointment);
                  setMenuVisible(true);
                }}
              >
                <Icon name="more-vert" size={24} color="#666666" />
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      </ScrollView>

      <RecentAppointmentDetails
        visible={detailsVisible}
        onClose={() => {
          setDetailsVisible(false)
          setSelectedRecent(null)
        }}
        appointment={selectedRecent}
      />
      <AppointmentOptionsMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        onOption={handleMenuOption}
      />
    </View>
  )
}

const additionalStyles = {
  customReminderContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxWidth: 340,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  customReminderTitle: {
    fontSize: 18,
    color: '#1a365d',
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 16,
    textAlign: 'center',
  },
  reminderInputContainer: {
    marginBottom: 20,
  },
  reminderInput: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    marginBottom: 12,
  },
  timeUnitSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  timeUnitButton: {
    flex: 1,
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  timeUnitButtonActive: {
    backgroundColor: '#4C35E3',
    borderColor: '#4C35E3',
  },
  timeUnitText: {
    color: '#64748b',
    fontFamily: 'Inter_500Medium',
  },
  timeUnitTextActive: {
    color: '#fff',
  },
  reminderActionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  reminderButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#4C35E3',
  },
  reminderButtonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#4C35E3',
  },
  reminderButtonText: {
    color: '#fff',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
  },
  reminderButtonTextOutline: {
    color: '#4C35E3',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
  },
  remindersList: {
    marginTop: 12,
    marginBottom: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  reminderChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 16,
    gap: 4,
  },
  reminderChipText: {
    fontSize: 12,
    color: '#1a365d',
    fontFamily: 'Inter_500Medium',
  },
  reminderDivider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 8,
  },
  countdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    topborderRadius: 12,
    backgroundColor: '#EEF2FF',
    paddingVertical: 4,
    paddingHorizontal: 8,
    alignSelf: 'flex-start',
    marginBottom: 12,
    gap: 4,
  },
  reminderButtonContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    alignItems: 'center',
  },
  reminderButtonGradient: {
    borderRadius: 20,
    padding: 4,
  },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: Platform.OS === "ios" ? 20 : StatusBar.currentHeight,
  },
  titleContainer: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
    marginTop: Platform.OS === "ios" ? 0 : 0,
  },
  pageTitle: {
    fontSize: 32,
    fontFamily: "Inter_700Bold",
    color: "#1A1A1A",
    textAlign: "center",
    letterSpacing: 0.5,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 20,
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 18,
    color: "#1a365d",
    fontFamily: "Inter_600SemiBold",
    marginBottom: 12,
  },
  appointmentCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
      },
      android: {
        elevation: 5,
      },
    }),
    marginBottom: 20,
    width: CARD_WIDTH,
  },
  cardHeader: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    position: "relative",
    overflow: "hidden",
    shadowColor: "#4C35E3",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  gradientOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.7,
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  shineEffect: {
    position: "absolute",
    top: -200,
    left: -200,
    right: -200,
    height: 400,
    transform: [{ rotate: "45deg" }],
    opacity: 0.1,
  },
  headerContent: {
    width: "100%",
    gap: 8,
  },
  cardTitle: {
    fontSize: 13,
    color: "#FFFFFF99",
    fontFamily: "Inter_600SemiBold",
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  dateTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateTime: {
    color: '#fff',
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 0.3,
  },
  reminderButton: {
    position: "absolute",
    right: 0,
    top: 0,
    padding: 8,
  },
  reminderIndicator: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fff',
  },
  cardContent: {
    padding: 16,
    backgroundColor: "#fff",
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  doctorInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  doctorImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  doctorDetails: {
    flex: 1,
    marginLeft: 15,
  },
  doctorName: {
    fontSize: 18,
    color: "#333333",
    fontFamily: "Inter_600SemiBold",
  },
  specialization: {
    fontSize: 14,
    color: "#666666",
    fontFamily: "Inter_400Regular",
  },
  infoButton: {
    width: 25,
    height: 25,
    borderRadius: 16,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    marginTop: 12,
    marginBottom: 16,
  },
  viewButtonContainer: {
    flex: 1,
    height: 42,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#4C35E3',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  cancelButtonContainer: {
    flex: 1,
    height: 42,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#FF0033',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  viewButton: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.5,
  },
  recentAppointmentCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 16,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  patientImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  appointmentDetails: {
    flex: 1,
    marginLeft: 15,
  },
  patientName: {
    fontSize: 18,
    color: "#1A1A1A",
    fontFamily: "Inter_600SemiBold",
  },
  appointmentDateTime: {
    fontSize: 14,
    color: "#666666",
    fontFamily: "Inter_400Regular",
  },
  viewButtonText: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.5,
    textShadowColor: "rgba(0, 0, 0, 0.1)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 6,
    backgroundColor: "#007AFF",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "white",
  },
  statusDotUpcoming: {
    backgroundColor: "#4CAF50", // Green for upcoming
    shadowColor: "#4CAF50",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 3,
  },
  statusDotUrgent: {
    backgroundColor: "#FF4444", // Red for current/urgent
    shadowColor: "#FF4444",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 3,
  },
  timeReachedContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 68, 68, 0.2)", // Light red background
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  timeReachedText: {
    color: "#FF4444", // Red text
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  rescheduleButtonContainer: {
    ...Platform.select({
      ios: {
        shadowColor: "#4C35E3",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 5,
      },
    }),
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
  modalHeaderGradient: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    flexDirection: "row",
    alignItems: "center",
    minHeight: 80,
  },
  modalHeaderTitle: {
    color: "#fff",
    fontSize: 22,
    fontFamily: "Inter_600SemiBold",
    marginLeft: 32,
    flex: 1,
    textAlign: "center",
    marginRight: 48,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    width: '100%',
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 10
      },
      android: {
        elevation: 10
      }
    })
  },
  modalContent: {
    padding: 16,
    paddingBottom: 32
  },
  sectionTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  prescriptionActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  actionButton: {
    padding: 4,
  },
  prescriptionText: {
    fontSize: 14,
    color: "#1a365d",
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
  },
  pdfPreview: {
    alignItems: "center",
    padding: 20,
  },
  pdfText: {
    fontSize: 16,
    color: "#1a365d",
    fontFamily: "Inter_600SemiBold",
    marginTop: 12,
  },
  pdfNote: {
    fontSize: 12,
    color: "#64748b",
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    marginTop: 8,
    fontStyle: "italic",
  },
  appointmentSection: {
    marginBottom: 24,
  },
  appointmentDate: {
    fontSize: 24,
    color: "#1a365d",
    fontFamily: "Inter_700Bold",
  },
  patientSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  modalPatientImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  patientInfo: {
    marginLeft: 16,
  },
  patientName: {
    fontSize: 18,
    color: "#1a365d",
    fontFamily: "Inter_600SemiBold",
  },
  appointmentType: {
    fontSize: 14,
    color: "#64748b",
    fontFamily: "Inter_400Regular",
  },
  divider: {
    height: 1,
    backgroundColor: "#f1f5f9",
    marginVertical: 16,
  },
  notesSection: {
    marginTop: 8,
  },
  noteCard: {
    backgroundColor: "#f8fafc",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  noteText: {
    fontSize: 14,
    color: "#1a365d",
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
    marginBottom: 16,
  },
  vitalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
  },
  vitalItem: {
    alignItems: "center",
  },
  vitalLabel: {
    fontSize: 12,
    color: "#64748b",
    fontFamily: "Inter_500Medium",
    marginBottom: 4,
  },
  vitalValue: {
    fontSize: 14,
    color: "#1a365d",
    fontFamily: "Inter_600SemiBold",
  },
  prescriptionSection: {
    marginTop: 8,
  },
  prescriptionCard: {
    backgroundColor: "#f8fafc",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  medicineItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  medicineInfo: {
    flex: 1,
    marginLeft: 12,
  },
  medicineName: {
    fontSize: 15,
    color: "#1a365d",
    fontFamily: "Inter_600SemiBold",
    marginBottom: 4,
  },
  medicineInstructions: {
    fontSize: 13,
    color: "#64748b",
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
  },
  receiptSection: {
    marginTop: 8,
  },
  receiptCard: {
    backgroundColor: "#f8fafc",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  receiptRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  receiptLabel: {
    fontSize: 14,
    color: "#64748b",
    fontFamily: "Inter_400Regular",
  },
  receiptAmount: {
    fontSize: 14,
    color: "#1a365d",
    fontFamily: "Inter_500Medium",
  },
  totalLabel: {
    fontSize: 16,
    color: "#1a365d",
    fontFamily: "Inter_600SemiBold",
  },
  totalAmount: {
    fontSize: 16,
    color: "#1a365d",
    fontFamily: "Inter_700Bold",
  },
  paymentMethod: {
    fontSize: 13,
    color: "#64748b",
    fontFamily: "Inter_400Regular",
    textAlign: "right",
    marginTop: 8,
  },
  followupSection: {
    marginTop: 8,
  },
  followupCard: {
    backgroundColor: "#f8fafc",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  followupText: {
    fontSize: 14,
    color: "#1a365d",
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 8,
    width: '80%',
    maxWidth: 300,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
    borderRadius: 8,
  },
  menuItemText: {
    fontSize: 16,
    color: '#1a365d',
    fontFamily: 'Inter_500Medium',
  },
  menuItemDanger: {
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  menuItemTextDanger: {
    color: '#FF4444',
  },
  reminderContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 8,
    width: '80%',
    maxWidth: 300,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  reminderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
    borderRadius: 8,
  },
  reminderText: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
  },
  reminderDivider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 8,
  },
  ...additionalStyles,
})

export default AppointmentsScreen;