import React, { useEffect, useCallback } from "react"
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Dimensions, Animated } from "react-native"
import { useRouter } from "expo-router"
import { Stack } from "expo-router"
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons"
import { specialtyCategories } from "../../data/specialtyCategories"
import { specialtyIcons } from '../../constants/specialtyIcons';
import { standardizeSpecialtyName } from '../../utils/specialtyMapping';

const windowWidth = Dimensions.get("window").width

// Add color mapping for categories
const categoryColors = {
  "Primary Care": "#4CAF50", // Green
  "Emergency Services": "#F44336", // Red
  "Medical Specialties": "#2196F3", // Blue
  "Surgical Care": "#FF5722", // Deep Orange
  "Women's Health": "#E91E63", // Pink
  "Child Health": "#00BCD4", // Cyan
  "Cancer Care": "#9C27B0", // Purple
  "Specialized Services": "#3F51B5", // Indigo
  "Mental Health": "#009688", // Teal
  "Rehabilitation": "#FF9800", // Orange
  "Support Services": "#607D8B", // Blue Grey
};

// Add specialty-specific colors
const specialtyColors = {
  "Cardiology": "#e53935", // Heart Red
  "Pulmonology": "#29b6f6", // Light Blue
  "Neurosurgery": "#5e35b1", // Deep Purple
  "Pediatrics": "#26a69a", // Teal
  "Emergency Care": "#d32f2f", // Emergency Red
  "Oncologist": "#7b1fa2", // Deep Purple
  "Dermatology": "#ec407a", // Pink
  "Ophthalmology": "#1e88e5", // Blue
  "Dental": "#fff176", // Light Yellow
  "Laboratory": "#66bb6a", // Green
  // Default color if no specific color is found
  "default": "#3B39E4"
};

export default function AllSpecialties() {
  const router = useRouter()
  const rotateAnim = React.useRef(new Animated.Value(0)).current
  const animationRef = React.useRef(null)

  useEffect(() => {
    return () => {
      // Cleanup animation
      if (animationRef.current) {
        animationRef.current.stop()
      }
      rotateAnim.setValue(0)
    }
  }, [])

  const animateHomeIcon = useCallback(() => {
    try {
      if (animationRef.current) {
        animationRef.current.stop()
      }
      
      animationRef.current = Animated.sequence([
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        })
      ])
      
      animationRef.current.start()
    } catch (error) {
      console.warn('Animation error:', error)
      rotateAnim.setValue(0)
    }
  }, [])

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  })

  const getIcon = (iconName) => {
    return iconName || specialtyIcons['default'];
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Medical Specialties</Text>
        <TouchableOpacity
          style={styles.homeButton}
          onPress={() => {
            animateHomeIcon()
            router.push("/home")
          }}
        >
          <Animated.View style={{ transform: [{ rotate: spin }] }}>
            <Icon name="home" size={24} color="#3B39E4" />
          </Animated.View>
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
      >
        {specialtyCategories.map((category) => (
          <View key={category.id} style={styles.categoryContainer}>
            <View style={styles.categoryHeader}>
              <View style={[
                styles.categoryIconContainer, 
                { backgroundColor: `${categoryColors[category.title]}15` }
              ]}>
                <Icon
                  name={category.icon}
                  size={28}
                  color={categoryColors[category.title]}
                />
              </View>
              <Text style={styles.categoryTitle}>{category.title}</Text>
            </View>
            <View style={styles.specialtiesGrid}>
              {category.specialties.map((specialty, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.specialtyItem}
                  onPress={() => {
                    console.log('Navigating to specialty:', specialty.name); // Add debug log
                    router.push({
                      pathname: `/speciality/${standardizeSpecialtyName(specialty.name)}`,
                      params: { 
                        specialty: standardizeSpecialtyName(specialty.name),
                        displayName: specialty.display 
                      }
                    });
                  }}
                >
                  <View style={[
                    styles.iconContainer, 
                    { backgroundColor: `${specialtyColors[specialty.name] || specialtyColors.default}15` }
                  ]}>
                    <Icon 
                      name={specialty.icon}
                      size={32}
                      color={specialtyColors[specialty.name] || specialtyColors.default}
                    />
                  </View>
                  <Text style={styles.specialtyName} numberOfLines={2}>
                    {specialty.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 48,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#222",
  },
  homeButton: {
    padding: 8,
  },
  scrollContent: {
    padding: 16,
  },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  categoryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#222",
    flex: 1,
  },
  specialtiesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 24,
  },
  specialtyItem: {
    width: (windowWidth - 48) / 3,
    alignItems: 'center',
    padding: 8,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  specialtyName: {
    fontSize: 12,
    fontWeight: "500",
    color: "#222",
    textAlign: 'center',
    lineHeight: 16,
  },
  emergencyIconContainer: {
    backgroundColor: "#fff2f2",
  },
  headerIcon: undefined,
  categoryIcon: undefined,
  specialtyIcon: undefined
})