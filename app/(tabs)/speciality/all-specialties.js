import React from "react"
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Dimensions, Animated } from "react-native"
import { useRouter } from "expo-router"
import { Stack } from "expo-router"
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons"
import { specialtyCategories } from "../../data/specialtyCategories"

const windowWidth = Dimensions.get("window").width

export default function AllSpecialties() {
  const router = useRouter()
  const rotateAnim = React.useRef(new Animated.Value(0)).current

  const animateHomeIcon = () => {
    Animated.sequence([
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start()
  }

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  })

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Specialties</Text>
        <TouchableOpacity
          style={styles.homeButton}
          onPress={() => {
            animateHomeIcon()
            router.push("/home")
          }}
        >
          <Animated.View style={{ transform: [{ rotate: spin }] }}>
            <Icon name="home" size={28} color="#333" />
          </Animated.View>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {specialtyCategories.map((category) => (
          <View key={category.id} style={styles.categoryContainer}>
            <View style={styles.categoryHeader}>
              <Icon
                name={category.icon}
                size={28}
                color={category.title === "Emergency & Critical Care" ? "#e74c3c" : "#4a4a4a"}
              />
              <Text style={styles.categoryTitle}>{category.title}</Text>
            </View>
            <View style={styles.specialtiesGrid}>
              {category.specialties.map((specialty, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.specialtyItem}
                  onPress={() => router.push(`/doctors?specialty=${specialty.name}`)}
                >
                  <View
                    style={[
                      styles.iconContainer,
                      category.title === "Emergency & Critical Care" && styles.emergencyIconContainer,
                    ]}
                  >
                    <Icon
                      name={specialty.icon}
                      size={28}
                      color={category.title === "Emergency & Critical Care" ? "#e74c3c" : "#fff"}
                    />
                  </View>
                  <Text style={styles.specialtyName} numberOfLines={1}>
                    {specialty.name}
                  </Text>
                  <Text style={styles.specialtyDescription} numberOfLines={2}>
                    {specialty.description}
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
    backgroundColor: "#f8f9fa",
    paddingTop: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
  },
  homeButton: {
    padding: 8,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  categoryContainer: {
    marginBottom: 32,
  },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginLeft: 12,
  },
  specialtiesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  specialtyItem: {
    width: (windowWidth - 48) / 2,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#3B39E4",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  emergencyIconContainer: {
    backgroundColor: "#fef2f2",
  },
  specialtyName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 4,
  },
  specialtyDescription: {
    fontSize: 12,
    color: "#666",
    lineHeight: 16,
  },
})

