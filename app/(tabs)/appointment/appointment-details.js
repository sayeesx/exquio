import React, { useState } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, Dimensions, Linking, Alert, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useFonts, Inter_700Bold, Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';

const { width } = Dimensions.get('window');

const BackButton = () => {
    const router = useRouter();
    
    const handleBack = () => {
        // Navigate back to the appointments index page
        router.push("/appointment");
        // Alternative approaches:
        // router.back();
        // router.push("/(tabs)/appointment");
    };
    
    return (
        <TouchableOpacity 
            style={styles.backButton}
            onPress={handleBack}
            activeOpacity={0.7}
        >
            <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
    );
};

const handleCallHospital = () => {
    const hospitalNumber = '+1234567890';
    Alert.alert(
        'Call Hospital',
        'Would you like to call Aster Hospital?',
        [
            {
                text: 'Cancel',
                style: 'cancel'
            },
            {
                text: 'Call',
                onPress: () => Linking.openURL(`tel:${hospitalNumber}`)
            }
        ]
    );
};

const CustomAlert = ({ visible, onClose }) => {
    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.alertContainer}>
                    <View style={styles.alertContent}>
                        <Text style={styles.alertTitle}>Feature Coming Soon!</Text>
                        <Text style={styles.alertMessage}>
                            The reschedule feature is not available at the moment. We're working on it and it will be available soon.
                        </Text>
                        <TouchableOpacity
                            style={styles.alertButton}
                            onPress={onClose}
                        >
                            <Text style={styles.alertButtonText}>OK</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const CancelAlert = ({ visible, onClose, onConfirm }) => {
    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.alertContainer}>
                    <View style={styles.alertContent}>
                        <Text style={styles.alertTitle}>Cancel Appointment?</Text>
                        <Text style={styles.alertMessage}>
                            Are you sure you want to cancel this appointment? Please note that the appointment fee is non-refundable once cancelled.
                        </Text>
                        <View style={styles.alertButtonsContainer}>
                            <TouchableOpacity
                                style={[styles.alertButton, styles.alertButtonOutline]}
                                onPress={onClose}
                            >
                                <Text style={[styles.alertButtonText, styles.alertButtonTextOutline]}>
                                    NO, KEEP IT
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.alertButton, styles.alertButtonDanger]}
                                onPress={onConfirm}
                            >
                                <Text style={styles.alertButtonText}>YES, CANCEL</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const AppointmentDetailsScreen = () => {
    const router = useRouter();
    const params = useLocalSearchParams();
    const [alertVisible, setAlertVisible] = useState(false);
    const [cancelAlertVisible, setCancelAlertVisible] = useState(false);

    let [fontsLoaded] = useFonts({
        Inter_700Bold,
        Inter_400Regular,
        Inter_500Medium,
        Inter_600SemiBold,
    });

    if (!fontsLoaded) {
        return <View><Text>Loading...</Text></View>;
    }

    const handleCancelConfirm = () => {
        setCancelAlertVisible(false);
        // Add your cancel appointment logic here
    };

    return (
        <View style={styles.container}>
            <CustomAlert 
                visible={alertVisible} 
                onClose={() => setAlertVisible(false)} 
            />
            <CancelAlert 
                visible={cancelAlertVisible}
                onClose={() => setCancelAlertVisible(false)}
                onConfirm={handleCancelConfirm}
            />
            <LinearGradient
                colors={[
                    '#4C35E3',  // Rich indigo
                    '#3B39E4',  // Deep blue
                    '#4B47E5',  // Royal blue
                    '#5465FF',  // Bright blue
                    '#6983FF',  // Light blue
                    '#7B9EF3',  // Sky blue
                    '#83A8FF'   // Soft blue
                ]}
                start={{ x: -0.3, y: 0.2 }}
                end={{ x: 1.3, y: 0.8 }}
                locations={[0, 0.15, 0.3, 0.5, 0.7, 0.85, 1]}
                style={styles.gradientBackground}
            >
                <View style={styles.gradientOverlay}>
                    <LinearGradient
                        colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0)']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.shineEffect}
                    />
                </View>
                <View style={styles.header}>
                    <BackButton />
                    <Text style={styles.headerTitle}>Appointment Request</Text>
                    <TouchableOpacity 
                        style={styles.hospitalCallButton}
                        onPress={handleCallHospital}
                        activeOpacity={0.7}
                    >
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
                                <Image
                                    source={require('../../../assets/doctors/chandru.png')}
                                    style={styles.doctorImage}
                                />
                            </View>
                            <View style={styles.logoContainer}>
                                <Image
                                    source={require('../../../assets/hospital-logos/aster.png')}
                                    style={styles.hospitalLogo}
                                />
                            </View>
                        </View>
                        <View style={styles.nameSection}>
                            <Text style={styles.name}>Louis Patterson</Text>
                            <Text style={styles.hospitalName}>Aster Hospital</Text>
                        </View>
                    </View>

                    <View style={styles.commentSection}>
                        <Text style={styles.commentLabel}>Comment:</Text>
                        <Text style={styles.commentText}>
                            Hello Dr. Peterson, Please ensure you bring all relevant medical reports for a comprehensive evaluation. Additionally, arrive punctually for your scheduled consultation to facilitate a smooth and efficient visit with the doctor. Your cooperation is greatly appreciated.
                        </Text>
                    </View>

                    <TouchableOpacity style={styles.documentCard}>
                        <Icon name="description" size={24} color="#3b82f6" />
                        <View style={styles.documentInfo}>
                            <Text style={styles.documentName}>Payment Receipt</Text>
                            <Text style={styles.documentAmount}>$150.00</Text>
                            <Text style={styles.documentDate}>06 Mar 2020</Text>
                        </View>
                    </TouchableOpacity>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity 
                            style={styles.rescheduleButtonContainer}
                            onPress={() => setAlertVisible(true)}
                        >
                            <LinearGradient
                                colors={[
                                    '#6236FF',  // Vibrant purple
                                    '#4C35E3',  // Rich indigo
                                    '#3B39E4',  // Deep blue
                                    '#4B47E5',  // Royal blue
                                    '#5465FF',  // Bright blue
                                    '#6983FF',  // Light blue
                                ]}
                                start={{ x: -0.2, y: 0 }}
                                end={{ x: 1.2, y: 1 }}
                                locations={[0, 0.2, 0.4, 0.6, 0.8, 1]}
                                style={styles.rescheduleButton}
                            >
                                <Text style={styles.rescheduleButtonText}>RESCHEDULE</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={styles.cancelButtonContainer}
                            onPress={() => setCancelAlertVisible(true)}
                        >
                            <LinearGradient
                                colors={[
                                    '#FF0000',  // Pure red
                                    '#FF1111',  // Bright red
                                    '#FF2222',  // Intense red
                                    '#FF3333',  // Strong red
                                    '#FF4444',  // Vibrant red
                                    '#FF5555'   // Light red
                                ]}
                                start={{ x: -0.3, y: 0 }}
                                end={{ x: 1.3, y: 1 }}
                                locations={[0, 0.2, 0.4, 0.6, 0.8, 1]}
                                style={styles.cancelButton}
                            >
                                <Text style={styles.cancelButtonText}>CANCEL</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    gradientBackground: {
        paddingTop: 40,
        paddingBottom: 120,
        borderBottomLeftRadius: 60,
        borderBottomRightRadius: 60,
        shadowColor: '#4C35E3',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.4,
        shadowRadius: 24,
        elevation: 15,
        position: 'relative',
        overflow: 'hidden',
    },
    gradientOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity: 0.7,
        backgroundColor: 'rgba(255,255,255,0.03)',
    },
    shineEffect: {
        position: 'absolute',
        top: -200,
        left: -200,
        right: -200,
        height: 400,
        transform: [{ rotate: '45deg' }],
        opacity: 0.1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        marginBottom: 30,
    },
    backButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    headerTitle: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'Inter_600SemiBold',
        letterSpacing: 0.5,
        opacity: 0.9,
    },
    hospitalCallButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    dateTimeSection: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
        marginTop: 10,
    },
    date: {
        fontSize: 32,
        color: '#fff',
        fontFamily: 'Inter_600SemiBold',
        textAlign: 'center',
        textShadowColor: 'rgba(0, 0, 0, 0.1)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 10,
    },
    time: {
        fontSize: 32,
        color: '#fff',
        fontFamily: 'Inter_600SemiBold',
        marginTop: 4,
        textAlign: 'center',
        textShadowColor: 'rgba(0, 0, 0, 0.1)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 10,
    },
    contentContainer: {
        flex: 1,
        backgroundColor: '#fff',
        marginTop: -60,
        borderTopLeftRadius: 60,
        borderTopRightRadius: 60,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 20,
    },
    contentInner: {
        padding: 30,
    },
    profileSection: {
        alignItems: 'center',
        marginBottom: 30,
    },
    profileRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 15,
        gap: 40,
    },
    doctorImageContainer: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 5,
    },
    doctorImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 3,
        borderColor: '#fff',
    },
    logoContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    hospitalLogo: {
        width: 80,
        height: 80,
        resizeMode: 'contain',
    },
    nameSection: {
        alignItems: 'center',
    },
    name: {
        fontSize: 24,
        color: '#1a365d',
        fontFamily: 'Inter_700Bold',
        textAlign: 'center',
    },
    hospitalName: {
        fontSize: 16,
        color: '#64748b',
        fontFamily: 'Inter_500Medium',
        marginTop: 4,
    },
    commentSection: {
        marginBottom: 24,
    },
    commentLabel: {
        fontSize: 14,
        color: '#64748b',
        marginBottom: 8,
        fontFamily: 'Inter_500Medium',
    },
    commentText: {
        fontSize: 16,
        color: '#1a365d',
        lineHeight: 24,
        fontFamily: 'Inter_400Regular',
    },
    documentCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        padding: 20,
        borderRadius: 20,
        marginBottom: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    documentInfo: {
        marginLeft: 16,
    },
    documentName: {
        fontSize: 16,
        color: '#1a365d',
        fontFamily: 'Inter_500Medium',
    },
    documentAmount: {
        fontSize: 18,
        color: '#16a34a',
        fontFamily: 'Inter_700Bold',
        marginTop: 4,
    },
    documentDate: {
        fontSize: 14,
        color: '#64748b',
        marginTop: 4,
        fontFamily: 'Inter_400Regular',
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 16,
        paddingHorizontal: 20,
        paddingBottom: 30,
        marginTop: 'auto',
    },
    rescheduleButtonContainer: {
        flex: 1,
        height: 48,
        borderRadius: 16,
        shadowColor: '#4C35E3',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 8,
        overflow: 'hidden',
    },
    rescheduleButton: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    rescheduleButtonText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'Inter_700Bold',
        letterSpacing: 0.5,
        textShadowColor: 'rgba(0, 0, 0, 0.1)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    cancelButtonContainer: {
        flex: 1,
        height: 48,
        borderRadius: 16,
        shadowColor: '#FF0000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 8,
        elevation: 8,
        overflow: 'hidden',
    },
    cancelButton: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'Inter_700Bold',
        letterSpacing: 0.5,
        textShadowColor: 'rgba(0, 0, 0, 0.1)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    alertContainer: {
        width: '85%',
        backgroundColor: '#fff',
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
    },
    alertContent: {
        padding: 24,
        alignItems: 'center',
    },
    alertTitle: {
        color: '#1a365d',
        fontSize: 22,
        fontFamily: 'Inter_700Bold',
        marginBottom: 12,
        textAlign: 'center',
    },
    alertMessage: {
        color: '#64748b',
        fontSize: 16,
        fontFamily: 'Inter_400Regular',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 22,
    },
    alertButton: {
        backgroundColor: '#4C35E3',
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 12,
        shadowColor: '#4C35E3',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    alertButtonText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'Inter_600SemiBold',
        letterSpacing: 0.5,
    },
    alertButtonsContainer: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
    },
    alertButtonOutline: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#4C35E3',
    },
    alertButtonTextOutline: {
        color: '#4C35E3',
    },
    alertButtonDanger: {
        backgroundColor: '#FF0000',
        shadowColor: '#FF0000',
    },
});

export default AppointmentDetailsScreen;