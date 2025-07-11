import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput } from 'react-native';
import BottomNav from '../components/BottomNav';
import { LinearGradient } from 'expo-linear-gradient';

export default function EditProfileScreen({ navigation }) {
  return (
    <View style={{ flex: 1, backgroundColor: '#FFF3E0' }}>
      <LinearGradient colors={["#FF9800", "#FFB300"]} style={{ paddingTop: 48, paddingBottom: 24, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 }}>
        <Text style={styles.header}>Edit Profile</Text>
      </LinearGradient>
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        <View style={styles.card}>
          <View style={styles.profilePicRow}>
            <Image source={{ uri: 'https://randomuser.me/api/portraits/men/1.jpg' }} style={styles.avatar} />
            <TouchableOpacity style={styles.changePhotoBtn}><Text style={styles.changePhotoText}>Change Photo</Text></TouchableOpacity>
          </View>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <View style={styles.inputRow}>
            <View style={styles.inputCol}>
              <Text style={styles.label}>Name (English)</Text>
              <TextInput style={styles.input} value="Wasif Abdullah" />
            </View>
            <View style={styles.inputCol}>
              <Text style={styles.label}>Name (Bengali)</Text>
              <TextInput style={styles.input} value="Wasif Abdullah" />
            </View>
          </View>
          <View style={styles.inputRow}>
            <View style={styles.inputCol}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput style={styles.input} value="abdullah.alwasif01@gmail.com" />
            </View>
            <View style={styles.inputCol}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput style={styles.input} value="01731300695" />
            </View>
          </View>
          <View style={styles.inputRow}>
            <View style={styles.inputCol}>
              <Text style={styles.label}>Location (English)</Text>
              <TextInput style={styles.input} value="Dhaka, Bangladesh" />
            </View>
            <View style={styles.inputCol}>
              <Text style={styles.label}>Location (Bengali)</Text>
              <TextInput style={styles.input} value="ঢাকা, বাংলাদেশ" />
            </View>
          </View>
          <View style={styles.inputRow}>
            <View style={styles.inputCol}>
              <Text style={styles.label}>Bio (English)</Text>
              <TextInput style={styles.input} value="Happy Being" />
            </View>
            <View style={styles.inputCol}>
              <Text style={styles.label}>Bio (Bengali)</Text>
              <TextInput style={styles.input} value="নিজেকে সম্পর্কে বলুন..." />
            </View>
          </View>
          <TouchableOpacity style={styles.saveBtn}><Text style={styles.saveBtnText}>Save Changes</Text></TouchableOpacity>
        </View>
      </ScrollView>
      <BottomNav navigation={navigation} active="Profile" />
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
  profilePicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    marginRight: 16,
    borderWidth: 3,
    borderColor: '#FF9800',
  },
  changePhotoBtn: {
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    elevation: 2,
  },
  changePhotoText: {
    color: '#FF9800',
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF9800',
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  inputCol: {
    flex: 1,
  },
  label: {
    color: '#757575',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  saveBtn: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
}); 