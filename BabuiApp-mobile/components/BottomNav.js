import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { MaterialIcons, Ionicons, FontAwesome } from '@expo/vector-icons';

export default function BottomNav({ navigation, active }) {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.tab} onPress={() => navigation.navigate('Home')}>
        <MaterialIcons name="home" size={28} color={active === 'Home' ? '#FF9800' : '#BDBDBD'} />
        <Text style={[styles.label, active === 'Home' && styles.activeLabel]}>Home</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('AddProperty')}>
        <Ionicons name="add-circle" size={48} color="#4CAF50" style={styles.fabIcon} />
        <Text style={styles.fabLabel}>Add Property</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.tab} onPress={() => navigation.navigate('Chat')}>
        <Ionicons name="chatbubble-ellipses" size={28} color={active === 'Chat' ? '#FF9800' : '#BDBDBD'} />
        <Text style={[styles.label, active === 'Chat' && styles.activeLabel]}>Chat</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.tab} onPress={() => navigation.navigate('Profile')}>
        <FontAwesome name="user" size={28} color={active === 'Profile' ? '#FF9800' : '#BDBDBD'} />
        <Text style={[styles.label, active === 'Profile' && styles.activeLabel]}>Profile</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 70,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  tab: {
    alignItems: 'center',
    flex: 1,
  },
  label: {
    fontSize: 12,
    color: '#BDBDBD',
    marginTop: 2,
  },
  activeLabel: {
    color: '#FF9800',
    fontWeight: 'bold',
  },
  fab: {
    alignItems: 'center',
    marginTop: -24,
    flex: 1,
  },
  fabIcon: {
    shadowColor: '#4CAF50',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  fabLabel: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: 'bold',
    marginTop: -8,
  },
}); 