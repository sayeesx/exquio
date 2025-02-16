import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Shimmer } from './Shimmer';

export const HospitalCardSkeleton = () => {
  return (
    <View style={styles.card}>
      <Shimmer width="100%" height={120} style={styles.image} />
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
    width: 385,
    borderRadius: 10,
    margin : -4,
    marginBottom: 10,
    overflow: "hidden",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  image: {
    width: "100%",
    height: 150,
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
