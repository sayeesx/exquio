import React, { useEffect, useState, useCallback, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  RefreshControl, 
  Text, 
  Animated 
} from 'react-native';
import { fetchOffers } from '../../../services/offerService';
import OfferCard from '../../../components/OfferCard';
import LoadingAnimation from '../../../components/LoadingAnimation';
import { COLORS } from '../../../constants/colors';

const SECTIONS = [
  { type: 'doctor', title: 'Doctor Offers' },
  { type: 'hospital', title: 'Hospital Offers' },
  { type: 'partner', title: 'Partner Offers' },
  { type: 'app', title: 'App Exclusive' },
  { type: 'other', title: 'Other Offers' }
];

export default function OffersPage() {
    const [offersBySection, setOffersBySection] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const fadeAnim = useRef(new Animated.Value(0)).current;
  
    const loadOffers = async () => {
      try {
        setIsLoading(true);
        const sectionData = {};
        
        // Fetch offers for each section in parallel
        const promises = SECTIONS.map(async ({ type }) => {
          const data = await fetchOffers(type);
          return { type, data };
        });
  
        const results = await Promise.all(promises);
        results.forEach(({ type, data }) => {
          sectionData[type] = data;
        });
  
        setOffersBySection(sectionData);
      } catch (error) {
        console.error('Error loading offers:', error);
      } finally {
        setIsLoading(false);
        setRefreshing(false);
      }
    };
  
    useEffect(() => {
      loadOffers();
    }, []);
  
    useEffect(() => {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }, []);
  
    const onRefresh = useCallback(() => {
      setRefreshing(true);
      loadOffers();
    }, []);
  
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <LoadingAnimation />
        </View>
      );
    }
  
    const renderSection = ({ type, title }) => {
      const offers = offersBySection[type] || [];
      if (offers.length === 0) return null;
  
      return (
        <View key={type} style={styles.section}>
          <Text style={styles.sectionTitle}>{title}</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.sectionContent}
          >
            {offers.map((offer) => (
              <OfferCard
                key={`offer-${offer.id}`}
                offer={offer}
              />
            ))}
          </ScrollView>
        </View>
      );
    };
  
    return (
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <ScrollView
          style={styles.container}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#4C35E3"
              colors={['#4C35E3']}
            />
          }
        >
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Special Offers</Text>
            <Text style={styles.headerSubtitle}>Discover amazing deals just for you</Text>
          </View>
          
          {SECTIONS.map(section => renderSection(section))}
        </ScrollView>
      </Animated.View>
    );
  }
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#F5F5F5',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    header: {
      padding: 20,
      backgroundColor: '#fff',
      borderBottomWidth: 1,
      borderBottomColor: '#E5E5E5',
    },
    headerTitle: {
      fontSize: 24,
      fontFamily: 'Inter_600SemiBold',
      color: COLORS.primary,
      marginBottom: 4,
    },
    headerSubtitle: {
      fontSize: 14,
      fontFamily: 'Inter_400Regular',
      color: '#666',
    },
    section: {
      marginTop: 20,
      paddingHorizontal: 20,
    },
    sectionTitle: {
      fontSize: 18,
      fontFamily: 'Inter_600SemiBold',
      color: '#1A1A1A',
      marginBottom: 12,
    },
    sectionContent: {
      paddingBottom: 12,
    },
  });