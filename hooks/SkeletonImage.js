import React, { useState } from 'react';
import { View, Image, StyleSheet, Animated } from 'react-native';
import { Shimmer } from '../components/Shimmer';

export const SkeletonImage = ({ source, style, onLoad, resizeMode }) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const handleLoad = () => {
    setLoaded(true);
    onLoad?.();
  };

  return (
    <View style={[style, styles.container]}>
      {!loaded && !error && (
        <View style={[StyleSheet.absoluteFill, styles.shimmerContainer]}>
          <Shimmer width="100%" height="100%" />
        </View>
      )}
      <Image
        source={source}
        style={[
          style,
          styles.image,
          { opacity: loaded ? 1 : 0 }
        ]}
        onLoad={handleLoad}
        onError={() => setError(true)}
        resizeMode={resizeMode}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#E1E9EE',
  },
  shimmerContainer: {
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});