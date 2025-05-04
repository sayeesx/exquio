import React from 'react';
import { 
  View, 
  TextInput, 
  StyleSheet, 
  Platform, 
  TouchableOpacity,
  Keyboard // Add this import
} from 'react-native';
import { MaterialCommunityIcons } from "@expo/vector-icons";

const SearchBar = ({ value, onChangeText, placeholder = "Search..." }) => {
  const handleClear = () => {
    onChangeText('');
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchBox}>
        <MaterialCommunityIcons name="magnify" size={22} color="#64748B" />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#94A3B8"
          value={value}
          onChangeText={onChangeText}
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
          enablesReturnKeyAutomatically
          onSubmitEditing={Keyboard.dismiss}
          blurOnSubmit={false}
          keyboardType="default"
          clearButtonMode="while-editing"
          spellCheck={false}
          autoComplete="off"
        />
        {value.length > 0 && (
          <TouchableOpacity 
            onPress={handleClear} 
            style={styles.clearButton}
          >
            <MaterialCommunityIcons 
              name="close-circle-outline" 
              size={20} 
              color="#94A3B8" 
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 2,
    paddingVertical: 8,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    height: 50,
    borderRadius: 26,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1E293B',
    fontFamily: 'Inter_700Bold',
    padding: 0,
  },
  clearButton: {
    padding: 4,
  },
});

export default SearchBar;
