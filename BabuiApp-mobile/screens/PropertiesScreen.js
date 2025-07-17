import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, RefreshControl } from 'react-native';
import BottomNav from '../components/BottomNav';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import PropertyCard from '../components/PropertyCard';
import { usePropertyStore } from '../stores/propertyStore';
import { useAuthStore } from '../stores/authStore';

export default function PropertiesScreen({ navigation }) {
  const [refreshing, setRefreshing] = useState(false);
  const properties = usePropertyStore(state => state.properties);
  const fetchProperties = usePropertyStore(state => state.fetchProperties);
  const user = useAuthStore(state => state.user);

  useEffect(() => {
    fetchProperties();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchProperties();
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const renderPropertyCard = ({ item }) => (
    <PropertyCard 
      property={item} 
      onPress={() => navigation.navigate('PropertyDetail', { propertyId: item.id })} 
      onFavorite={() => {
        // Handle favorite functionality
        console.log('Favorite:', item.id);
      }}
      isFavorite={false}
    />
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <MaterialIcons name="home" size={64} color="#ccc" />
      <Text style={styles.emptyText}>No properties found</Text>
      <Text style={styles.emptySubtext}>Try adjusting your search filters</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient 
        colors={["#FF9800", "#FFB300"]} 
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Properties</Text>
        <Text style={styles.headerSubtitle}>Find your perfect nest</Text>
      </LinearGradient>
      
      <FlatList
        data={properties}
        keyExtractor={item => item.id}
        renderItem={renderPropertyCard}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#FF9800"]}
            tintColor="#FF9800"
          />
        }
      />
      
      <BottomNav navigation={navigation} active="properties" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF3E0',
  },
  header: {
    paddingTop: 48,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginTop: 4,
    opacity: 0.9,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
}); 