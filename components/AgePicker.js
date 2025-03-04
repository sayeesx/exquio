import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, FlatList, Text } from 'react-native';

const ITEM_HEIGHT = 60;
const VISIBLE_ITEMS = 3;
const AGE_OPTIONS = Array.from({ length: 100 }, (_, i) => ({
  id: (i + 1).toString(),
  value: i + 1,
  label: (i + 1).toString(),
}));

export default function AgePicker({ value = 18, onChange }) {
  const flatListRef = useRef(null);
  const [highlightedValue, setHighlightedValue] = useState(value);

  // Scroll to initial position
  useEffect(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToOffset({
        offset: (value - 1) * ITEM_HEIGHT,
        animated: false,
      });
    }, 50);
  }, []);

  // Handle scroll stop and set the correct number
  const handleScrollEnd = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / ITEM_HEIGHT);
    const newValue = AGE_OPTIONS[index]?.value;

    if (newValue !== highlightedValue) {
      setHighlightedValue(newValue);
      onChange?.(newValue);
    }
  };

  // Optimize item layout calculation
  const getItemLayout = (_, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  });

  // Render each item with NO animation while scrolling
  const renderItem = ({ item }) => {
    const isHighlighted = item.value === highlightedValue;

    return (
      <TouchableOpacity
        style={styles.ageItem}
        onPress={() => {
          flatListRef.current?.scrollToOffset({
            offset: (item.value - 1) * ITEM_HEIGHT,
            animated: true,
          });
        }}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.ageText,
            isHighlighted && styles.highlightedText, // Only highlight when scrolling stops
          ]}
        >
          {item.label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={AGE_OPTIONS}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        snapToAlignment="center"
        decelerationRate="fast" // Smoother flick scrolling
        bounces={false} // Prevents unwanted bouncing at edges
        getItemLayout={getItemLayout}
        onMomentumScrollEnd={handleScrollEnd}
        onScrollEndDrag={handleScrollEnd}
        scrollEventThrottle={8} // More responsive updates
        ListHeaderComponent={<View style={{ height: ITEM_HEIGHT }} />}
        ListFooterComponent={<View style={{ height: ITEM_HEIGHT }} />}
        initialNumToRender={12} // Load more items for smoothness
        maxToRenderPerBatch={10} // Improve scrolling performance
        windowSize={20} // Keeps more items in memory for smooth scrolling
        removeClippedSubviews
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: ITEM_HEIGHT * VISIBLE_ITEMS,
    position: 'relative',
  },
  ageItem: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ageText: {
    textAlign: 'center',
    fontSize: 24,
    color: '#94A3B8',
    fontFamily: 'Inter_400Regular',
  },
  highlightedText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#4C35E3',
  },
});
