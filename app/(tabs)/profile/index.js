"use client"
import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Platform, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../../lib/supabase';
import { LinearGradient } from 'expo-linear-gradient';
import AlertModal from '../../../components/AlertModal';
import { useAuth } from '../../auth/context/AuthContext';

// Add unprotectedRoutes array at the top
const unprotectedRoutes = ['/auth/login', '/intro'];

export default function Profile() {
  const router = useRouter();
  const { user: authUser, loading } = useAuth();
  const [user, setUser] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Update the checkAuth function
  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user && !unprotectedRoutes.includes(router.pathname)) {
        router.replace('/auth/login');
        return false;
      }
      return true;
    } catch (error) {
      console.error('Auth check error:', error);
      router.replace('/auth/login');
      return false;
    }
  };

  // Modify the useEffect
  useEffect(() => {
    if (!loading && !authUser) {
      router.replace('/auth/login');
      return;
    }
    
    if (authUser) {
      fetchUserProfile();
    }
  }, [authUser, loading]);

  const fetchUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (error) throw error;
        setUser({
          ...data,
          email: data.email || 'Not provided',
          phone_number: data.phone_number || 'Not provided',
          full_name: data.full_name || 'User'
        });
      }
    } catch (error) {
      setErrorMessage('Error fetching profile data');
      setShowErrorModal(true);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setShowSuccessModal(true);
      setTimeout(() => {
        setShowSuccessModal(false);
        router.replace('/intro');
      }, 1500);
    } catch (error) {
      setErrorMessage('Error logging out');
      setShowErrorModal(true);
    }
  };

  const renderSection = (title, items) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {items.map((item, index) => (
        <TouchableOpacity 
          key={index}
          style={styles.item}
          onPress={item.onPress}
        >
          <Ionicons name={item.icon} size={24} color="#4C35E3" />
          <Text style={styles.itemText}>{item.title}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderProfileInfo = () => (
    <View style={styles.profileInfo}>
      <Text style={styles.name}>{user?.full_name}</Text>
      <Text style={styles.contact}>
        {user?.phone_number ? user.phone_number : user?.email}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#4C35E3", "#5465FF", "#6983FF"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientHeader}
      >
        <View style={styles.header}>
          <Image 
            source={user?.avatar_url ? { uri: user.avatar_url } : require('../../../assets/profile.png')}
            style={styles.avatar}
          />
          {renderProfileInfo()}
          <TouchableOpacity 
            style={styles.settingsButton}
            onPress={() => router.push('/(tabs)/profile/editProfile')}
          >
            <Ionicons name="settings-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {renderSection('General', [{
          title: 'My Appointments',
          icon: 'calendar-outline',
          onPress: async () => {
            const isAuthed = await checkAuth();
            if (isAuthed) {
              router.push('/(tabs)/appointment/index');
            }
          }
        }])}

        {renderSection('Account Setting', [
          {
            title: 'Payment Methods',
            icon: 'card-outline',
            onPress: () => router.push('/payment-methods')
          },
          {
            title: 'Logout',
            icon: 'log-out-outline',
            onPress: () => setShowLogoutConfirm(true)
          }
        ])}

        {renderSection('App Setting', [
          {
            title: 'Language',
            icon: 'language-outline',
            onPress: () => router.push('/language')
          },
          {
            title: 'Notifications',
            icon: 'notifications-outline',
            onPress: () => router.push('/notifications')
          },
          {
            title: 'Security',
            icon: 'shield-outline',
            onPress: () => router.push('/security')
          }
        ])}

        {renderSection('Support', [{
          title: 'Help Center',
          icon: 'help-circle-outline',
          onPress: () => router.push('/help')
        }])}
      </View>

      <AlertModal
        visible={showLogoutConfirm}
        type="warning"
        title="Confirm Logout"
        message="Are you sure you want to logout?"
        confirmText="Logout"
        cancelText="Cancel"
        showCancel={true}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
      />

      <AlertModal
        visible={showSuccessModal}
        type="success"
        title="Success"
        message="You have been logged out successfully"
        onClose={() => setShowSuccessModal(false)}
      />

      <AlertModal
        visible={showErrorModal}
        type="error"
        title="Error"
        message={errorMessage}
        onClose={() => setShowErrorModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  gradientHeader: {
    paddingTop: Platform.OS === "ios" ? 50 : StatusBar.currentHeight + 10,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 10,
  },
  phone: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  settingsButton: {
    position: 'absolute',
    right: 20,
    top: 0,
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  content: {
    flex: 1,
    marginTop: -20,
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 30,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a365d',
    marginBottom: 10,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  itemText: {
    marginLeft: 15,
    fontSize: 16,
    color: '#1a365d',
    flex: 1,
  },
  profileInfo: {
    alignItems: 'center',
  },
  contact: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
});
