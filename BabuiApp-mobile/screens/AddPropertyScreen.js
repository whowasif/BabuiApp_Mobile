import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import BottomNav from '../components/BottomNav';
import { LinearGradient } from 'expo-linear-gradient';

export default function AddPropertyScreen({ navigation }) {
  const [step, setStep] = useState(1);
  const totalSteps = 2;

  return (
    <View style={{ flex: 1, backgroundColor: '#FFF3E0' }}>
      <LinearGradient colors={["#FF9800", "#FFB300"]} style={{ paddingTop: 48, paddingBottom: 24, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 }}>
        <Text style={styles.header}>Add New Property</Text>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${(step / totalSteps) * 100}%` }]} />
        </View>
        <Text style={styles.stepText}>Step {step} of {totalSteps}</Text>
      </LinearGradient>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Basic Information</Text>
        <Text style={styles.label}>Property Type</Text>
        <View style={styles.typeRow}>
          {['Apartment', 'Room', 'Office', 'Shop', 'Parking'].map(type => (
            <TouchableOpacity key={type} style={styles.typeBtn}>
              <Text style={styles.typeBtnText}>{type}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.navBtn, step === 1 && styles.navBtnDisabled]}
            onPress={() => setStep(step - 1)}
            disabled={step === 1}
          >
            <Text style={step === 1 ? styles.navBtnTextDisabled : styles.navBtnText}>Previous</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.navBtn, step === totalSteps && styles.navBtnDisabled]}
            onPress={() => setStep(step + 1)}
            disabled={step === totalSteps}
          >
            <Text style={step === totalSteps ? styles.navBtnTextDisabled : styles.navBtnText}>Next</Text>
          </TouchableOpacity>
        </View>
      </View>
      <BottomNav navigation={navigation} active="AddProperty" />
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
  progressBarContainer: {
    height: 8,
    backgroundColor: '#FFE0B2',
    borderRadius: 4,
    marginHorizontal: 32,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  stepText: {
    color: '#FFF8E1',
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: 'bold',
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF9800',
    marginBottom: 16,
  },
  label: {
    color: '#757575',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  typeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  typeBtn: {
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 18,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#FF9800',
  },
  typeBtnText: {
    color: '#FF9800',
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  navBtn: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    backgroundColor: '#FFECB3',
    borderRadius: 8,
    marginHorizontal: 8,
  },
  navBtnDisabled: {
    backgroundColor: '#FFE0B2',
  },
  navBtnText: {
    color: '#FF9800',
    fontWeight: 'bold',
  },
  navBtnTextDisabled: {
    color: '#BDBDBD',
    fontWeight: 'bold',
  },
}); 