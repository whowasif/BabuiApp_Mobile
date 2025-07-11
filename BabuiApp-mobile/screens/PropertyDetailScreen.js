import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import BottomNav from '../components/BottomNav';
import { LinearGradient } from 'expo-linear-gradient';

export default function PropertyDetailScreen({ navigation }) {
  return (
    <View style={{ flex: 1, backgroundColor: '#FFF3E0' }}>
      <LinearGradient colors={["#FF9800", "#FFB300"]} style={{ paddingTop: 48, paddingBottom: 24, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 }}>
        <Text style={styles.header}>Property Detail</Text>
      </LinearGradient>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 80 }}>
        <View style={styles.card}>
          <Image source={{ uri: 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg' }} style={styles.image} />
          <Text style={styles.title}>[Property Title]</Text>
          <Text style={styles.price}>৳60,000</Text>
          <Text style={styles.location}>Area, City</Text>
          <Text style={styles.sectionTitle}>Details</Text>
          <Text style={styles.placeholder}>[Property Details Placeholder]</Text>
          <Text style={styles.sectionTitle}>Actions</Text>
          <Text style={styles.placeholder}>[Actions Placeholder]</Text>
        </View>
      </ScrollView>
      <BottomNav navigation={navigation} active={null} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  container: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 24,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: '#eee',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FF9800',
    marginBottom: 4,
  },
  price: {
    fontSize: 18,
    color: '#4CAF50',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  location: {
    fontSize: 15,
    color: '#757575',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF9800',
    marginTop: 16,
    marginBottom: 4,
  },
  placeholder: {
    color: '#BDBDBD',
    fontStyle: 'italic',
    marginBottom: 8,
  },
}); 