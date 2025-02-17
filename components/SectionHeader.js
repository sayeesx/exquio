import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MotiView } from 'moti';

const SectionHeader = ({ title, icon, delay = 0 }) => {
  return (
    <MotiView
      style={styles.container}
      from={{ opacity: 0, translateX: -20 }}
      animate={{ opacity: 1, translateX: 0 }}
      transition={{ type: 'timing', duration: 500, delay }}
    >
      <View style={styles.iconContainer}>
        {icon}
      </View>
      <Text style={styles.title}>{title}</Text>
    </MotiView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    backgroundColor: '#EEF2FF',
    padding: 8,
    borderRadius: 12,
    marginRight: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
  },
});

export default SectionHeader;
