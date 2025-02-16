import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Shimmer } from './Shimmer';

export const HospitalCardSkeleton = () => {
  return (
    <View style={styles.card}>
      <Shimmer width="100%" height={135} style={styles.image} />
      <View style={styles.content}>
        <View style={styles.row}>
          <Shimmer width={40} height={40} style={styles.logo} />
          <View style={styles.textContainer}>
            <Shimmer width={150} height={20} style={styles.nameShimmer} />
            <Shimmer width={100} height={16} style={styles.locationShimmer} />
          </View>
        </View>
        <Shimmer width={80} height={32} style={styles.typeShimmer} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    height: 180,
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 24,
    overflow: 'hidden',
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: "#1E293B",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  image: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  content: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    borderRadius: 10,
    marginRight: 12,
  },
  textContainer: {
    gap: 8,
  },
  nameShimmer: {
    borderRadius: 4,
  },
  locationShimmer: {
    borderRadius: 4,
  },
  typeShimmer: {
    borderRadius: 7,
  }
});
