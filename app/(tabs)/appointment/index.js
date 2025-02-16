import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image, Animated, Pressable, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, Inter_700Bold, Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85; // Adjusted Card width
const CARD_GAP = 15;  // Adjusted gap between cards
const TOTAL_WIDTH = CARD_WIDTH + CARD_GAP; // Total width including gap

const AppointmentStatus = ({ dateTime }) => {
    const [isTime, setIsTime] = useState(false);

    useEffect(() => {
        const checkTime = () => {
            const appointmentTime = new Date(dateTime).getTime();
            const now = new Date().getTime();
            setIsTime(now >= appointmentTime);
        };

        const timer = setInterval(checkTime, 1000);
        checkTime();

        return () => clearInterval(timer);
    }, [dateTime]);

    return (
        <View style={styles.statusContainer}>
            <View style={[
                styles.statusDot, 
                isTime ? styles.statusDotUrgent : styles.statusDotUpcoming
            ]} />
            {isTime && (
                <View style={styles.timeReachedContainer}>
                    <Icon name="access-time-filled" size={14} color="#FF4444" />
                    <Text style={styles.timeReachedText}>Current</Text>
                </View>
            )}
        </View>
    );
};

const AppointmentCard = ({ appointment, onPressIn, onPressOut, buttonScale }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const router = useRouter();

    React.useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start();
    }, [fadeAnim]);

    return (
        <Animated.View style={[styles.appointmentCard, { opacity: fadeAnim }]}>
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
                style={styles.cardHeader}
            >
                <View style={styles.gradientOverlay}>
                    <LinearGradient
                        colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0)']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.shineEffect}
                    />
                </View>
                <View style={styles.headerContent}>
                    <Text style={styles.cardTitle}>Upcoming Appointment</Text>
                    <View style={styles.headerRow}>
                        <View style={styles.dateTimeWrapper}>
                            <View style={styles.dateTimeContainer}>
                                <Icon name="event" size={16} color="#fff" />
                                <Text style={styles.dateTime}>{appointment.dateTime}</Text>
                            </View>
                        </View>
                        <AppointmentStatus dateTime={appointment.dateTime} />
                    </View>
                </View>
            </LinearGradient>

            <View style={styles.cardContent}>
                <View style={styles.doctorInfo}>
                    <Image
                        style={styles.doctorImage}
                        source={appointment.doctorImage}
                    />
                    <View style={styles.doctorDetails}>
                        <Text style={styles.doctorName}>{appointment.doctorName}</Text>
                        <Text style={styles.specialization}>{appointment.specialization}</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.infoButton}
                        onPressIn={onPressIn}
                        onPressOut={onPressOut}
                    >
                        <Icon name="info" size={16} color="#fff" />
                    </TouchableOpacity>
                </View>

                <View style={styles.actionButtons}>
                    <Pressable
                        style={styles.acceptButtonContainer}
                        onPressIn={onPressIn}
                        onPressOut={onPressOut}
                        onPress={() => router.push({
                            pathname: "/appointment/appointment-details",
                            params: {
                                date: appointment.dateTime,
                                doctorName: appointment.doctorName,
                                specialization: appointment.specialization
                            }
                        })}
                    >
                        <LinearGradient
                            colors={[
                                '#4C35E3',  // Rich indigo
                                '#3B39E4',  // Deep blue
                                '#4B47E5',  // Royal blue
                                '#5465FF',  // Bright blue
                                '#6983FF',  // Light blue
                            ]}
                            start={{ x: -0.2, y: 0 }}
                            end={{ x: 1.2, y: 1 }}
                            style={styles.acceptButton}
                        >
                            <Text style={styles.acceptButtonText}>VIEW</Text>
                        </LinearGradient>
                    </Pressable>
                    <Pressable
                        style={styles.cancelButtonContainer}
                        onPressIn={onPressIn}
                        onPressOut={onPressOut}
                    >
                        <LinearGradient
                            colors={[
                                '#FF0033',  // More saturated deep red
                                '#FF1744',  // Vibrant red
                                '#FF3366',  // Bright red
                                '#FF4D4D',  // Strong red
                                '#FF6666'   // Light red
                            ]}
                            start={{ x: -0.2, y: 0 }}
                            end={{ x: 1.2, y: 1 }}
                            style={styles.cancelButton}
                        >
                            <Text style={styles.cancelButtonText}>CANCEL</Text>
                        </LinearGradient>
                    </Pressable>
                </View>
            </View>
        </Animated.View>
    );
};

