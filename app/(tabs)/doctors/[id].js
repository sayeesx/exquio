"use client"

import { useState } from "react"
import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView, SafeAreaView, StatusBar } from "react-native"
import { Ionicons, FontAwesome, MaterialIcons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import { LinearGradient } from 'expo-linear-gradient'
import { useLocalSearchParams } from 'expo-router'

export default function DoctorProfile() {
  const { doctorName } = useLocalSearchParams()
  const navigation = useNavigation()
  const [activeTab, setActiveTab] = useState("Feedbacks")

  // Sample doctor data
  const doctor = {
    name: "Dr. Sarah Johnson",
    specialization: "Cardiologist",
    rating: 4.8,
    reviews: 128,
    consultationDuration: "30m",
    consultationFee: "990 PKR (Rs)",
    visits: "2.3k",
    patients: "1.1k",
    experience: "2 years",
    image: "https://randomuser.me/api/portraits/women/76.jpg",
  }

  const renderStars = (rating) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const halfStar = rating % 1 >= 0.5

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<FontAwesome key={i} name="star" size={16} color="#FFD700" />)
      } else if (i === fullStars && halfStar) {
        stars.push(<FontAwesome key={i} name="star-half-o" size={16} color="#FFD700" />)
      } else {
        stars.push(<FontAwesome key={i} name="star-o" size={16} color="#FFD700" />)
      }
    }

    return stars
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4A80F0" />

      {/* Header with Gradient */}
      <LinearGradient
        colors={["#4C35E3", "#4B47E5", "#5465FF"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: '#fff' }]}>{doctorName || 'Doctor'}</Text>
        <TouchableOpacity style={styles.bookmarkButton}>
          <Ionicons name="bookmark-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Doctor Info Section */}
        <View style={styles.doctorInfoContainer}>
          <Image source={{ uri: doctor.image }} style={styles.doctorImage} />
          <Text style={styles.doctorName}>{doctor.name}</Text>
          <Text style={styles.specialization}>{doctor.specialization}</Text>

          <View style={styles.ratingContainer}>
            {renderStars(doctor.rating)}
            <Text style={styles.reviewCount}> ({doctor.reviews} reviews)</Text>
          </View>

          <View style={styles.consultationInfo}>
            <View style={styles.consultationItem}>
              <Ionicons name="time-outline" size={18} color="#666" />
              <Text style={styles.consultationText}>{doctor.consultationDuration}</Text>
            </View>
            <View style={styles.consultationDivider} />
            <View style={styles.consultationItem}>
              <Ionicons name="cash-outline" size={18} color="#666" />
              <Text style={styles.consultationText}>{doctor.consultationFee}</Text>
            </View>
          </View>
        </View>

        {/* Stats Section */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="eye-outline" size={24} color="#4A80F0" />
            <Text style={styles.statValue}>{doctor.visits}</Text>
            <Text style={styles.statLabel}>Visits</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="people-outline" size={24} color="#4A80F0" />
            <Text style={styles.statValue}>{doctor.patients}</Text>
            <Text style={styles.statLabel}>Patients</Text>
          </View>

          <View style={styles.statCard}>
            <MaterialIcons name="work-outline" size={24} color="#4A80F0" />
            <Text style={styles.statValue}>{doctor.experience}</Text>
            <Text style={styles.statLabel}>Experience</Text>
          </View>
        </View>

        {/* Tabs Section */}
        <View style={styles.tabsContainer}>
          {["Feedbacks", "Docs", "About"].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content (placeholder) */}
        <View style={styles.tabContent}>
          {activeTab === "Feedbacks" && (
            <View style={styles.feedbackContainer}>
              <Text style={styles.feedbackTitle}>Patient Feedbacks</Text>
              {/* Sample feedback items */}
              {[1, 2, 3].map((item) => (
                <View key={item} style={styles.feedbackItem}>
                  <View style={styles.feedbackHeader}>
                    <Image
                      source={{
                        uri: `https://randomuser.me/api/portraits/${item % 2 === 0 ? "women" : "men"}/${item * 10}.jpg`,
                      }}
                      style={styles.feedbackAvatar}
                    />
                    <View>
                      <Text style={styles.feedbackName}>Patient {item}</Text>
                      <View style={{ flexDirection: "row" }}>{renderStars(4 + item * 0.2).slice(0, 5)}</View>
                    </View>
                    <Text style={styles.feedbackDate}>2 days ago</Text>
                  </View>
                  <Text style={styles.feedbackText}>
                    Great doctor! Very professional and knowledgeable. I highly recommend Dr. Johnson for anyone looking
                    for a cardiologist.
                  </Text>
                </View>
              ))}
            </View>
          )}

          {activeTab === "Docs" && (
            <View style={styles.docsContainer}>
              <Text style={styles.sectionTitle}>Documents</Text>
              <Text style={styles.placeholderText}>Doctor's documents and certificates will appear here.</Text>
            </View>
          )}

          {activeTab === "About" && (
            <View style={styles.aboutContainer}>
              <Text style={styles.sectionTitle}>About Doctor</Text>
              <Text style={styles.aboutText}>
                Dr. Sarah Johnson is a board-certified cardiologist with over 2 years of experience in treating various
                heart conditions. She completed her medical degree from Harvard Medical School and residency at Johns
                Hopkins Hospital.
                {"\n\n"}
                Dr. Johnson specializes in preventive cardiology, heart failure management, and cardiac rehabilitation.
                She is committed to providing personalized care to all her patients.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Booking Button */}
      <View style={styles.bookingButtonContainer}>
        <TouchableOpacity style={styles.bookingButton}>
          <Text style={styles.bookingButtonText}>Book This Doctor</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  bookmarkButton: {
    padding: 8,
  },
  doctorInfoContainer: {
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  doctorImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
  },
  doctorName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  specialization: {
    fontSize: 16,
    color: "#666",
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  reviewCount: {
    fontSize: 14,
    color: "#666",
    marginLeft: 4,
  },
  consultationInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f4f8",
    borderRadius: 12,
    padding: 12,
    width: "90%",
  },
  consultationItem: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  consultationDivider: {
    width: 1,
    height: 24,
    backgroundColor: "#ddd",
  },
  consultationText: {
    marginLeft: 6,
    fontSize: 14,
    color: "#555",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginVertical: 16,
  },
  statCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    width: "30%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: "#4A80F0",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
  },
  activeTabText: {
    color: "#fff",
  },
  tabContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginHorizontal: 16,
    padding: 16,
    marginBottom: 100, // Space for the booking button
  },
  feedbackContainer: {
    gap: 16,
  },
  feedbackTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#333",
  },
  feedbackItem: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  feedbackHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  feedbackAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  feedbackName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 2,
  },
  feedbackDate: {
    fontSize: 12,
    color: "#999",
    marginLeft: "auto",
  },
  feedbackText: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
  },
  docsContainer: {
    alignItems: "center",
    padding: 20,
  },
  aboutContainer: {
    padding: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#333",
  },
  placeholderText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    marginTop: 20,
  },
  aboutText: {
    fontSize: 14,
    color: "#555",
    lineHeight: 22,
  },
  bookingButtonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  bookingButton: {
    backgroundColor: "#4A80F0",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  bookingButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
})

