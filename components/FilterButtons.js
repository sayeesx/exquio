import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { FontAwesome5 } from "@expo/vector-icons";

const filterData = [
  { 
    id: 'all', 
    icon: 'border-all', // Changed from 'th-large'
    label: 'All' 
  },
  { 
    id: 'multi', 
    icon: 'hospital', // Changed from 'hospital-alt'
    label: 'Multi' 
  },
  { 
    id: 'clinic', 
    icon: 'stethoscope', // Changed from 'user-md'
    label: 'Clinic' 
  },
  { 
    id: 'ayurveda', 
    icon: 'leaf', // Changed from 'spa'
    label: 'Ayurveda' 
  }
];

const FilterButtons = ({ activeFilter, onFilterChange }) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const animatedWidth = useRef(new Animated.Value(80)).current;
  const buttonWidth = 80;
  const ayurvedaExtraWidth = 16;
  const rightShift = 10; // Amount to shift right for non-All buttons

  useEffect(() => {
    const index = filterData.findIndex(f => f.id === activeFilter);
    // Add right shift for all buttons except 'all'
    const newPosition = index * buttonWidth + (activeFilter === 'all' ? 0 : rightShift);
    
    Animated.parallel([
      Animated.spring(translateX, {
        toValue: newPosition,
        damping: 20,
        stiffness: 90,
        mass: 1,
        useNativeDriver: false,
      }),
      Animated.spring(animatedWidth, {
        toValue: activeFilter === 'ayurveda' ? buttonWidth + ayurvedaExtraWidth : buttonWidth,
        damping: 20,
        stiffness: 90,
        mass: 1,
        useNativeDriver: false,
      })
    ]).start();
  }, [activeFilter]);

  return (
    <View style={styles.outerContainer}>
      <View style={styles.container}>
        <Animated.View 
          style={[
            styles.activeBackground,
            {
              width: animatedWidth,
              transform: [{ translateX }]
            }
          ]}
        />
        {filterData.map((filter) => (
          <TouchableOpacity
            key={filter.id}
            style={styles.filterButton}
            onPress={() => onFilterChange(filter.id)}
          >
            <View style={styles.buttonContent}>
              <FontAwesome5
                name={filter.icon}
                size={16}
                color={activeFilter === filter.id ? '#fff' : '#64748B'}
                style={[
                  styles.icon,
                  activeFilter === filter.id && {
                    textShadowColor: 'rgba(0, 0, 0, 0.2)',
                    textShadowOffset: { width: 0, height: 1 },
                    textShadowRadius: 3,
                  }
                ]}
                solid
              />
              <Text style={[
                styles.filterText,
                activeFilter === filter.id && styles.activeText
              ]}>
                {filter.label}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginLeft: -8,
  },
  container: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 24,
    padding: 3,
    position: 'relative',
    height: 40,
    width: 352,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  activeBackground: {
    position: 'absolute',
    height: 34,
    backgroundColor: '#3B39E4',
    borderRadius: 20,
    top: 3,
    left: 3,
    shadowColor: "#3B39E4",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  filterButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    width: 80,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
  },
  icon: {
    marginRight: 4,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  filterText: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    color: '#64748B',
  },
  activeText: {
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

export default FilterButtons;