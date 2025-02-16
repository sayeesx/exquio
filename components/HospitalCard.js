import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

const HospitalCard = ({ hospital, imageUrl, animationStyle }) => {
  const router = useRouter();

  return (
    <TouchableOpacity style={[styles.card, animationStyle]} onPress={() => router.push(`/hospital/${hospital.id}`)}>
      <Image source={{ uri: imageUrl }} style={styles.image} />
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{hospital.name}</Text>
        <Text style={styles.address}>{hospital.location}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 300,
    margin: 10,
    borderRadius: 10,
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
  infoContainer: {
    padding: 10,
  },
  name: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
    color: "#000",
  },
  address: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "#666",
  },
});

export default HospitalCard;