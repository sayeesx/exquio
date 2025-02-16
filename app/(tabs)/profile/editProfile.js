import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Picker } from '@react-native-picker/picker';
import { TextInput } from 'react-native-paper';

export default function EditProfile() {
  const router = useRouter();
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: '',
    age: '', // This will be converted to number when saving
    address: '',
    bloodType: '',
    gender: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userDataString = await AsyncStorage.getItem('userData');
      if (userDataString) {
        const parsedData = JSON.parse(userDataString);
        // Ensure age is always a string in the form
        setUserData({
          ...parsedData,
          age: parsedData.age ? String(parsedData.age) : '',
        });
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      Alert.alert('Error', 'Failed to load user data');
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!userData.name) newErrors.name = 'Name is required';
    if (!userData.email) newErrors.email = 'Email is required';
    if (!userData.phone) newErrors.phone = 'Phone is required';
    if (!userData.age) newErrors.age = 'Age is required';
    if (!userData.address) newErrors.address = 'Address is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      await AsyncStorage.setItem('userData', JSON.stringify({
        ...userData,
        age: userData.age ? Number(userData.age) : null, // Ensure age is stored as a number
      }));
      Alert.alert('Success', 'Profile updated successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Error saving user data:', error);
      Alert.alert('Error', 'Failed to save changes');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Icon name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity 
          style={styles.saveButton}
          onPress={handleSave}
        >
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <TextInput
          label="Full Name"
          value={userData.name}
          onChangeText={(text) => setUserData({ ...userData, name: text })}
          mode="outlined"
          error={!!errors.name}
          style={styles.input}
        />

        <TextInput
          label="Email"
          value={userData.email}
          onChangeText={(text) => setUserData({ ...userData, email: text })}
          mode="outlined"
          error={!!errors.email}
          keyboardType="email-address"
          style={styles.input}
        />

        <TextInput
          label="Phone"
          value={userData.phone}
          onChangeText={(text) => setUserData({ ...userData, phone: text })}
          mode="outlined"
          error={!!errors.phone}
          keyboardType="phone-pad"
          style={styles.input}
        />

        <TextInput
          label="Age"
          value={userData.age}
          onChangeText={(text) => setUserData({ ...userData, age: text })}
          mode="outlined"
          error={!!errors.age}
          keyboardType="numeric"
          style={styles.input}
        />

        <View style={styles.pickerContainer}>
          <Text style={styles.pickerLabel}>Blood Type</Text>
          <Picker
            selectedValue={userData.bloodType}
            onValueChange={(value) => setUserData({ ...userData, bloodType: value })}
            style={[styles.picker, { backgroundColor: '#F5F5F5' }]}
            itemStyle={{ fontSize: 16 }}
          >
            <Picker.Item label="Select Blood Type" value="" />
            <Picker.Item label="A+" value="A+" />
            <Picker.Item label="A-" value="A-" />
            <Picker.Item label="B+" value="B+" />
            <Picker.Item label="B-" value="B-" />
            <Picker.Item label="AB+" value="AB+" />
            <Picker.Item label="AB-" value="AB-" />
            <Picker.Item label="O+" value="O+" />
            <Picker.Item label="O-" value="O-" />
          </Picker>
        </View>

        <View style={styles.pickerContainer}>
          <Text style={styles.pickerLabel}>Gender</Text>
          <Picker
            selectedValue={userData.gender}
            onValueChange={(value) => setUserData({ ...userData, gender: value })}
            style={[styles.picker, { backgroundColor: '#F5F5F5' }]}
            itemStyle={{ fontSize: 16 }}
          >
            <Picker.Item label="Select Gender" value="" />
            <Picker.Item label="Male" value="Male" />
            <Picker.Item label="Female" value="Female" />
            <Picker.Item label="Other" value="Other" />
          </Picker>
        </View>

        <TextInput
          label="Address"
          value={userData.address}
          onChangeText={(text) => setUserData({ ...userData, address: text })}
          mode="outlined"
          error={!!errors.address}
          multiline
          numberOfLines={3}
          style={styles.input}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 2,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    ...Platform.select({
      ios: {
        paddingTop: 8
      },
      android: {
        paddingTop: StatusBar.currentHeight
      }
    })
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  backButton: {
    padding: 8,
  },
  saveButton: {
    padding: 8,
  },
  saveButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  pickerContainer: {
    marginBottom: 16,
  },
  pickerLabel: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
  },
  picker: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
});