const AppointmentsScreen = () => {
    const [upcomingAppointments, setUpcomingAppointments] = useState([
        {
            id: '1',
            dateTime: '12 Jan 2025, 8am',
            doctorName: 'Dr. Sarah Johnson',
            specialization: 'Cardiology',
            doctorImage: require('../../../assets/doctors/chandru.png'),
        },
        {
            id: '2',
            dateTime: '15 Jan 2025, 10am',
            doctorName: 'Dr. Michael Smith',
            specialization: 'Neurology',
            doctorImage: require('../../../assets/doctors/chandru.png'),
        },
        {
            id: '3',
            dateTime: '18 Jan 2025, 2pm',
            doctorName: 'Dr. Emily White',
            specialization: 'Dermatology',
            doctorImage: require('../../../assets/doctors/chandru.png'),
        },
    ]);

    const [recentAppointments, setRecentAppointments] = useState([
        {
            id: '4',
            patientName: 'John Doe',
            dateTime: '09 Jan 2025, 8am',
            patientImage: require('../../../assets/doctors/chandru.png'),
        },
        {
            id: '5',
            patientName: 'Jane Smith',
            dateTime: '05 Jan 2025, 10am',
            patientImage: require('../../../assets/doctors/chandru.png'),
        },
    ]);

    const scrollX = useRef(new Animated.Value(0)).current;
    const buttonScale = useRef(new Animated.Value(1)).current;
    const router = useRouter();

    const onPressIn = () => {
        Animated.spring(buttonScale, {
            toValue: 0.95,
            useNativeDriver: true,
        }).start();
    };

    const onPressOut = () => {
        Animated.spring(buttonScale, {
            toValue: 1,
            useNativeDriver: true,
        }).start();
    };

    let [fontsLoaded] = useFonts({
        Inter_700Bold,
        Inter_400Regular,
        Inter_500Medium,
        Inter_600SemiBold,
    });

    if (!fontsLoaded) {
        return <View><Text>Loading...</Text></View>;
    }

    const renderPagination = () => {
        return (
            <View style={styles.pagination}>
                {upcomingAppointments.map((_, index) => {
                    const inputRange = [
                        (index - 1) * TOTAL_WIDTH,
                        index * TOTAL_WIDTH,
                        (index + 1) * TOTAL_WIDTH,
                    ];

                    const dotWidth = scrollX.interpolate({
                        inputRange,
                        outputRange: [8, 16, 8], // Active dot is wider
                        extrapolate: 'clamp',
                    });

                    const opacity = scrollX.interpolate({
                        inputRange,
                        outputRange: [0.3, 1, 0.3],
                        extrapolate: 'clamp',
                    });

                    return (
                        <Animated.View
                            key={index}
                            style={[
                                styles.paginationDot,
                                { width: dotWidth, opacity },
                            ]}
                        />
                    );
                })}
            </View>
        );
    };

    return (
        <LinearGradient
            colors={['#EAF3FF', '#F9FCFF']}
            style={styles.container}
        >
            <LinearGradient
                colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.8)']}
                style={styles.headerContainer}
            >
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Appointments</Text>
                    <TouchableOpacity style={styles.calendarButton}>
                        <Icon name="calendar-today" size={24} color="#1A1A1A" style={styles.calendarIcon} />
                    </TouchableOpacity>
                </View>
            </LinearGradient>

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
                        onScroll={Animated.event(
                            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                            { useNativeDriver: false }
                        )}
                        scrollEnabled={true}
                    >
                        {upcomingAppointments.map((appointment, index) => (
                            <View key={appointment.id} style={{ width: CARD_WIDTH, marginRight: (index === upcomingAppointments.length - 1) ? 0 : CARD_GAP }}>
                                <AppointmentCard
                                    appointment={appointment}
                                    onPressIn={onPressIn}
                                    onPressOut={onPressOut}
                                    buttonScale={buttonScale}
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
                            <Image
                                style={styles.patientImage}
                                source={appointment.patientImage}
                            />
                            <View style={styles.appointmentDetails}>
                                <Text style={styles.patientName}>{appointment.patientName}</Text>
                                <Text style={styles.appointmentDateTime}>{appointment.dateTime}</Text>
                            </View>
                            <TouchableOpacity 
                                style={styles.viewButtonContainer}
                                onPress={() => router.push({
                                    pathname: "/appointment/appointment-details",
                                    params: {
                                        date: appointment.dateTime,
                                        doctorName: appointment.doctorName,
                                        specialization: appointment.specialization
                                    }
                                })}
                            >
                                <LinearGradient
                                    colors={[
                                        '#4C35E3',  // Rich indigo
                                        '#3B39E4',  // Deep blue
                                        '#4B47E5',  // Royal blue
                                        '#5465FF',  // Bright blue
                                        '#6983FF',  // Light blue
                                    ]}
                                    start={{ x: -0.2, y: 0 }}
                                    end={{ x: 1.2, y: 1 }}
                                    style={styles.viewButton}
                                >
                                    <Text style={styles.viewButtonText}>View</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                            <TouchableOpacity>
                                <Icon name="more-vert" size={24} color="#666666" />
                            </TouchableOpacity>
                        </Animated.View>
                    ))}
                </View>
            </ScrollView>

            <View style={styles.bottomNavigationBar}>
                <TouchableOpacity style={styles.navItem}>
                    <Icon name="local-hospital" size={24} color="#666666" />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.navItem, styles.activeNavItem]}>
                    <Icon name="calendar-today" size={24} color="#007AFF" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem}>
                    <Icon name="home" size={24} color="#666666" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem}>
                    <Icon name="local-pharmacy" size={24} color="#666666" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem}>
                    <Icon name="person" size={24} color="#666666" />
                </TouchableOpacity>
            </View>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerContainer: {
    paddingTop: 40,
    paddingBottom: 4,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E9ECEF",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
    },
    headerTitle: {
        fontSize: 28,
        color: '#1A1A1A',
        fontFamily: 'Inter_700Bold',
    },
    calendarButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    calendarIcon: {
        opacity: 0.8,
    },
    scrollView: {
        flex: 1,
    },
    section: {
        padding: 20,
        alignItems: 'center',
    },
    sectionTitle: {
        fontSize: 22,
        marginBottom: 15,
        color: '#1A1A1A',
        alignSelf: 'flex-start',
        fontFamily: 'Inter_600SemiBold',
    },
    appointmentCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 5,
        marginBottom: 20,
        width: CARD_WIDTH,
    },
    cardHeader: {
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        padding: 16,
        position: 'relative',
        overflow: 'hidden',
        shadowColor: '#4C35E3',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
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
    headerContent: {
        width: '100%',
        gap: 8,
    },
    cardTitle: {
        fontSize: 18,
        color: '#FFFFFF99',
        fontFamily: 'Inter_600SemiBold',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },


    dateTimeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    dateTime: {
        color: '#fff',
        width: '85%',
        fontSize: 25,
        fontFamily: 'Inter_700Bold',
        textAlign: 'left',
        letterSpacing: 1.2,
    },
    menuButton: {
        position: 'absolute',
        right: 0,
        top: 0,
    },
    cardContent: {
        padding: 16,
        backgroundColor: '#fff',
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
    },
    doctorInfo: {
        flexDirection: 'row',
        alignItems: 'center',
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
        color: '#333333',
        fontFamily: 'Inter_600SemiBold',
    },
    specialization: {
        fontSize: 14,
        color: '#666666',
        fontFamily: 'Inter_400Regular',
    },
    infoButton: {
        width: 25,
        height: 25,
        borderRadius: 16,
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        height: 48,
        gap: 16,
    },
    acceptButtonContainer: {
        flex: 1,
        height: 48,
        borderRadius: 28,
        shadowColor: '#4C35E3',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
        overflow: 'hidden',
    },
    acceptButton: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    acceptButtonText: {
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
        borderRadius: 28,
        shadowColor: '#FF0033', // Updated shadow color
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4, // Increased opacity
        shadowRadius: 8,
        elevation: 6,
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
    recentAppointmentCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 16,
        marginBottom: 10,
        shadowColor: '#000',
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
        color: '#1A1A1A',
        fontFamily: 'Inter_600SemiBold',
    },
    appointmentDateTime: {
        fontSize: 14,
        color: '#666666',
        fontFamily: 'Inter_400Regular',
    },
    viewButtonContainer: {
        shadowColor: '#4C35E3',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
        borderRadius: 20,
        overflow: 'hidden',
        marginRight: 15,
    },
    viewButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    viewButtonText: {
        color: '#fff',
        fontSize: 14,
        fontFamily: 'Inter_600SemiBold',
        letterSpacing: 0.5,
        textShadowColor: 'rgba(0, 0, 0, 0.1)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    bottomNavigationBar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.9)',
        height: 60,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    navItem: {
        alignItems: 'center',
    },
    activeNavItem: {},
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },
    paginationDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginHorizontal: 6,
        backgroundColor: '#007AFF',
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: 'white',
    },
    statusDotUpcoming: {
        backgroundColor: '#4CAF50', // Green for upcoming
        shadowColor: '#4CAF50',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
        elevation: 3,
    },
    statusDotUrgent: {
        backgroundColor: '#FF4444', // Red for current/urgent
        shadowColor: '#FF4444',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
        elevation: 3,
    },
    timeReachedContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 68, 68, 0.2)', // Light red background
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    timeReachedText: {
        color: '#FF4444', // Red text
        fontSize: 12,
        fontFamily: 'Inter_500Medium',
    },
});

export default AppointmentsScreen;