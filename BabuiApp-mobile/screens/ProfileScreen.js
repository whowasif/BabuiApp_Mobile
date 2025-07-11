import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import BottomNav from '../components/BottomNav';
import { LinearGradient } from 'expo-linear-gradient';

const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'properties', label: 'My Properties' },
  { id: 'favorites', label: 'Favorites' },
  { id: 'settings', label: 'Settings' },
];

export default function ProfileScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <View style={{ flex: 1, backgroundColor: '#FFF3E0' }}>
      <LinearGradient colors={["#FF9800", "#FFB300"]} style={{ paddingTop: 48, paddingBottom: 32, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 }}>
        <View style={styles.profileHeader}>
          <Image source={{ uri: 'https://randomuser.me/api/portraits/men/1.jpg' }} style={styles.avatar} />
          <View style={{ alignItems: 'center' }}>
            <Text style={styles.name}>Wasif Abdullah <Text style={styles.verified}>✔</Text></Text>
            <Text style={styles.location}>Dhaka, Bangladesh</Text>
            <Text style={styles.email}>abdullah.alwasif01@gmail.com</Text>
            <Text style={styles.phone}>01731300695</Text>
          </View>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.statCard}><Text style={styles.statNum}>3</Text><Text style={styles.statLabel}>Properties</Text></View>
          <View style={styles.statCard}><Text style={styles.statNum}>12</Text><Text style={styles.statLabel}>Favorites</Text></View>
          <View style={styles.statCard}><Text style={styles.statNum}>8</Text><Text style={styles.statLabel}>Messages</Text></View>
          <View style={styles.statCard}><Text style={styles.statNum}>0</Text><Text style={styles.statLabel}>Rating</Text></View>
        </View>
        <TouchableOpacity style={styles.editBtn}><Text style={styles.editBtnText}>Edit Profile</Text></TouchableOpacity>
      </LinearGradient>
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        <View style={styles.card}>
          <View style={styles.tabsRow}>
            {tabs.map(tab => (
              <TouchableOpacity
                key={tab.id}
                style={[styles.tabBtn, activeTab === tab.id && styles.tabBtnActive]}
                onPress={() => setActiveTab(tab.id)}
              >
                <Text style={activeTab === tab.id ? styles.tabBtnTextActive : styles.tabBtnText}>{tab.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.placeholderContent}>
            <Text style={styles.placeholder}>[Tab Content Placeholder: {activeTab}]</Text>
          </View>
        </View>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <Text style={styles.activityItem}>• Listed a new property - 2 days ago</Text>
          <Text style={styles.activityItem}>• Received a message - 3 days ago</Text>
          <Text style={styles.activityItem}>• Added a property to favorites - 5 days ago</Text>
        </View>
      </ScrollView>
      <BottomNav navigation={navigation} active="Profile" />
    </View>
  );
}

const styles = StyleSheet.create({
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    marginRight: 16,
    borderWidth: 3,
    borderColor: '#fff',
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  verified: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  location: {
    color: '#FFF8E1',
    fontSize: 14,
  },
  email: {
    color: '#FFF3E0',
    fontSize: 13,
  },
  phone: {
    color: '#FFF3E0',
    fontSize: 13,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  statCard: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 8,
    minWidth: 60,
    marginHorizontal: 4,
    elevation: 2,
  },
  statNum: {
    color: '#FF9800',
    fontWeight: 'bold',
    fontSize: 18,
  },
  statLabel: {
    color: '#757575',
    fontSize: 12,
  },
  editBtn: {
    alignSelf: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 18,
    paddingVertical: 8,
    marginTop: 8,
    elevation: 2,
  },
  editBtnText: {
    color: '#FF9800',
    fontWeight: 'bold',
    fontSize: 15,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    margin: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF9800',
    marginBottom: 8,
  },
  activityItem: {
    color: '#757575',
    fontSize: 14,
    marginBottom: 4,
  },
  tabsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 8,
  },
  tabBtn: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    backgroundColor: '#FFE0B2',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  tabBtnActive: {
    backgroundColor: '#FF9800',
  },
  tabBtnText: {
    color: '#FF9800',
    fontWeight: 'bold',
  },
  tabBtnTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  placeholder: {
    color: '#BDBDBD',
    fontStyle: 'italic',
    marginVertical: 8,
  },
  placeholderContent: {
    alignItems: 'center',
    marginVertical: 24,
  },
}); 