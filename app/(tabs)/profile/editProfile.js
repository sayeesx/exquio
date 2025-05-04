import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { TextInput } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../../../lib/supabase';
import AlertModal from '../../../components/AlertModal';

export default function EditProfile() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [profile, setProfile] = useState({
    full_name: '',
    email: '',
    phone: '',
    avatar_url: '',
    gender: '',
    blood_type: '',
    address: '',
    age: '',
  });

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/auth/login');
        return;
      }
      fetchProfile();
    };
    
    checkAuth();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      setProfile({
        full_name: data.full_name || '',
        email: data.email || '',
        phone: data.phone_number || '',
        avatar_url: data.avatar_url || '',
        gender: data.gender || '',
        blood_type: data.blood_type || '',
        address: data.address || '',
        age: data.age?.toString() || ''
      });
    } catch (error) {
      setErrorMessage('Error fetching profile');
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const updates = {
        id: user.id,
        full_name: profile.full_name,
        email: profile.email,
        phone_number: profile.phone,
        gender: profile.gender,
        blood_type: profile.blood_type,
        address: profile.address,
        age: profile.age ? parseInt(profile.age) : null,
        updated_at: new Date()
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(updates);

      if (error) throw error;
      
      setShowSuccessModal(true);
      setTimeout(() => {
        router.back();
      }, 1500);
    } catch (error) {
      setErrorMessage('Error updating profile');
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        setProfile(prev => ({ ...prev, avatar_url: result.assets[0].uri }));
      }
    } catch (error) {
      setErrorMessage('Error picking image');
      setShowErrorModal(true);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#4C35E3", "#5465FF", "#6983FF"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientHeader}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <TouchableOpacity 
            style={styles.saveButton}
            onPress={handleUpdateProfile}
            disabled={loading}
          >
            <Ionicons name="checkmark" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.avatarContainer}>
          <Image
            source={
              profile.avatar_url
                ? { uri: profile.avatar_url }
                : require('../../../assets/profile.png')
            }
            style={styles.avatar}
          />
          <TouchableOpacity onPress={pickImage} style={styles.changePhotoButton}>
            <Ionicons name="camera" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content}>
        <View style={styles.inputContainer}>
          <TextInput
            label="Full Name"
            value={profile.full_name}
            onChangeText={(text) => setProfile(prev => ({ ...prev, full_name: text }))}
            mode="flat"
            style={styles.input}
            theme={{
              colors: {
                primary: '#4C35E3',
                background: '#fff',
                text: '#000',
                placeholder: '#999',
              }
            }}
            textColor="#000"
          />

          <TextInput
            label="Email"
            value={profile.email}
            onChangeText={(text) => setProfile(prev => ({ ...prev, email: text }))}
            mode="flat"
            keyboardType="email-address"
            style={styles.input}
            theme={{
              colors: {
                primary: '#4C35E3',
                background: '#fff',
                text: '#000',
                placeholder: '#999',
              }
            }}
            textColor="#000"
          />

          <TextInput
            label="Phone Number"
            value={profile.phone}
            onChangeText={(text) => setProfile(prev => ({ ...prev, phone: text }))}
            mode="flat"
            keyboardType="phone-pad"
            style={styles.input}
            theme={{
              colors: {
                primary: '#4C35E3',
                background: '#fff',
                text: '#000',
                placeholder: '#999',
              }
            }}
            textColor="#000"
          />

          <TextInput
            label="Gender"
            value={profile.gender}
            onChangeText={(text) => setProfile(prev => ({ ...prev, gender: text }))}
            mode="flat"
            style={styles.input}
            theme={{
              colors: {
                primary: '#4C35E3',
                background: '#fff',
                text: '#000',
                placeholder: '#999',
              }
            }}
            textColor="#000"
          />

          <TextInput
            label="Blood Type"
            value={profile.blood_type}
            onChangeText={(text) => setProfile(prev => ({ ...prev, blood_type: text }))}
            mode="flat"
            style={styles.input}
            theme={{
              colors: {
                primary: '#4C35E3',
                background: '#fff',
                text: '#000',
                placeholder: '#999',
              }
            }}
            textColor="#000"
          />

          <TextInput
            label="Address"
            value={profile.address}
            onChangeText={(text) => setProfile(prev => ({ ...prev, address: text }))}
            mode="flat"
            multiline
            numberOfLines={3}
            style={styles.input}
            theme={{
              colors: {
                primary: '#4C35E3',
                background: '#fff',
                text: '#000',
                placeholder: '#999',
              }
            }}
            textColor="#000"
          />

          <TextInput
            label="Age"
            value={profile.age}
            onChangeText={(text) => setProfile(prev => ({ ...prev, age: text }))}
            mode="flat"
            keyboardType="numeric"
            style={styles.input}
            theme={{
              colors: {
                primary: '#4C35E3',
                background: '#fff',
                text: '#000',
                placeholder: '#999',
              }
            }}
            textColor="#000"
          />
        </View>
      </ScrollView>

      <AlertModal
        visible={showSuccessModal}
        type="success"
        title="Success"
        message="Profile updated successfully"
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
    backgroundColor: '#fff',
  },
  gradientHeader: {
    paddingTop: Platform.OS === "ios" ? 50 : StatusBar.currentHeight + 10,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  saveButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#4C35E3',
  },
  avatarContainer: {
    alignItems: 'center',
    position: 'relative',
    marginBottom: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#4C35E3',
  },
  changePhotoButton: {
    position: 'absolute',
    right: '35%',
    bottom: -10,
    backgroundColor: '#4C35E3',
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#1a1a1a',
  },
  content: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -20,
  },
  inputContainer: {
    padding: 20,
    gap: 16,
  },
  input: {
    backgroundColor: '#fff',
    marginBottom: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    elevation: 0,
    shadowOpacity: 0,
  },
});
