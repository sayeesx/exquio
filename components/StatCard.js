import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MotiView } from 'moti';

const StatCard = ({ icon, value, label, delay = 0 }) => {
  return (
    <MotiView
      style={styles.container}
      from={{ opacity: 0, scale: 0.9, translateY: 20 }}
      animate={{ opacity: 1, scale: 1, translateY: 0 }}
      transition={{ type: 'spring', delay, damping: 15 }}
    >
      <View style={styles.iconContainer}>
        {icon}
      </View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </MotiView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  iconContainer: {
    backgroundColor: '#EEF2FF',
    padding: 10,
    borderRadius: 16,
    marginBottom: 8,
  },
  value: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 2,
  },
  label: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
});

export default StatCard;
