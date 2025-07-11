import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import PropertyCard from '../components/PropertyCard';
import { usePropertyStore } from '../stores/propertyStore';
import BottomNav from '../components/BottomNav';
import { LinearGradient } from 'expo-linear-gradient';

export default function PropertiesScreen({ navigation }) {
  const [viewMode, setViewMode] = useState('grid');
  const properties = usePropertyStore(state => state.properties);
  const fetchProperties = usePropertyStore(state => state.fetchProperties);

  useEffect(() => {
    fetchProperties();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: '#FFF3E0' }}>
      <LinearGradient colors={["#FF9800", "#FFB300"]} style={{ paddingTop: 48, paddingBottom: 24, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 }}>
        <Text style={styles.header}>Properties</Text>
      </LinearGradient>
      <View style={{ flex: 1 }}>
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsCount}>{properties.length} Nests Found</Text>
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[styles.toggleBtn, viewMode === 'grid' && styles.toggleBtnActive]}
              onPress={() => setViewMode('grid')}
            >
              <Text style={viewMode === 'grid' ? styles.toggleBtnTextActive : styles.toggleBtnText}>Grid</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleBtn, viewMode === 'list' && styles.toggleBtnActive]}
              onPress={() => setViewMode('list')}
            >
              <Text style={viewMode === 'list' ? styles.toggleBtnTextActive : styles.toggleBtnText}>List</Text>
            </TouchableOpacity>
          </View>
        </View>
        <FlatList
          data={properties}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <PropertyCard property={item} onPress={() => navigation.navigate('PropertyDetail')} />
          )}
          contentContainerStyle={styles.propertyList}
        />
      </View>
      <BottomNav navigation={navigation} active="Properties" />
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
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  resultsCount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF9800',
  },
  toggleContainer: {
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
  },
  toggleBtn: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    backgroundColor: '#FFE0B2',
  },
  toggleBtnActive: {
    backgroundColor: '#FF9800',
  },
  toggleBtnText: {
    color: '#FF9800',
    fontWeight: 'bold',
  },
  toggleBtnTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  propertyList: {
    padding: 16,
    gap: 16,
  },
}); 