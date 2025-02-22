import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { MaterialCommunityIcons } from "@expo/vector-icons";

const filterData = [
  { id: 'all', icon: 'view-dashboard-outline', label: 'All' },
  { id: 'multi', icon: 'hospital', label: 'Multi' },
  { id: 'clinic', icon: 'stethoscope', label: 'Clinic' },
  { id: 'ayurveda', icon: 'leaf', label: 'Ayurveda' }
];

const FilterButtons = ({ activeFilter, onFilterChange }) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const buttonWidth = 85; // approximate width of each button

  useEffect(() => {
    const newPosition = filterData.findIndex(f => f.id === activeFilter) * buttonWidth;
    Animated.spring(translateX, {
      toValue: newPosition,
      damping: 20,
      stiffness: 90,
      mass: 1,
      useNativeDriver: true,
    }).start();
  }, [activeFilter]);

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.activeBackground,
          {
            transform: [{ translateX }],
          }
        ]}
      />
      {filterData.map((filter) => (
        <TouchableOpacity
          key={filter.id}
          style={styles.filterButton}
          onPress={() => onFilterChange(filter.id)}
        >
          <MaterialCommunityIcons
            name={filter.icon}
            size={20}
            color={activeFilter === filter.id ? '#fff' : '#64748B'}
          />
          <Text style={[
            styles.filterText,
            activeFilter === filter.id && styles.activeText
          ]}>
            {filter.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    margin: 16,
    borderRadius: 16,
    padding: 4,
    position: 'relative',
    height: 48,
  },
  activeBackground: {
    position: 'absolute',
    width: 85,
    height: 40,
    backgroundColor: '#3B39E4',
    borderRadius: 12,
    top: 4,
    left: 4,
    shadowColor: "#3B39E4",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  filterButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  filterText: {
    fontSize: 12,
    marginTop: 2,
    fontFamily: 'Inter_700Bold',
    color: '#64748B',
  },
  activeText: {
    color: '#fff',
  },
});

export default FilterButtons;
