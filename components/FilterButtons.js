import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';

const filterData = [
  { id: 'all', label: 'All' },
  { id: 'multi', label: 'Multi' },
  { id: 'clinic', label: 'Clinic' },
  { id: 'ayurveda', label: 'Ayurveda' }
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
            <Text style={[
              styles.filterText,
              activeFilter === filter.id && styles.activeText
            ]}>
              {filter.label}
            </Text>
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
  filterButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    width: 80,
    paddingVertical: 8,
  },
  filterText: {
    fontSize: 12,
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