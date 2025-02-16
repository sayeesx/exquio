import { StyleSheet, View, Text, TextInput, TouchableOpacity, Animated, Easing } from "react-native"
import Icon from "react-native-vector-icons/MaterialCommunityIcons"
import { useRouter } from "expo-router"
import { useState, useRef, useEffect } from "react"

export default function Header() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [showNotifications, setShowNotifications] = useState(false)
  const bellAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    const shakeAnimation = Animated.sequence([
      Animated.timing(bellAnim, {
        toValue: 1,
        duration: 100,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      Animated.timing(bellAnim, {
        toValue: -1,
        duration: 100,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      Animated.timing(bellAnim, {
        toValue: 0,
        duration: 100,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ])

    const intervalId = setInterval(() => {
      shakeAnimation.start()
    }, 3000)

    return () => clearInterval(intervalId)
  }, [bellAnim])

  const handleSearch = () => {
    // Implement search functionality
    console.log("Searching for:", searchQuery)
  }

  const handleProfile = () => {
    router.push("/profile")
  }

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <TouchableOpacity onPress={() => router.push("/menu")}>
          <Icon name="ambulance" size={24} color="#3B39E4" />
        </TouchableOpacity>
        <View style={styles.rightIcons}>
          <TouchableOpacity style={styles.notificationButton} onPress={() => setShowNotifications(true)}>
            <Animated.View
              style={[
                styles.notificationIcon,
                {
                  transform: [
                    {
                      rotate: bellAnim.interpolate({
                        inputRange: [-1, 1],
                        outputRange: ["-20deg", "20deg"],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Icon name="bell-outline" size={24} color="#000" />
            </Animated.View>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleProfile}>
            <View style={styles.profileIcon}>
              <Icon name="account-circle" size={24} color="#3B39E4" />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.title}>Find your desired specialist</Text>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search for doctor"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Icon name="magnify" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fff",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  rightIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  notificationIcon: {
    padding: 8,
  },
  profileIcon: {
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    paddingLeft: 16,
    overflow: "hidden",
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: "#000",
  },
  searchButton: {
    backgroundColor: "#3B39E4",
    height: 48,
    width: 48,
    justifyContent: "center",
    alignItems: "center",
  },
})

