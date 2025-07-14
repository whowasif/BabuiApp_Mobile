import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ScrollView } from 'react-native';
import { BasicSearchFilters, AdvancedSearchFilters } from '../components/SearchFilters';
import PropertyCard from '../components/PropertyCard';
import { usePropertyStore } from '../stores/propertyStore';
import BottomNav from '../components/BottomNav';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import PropertiesMap from '../components/PropertiesMap';

export default function HomeScreen({ navigation }) {
  const [viewMode, setViewMode] = useState('grid');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filters, setFilters] = useState({});
  const properties = usePropertyStore(state => state.properties);
  const fetchProperties = usePropertyStore(state => state.fetchProperties);
  const [selectedPropertyId, setSelectedPropertyId] = useState(null);

  useEffect(() => {
    fetchProperties({}); // Fetch all on mount
  }, []);

  const handleShowAdvanced = () => setShowAdvancedFilters(true);
  const handleHideAdvanced = () => setShowAdvancedFilters(false);
  const handleSearch = () => fetchProperties(filters);
  const handleApplyFilters = () => fetchProperties(filters);

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

  const renderHeader = () => (
    <>
      <LinearGradient 
        colors={["#FF9800", "#FFB300"]} 
        style={styles.heroSection}
      >
        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>Your Dream Nest</Text>
          <Text style={styles.heroSubtitle}>Find the perfect nest, crafted like a Babui bird</Text>
          <Text style={styles.heroDescription}>Inspired by nature's greatest architect</Text>
        </View>
        <View style={styles.searchContainer}>
          <BasicSearchFilters
            filters={filters}
            onFiltersChange={setFilters}
            onSearch={handleSearch}
            onShowAdvanced={handleShowAdvanced}
            showAdvanced={showAdvancedFilters}
          />
        </View>
        {showAdvancedFilters && (
          <View style={styles.advancedContainer}>
            <AdvancedSearchFilters
              filters={filters}
              onFiltersChange={setFilters}
              onApply={handleApplyFilters}
              onHideAdvanced={handleHideAdvanced}
            />
          </View>
        )}
      </LinearGradient>
      <View style={styles.resultsHeader}>
        <View className={"resultsInfo"}>
          <Text style={styles.resultsCount}>{properties.length} Nests Found</Text>
          {Object.keys(filters).length > 0 && (
            <Text style={styles.activeFilters}>Filters applied</Text>
          )}
        </View>
        <View style={styles.viewToggle}>
          <TouchableOpacity
            style={[styles.toggleBtn, viewMode === 'grid' && styles.toggleBtnActive]}
            onPress={() => setViewMode('grid')}
          >
            <MaterialIcons 
              name="grid-view" 
              size={20} 
              color={viewMode === 'grid' ? '#fff' : '#FF9800'} 
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, viewMode === 'map' && styles.toggleBtnActive]}
            onPress={() => setViewMode('map')}
          >
            <MaterialIcons 
              name="map" 
              size={20} 
              color={viewMode === 'map' ? '#fff' : '#FF9800'} 
            />
          </TouchableOpacity>
        </View>
      </View>
    </>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <MaterialIcons name="search" size={64} color="#BDBDBD" />
      <Text style={styles.emptyTitle}>No properties found</Text>
      <Text style={styles.emptySubtitle}>
        Try adjusting your filters or search criteria
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {viewMode === 'map' ? (
        <PropertiesMap
          properties={properties}
          onSelect={setSelectedPropertyId}
          selectedPropertyId={selectedPropertyId}
        />
      ) : (
        <FlatList
          data={properties}
          keyExtractor={item => item.id}
          renderItem={renderPropertyCard}
          contentContainerStyle={styles.listContainer}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmpty}
          showsVerticalScrollIndicator={false}
        />
      )}
      <BottomNav navigation={navigation} active="Home" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF3E0',
  },
  heroSection: {
    paddingBottom: 32,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  heroContent: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 24,
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textShadowColor: '#FFA726',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  heroSubtitle: {
    fontSize: 18,
    color: '#FFF8E1',
    marginBottom: 4,
  },
  heroDescription: {
    fontSize: 14,
    color: '#FFF3E0',
  },
  searchContainer: {
    marginHorizontal: 16,
    marginBottom: 0,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  advancedContainer: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  advancedButton: {
    marginTop: 8,
    alignSelf: 'flex-end',
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  advancedButtonText: {
    color: '#FF9800',
    fontWeight: 'bold',
    marginLeft: 4,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
    marginTop: 16,
  },
  resultsInfo: {
    flex: 1,
  },
  resultsCount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF9800',
  },
    activeFilters: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
  },
  viewToggle: {
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#FFE0B2',
  },
  toggleBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleBtnActive: {
    backgroundColor: '#FF9800',
  },
  listContainer: {
    paddingBottom: 80,
  },
  emptyContainer: {
    alignItems: 'center',
    marginVertical: 64,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#BDBDBD',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#BDBDBD',
    textAlign: 'center',
    lineHeight: 20,
  },
}); 