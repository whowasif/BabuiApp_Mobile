import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import SearchFilters from '../components/SearchFilters';
import PropertyCard from '../components/PropertyCard';
import { usePropertyStore } from '../stores/propertyStore';
import BottomNav from '../components/BottomNav';
import { LinearGradient } from 'expo-linear-gradient';

export default function HomeScreen({ navigation }) {
  const [viewMode, setViewMode] = useState('grid');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filters, setFilters] = useState({});
  const properties = usePropertyStore(state => state.properties);
  const fetchProperties = usePropertyStore(state => state.fetchProperties);

  useEffect(() => {
    fetchProperties();
  }, []);

  // Complete filter logic for all fields
  const filteredProperties = useMemo(() => {
    return properties.filter((property) => {
      if (filters.area && !property.location.area.toLowerCase().includes(filters.area.toLowerCase())) return false;
      if (filters.maxPrice && property.price > filters.maxPrice) return false;
      if (filters.type && property.type !== filters.type) return false;
      if (filters.bedrooms && property.bedrooms < Number(filters.bedrooms)) return false;
      if (filters.bathrooms && property.bathrooms < Number(filters.bathrooms)) return false;
      if (filters.amenities && filters.amenities.length > 0) {
        if (!filters.amenities.every(a => property.amenities && property.amenities.includes(a))) return false;
      }
      return true;
    });
  }, [properties, filters]);

  return (
    <View style={{ flex: 1, backgroundColor: '#FFF3E0' }}>
      <FlatList
        data={filteredProperties}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <PropertyCard property={item} onPress={() => navigation.navigate('PropertyDetail')} />
        )}
        contentContainerStyle={{ padding: 16, paddingTop: 0, paddingBottom: 80 }}
        ListHeaderComponent={
          <>
            <LinearGradient colors={["#FF9800", "#FFB300"]} style={{ paddingBottom: 32, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 }}>
              <View style={{ alignItems: 'center', paddingTop: 40, paddingBottom: 24 }}>
                <Text style={{ fontSize: 36, fontWeight: 'bold', color: '#fff', marginBottom: 8, textShadowColor: '#FFA726', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 4 }}>Your Dream Nest</Text>
                <Text style={{ fontSize: 18, color: '#FFF8E1', marginBottom: 4 }}>Find the perfect nest, crafted like a Babui bird</Text>
                <Text style={{ fontSize: 14, color: '#FFF3E0' }}>Inspired by nature's greatest architect</Text>
              </View>
              <View style={{ marginHorizontal: 16, marginBottom: 0, backgroundColor: '#fff', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, elevation: 4 }}>
                <SearchFilters
                  filters={filters}
                  onFiltersChange={setFilters}
                  onSearch={fetchProperties}
                />
                <TouchableOpacity onPress={() => setShowAdvancedFilters(!showAdvancedFilters)} style={{ marginTop: 8, alignSelf: 'flex-end', backgroundColor: '#FFF3E0', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 }}>
                  <Text style={{ color: '#FF9800', fontWeight: 'bold' }}>{showAdvancedFilters ? 'Hide' : 'Show'} Advanced</Text>
                </TouchableOpacity>
                {showAdvancedFilters && (
                  <Text style={{ color: '#BDBDBD', fontStyle: 'italic', marginVertical: 8 }}>[Advanced Filters Placeholder]</Text>
                )}
              </View>
            </LinearGradient>
            <View style={{ marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#FF9800' }}>{filteredProperties.length} Nests Found</Text>
                <View style={{ flexDirection: 'row', borderRadius: 8, overflow: 'hidden' }}>
                  <TouchableOpacity
                    style={{ paddingVertical: 6, paddingHorizontal: 16, backgroundColor: viewMode === 'grid' ? '#FF9800' : '#FFE0B2' }}
                    onPress={() => setViewMode('grid')}
                  >
                    <Text style={{ color: viewMode === 'grid' ? '#fff' : '#FF9800', fontWeight: 'bold' }}>Grid</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{ paddingVertical: 6, paddingHorizontal: 16, backgroundColor: viewMode === 'map' ? '#FF9800' : '#FFE0B2' }}
                    onPress={() => setViewMode('map')}
                  >
                    <Text style={{ color: viewMode === 'map' ? '#fff' : '#FF9800', fontWeight: 'bold' }}>Map</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </>
        }
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginVertical: 32 }}>
            <Text style={{ color: '#BDBDBD', fontStyle: 'italic' }}>[Map View Placeholder]</Text>
          </View>
        }
      />
      <BottomNav navigation={navigation} active="Home" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
  },
  heroSection: {
    marginBottom: 24,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF9800',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 18,
    color: '#FFB300',
    marginBottom: 4,
  },
  heroDescription: {
    fontSize: 14,
    color: '#FFA726',
    marginBottom: 16,
  },
  searchSection: {
    marginBottom: 24,
    alignItems: 'center',
  },
  advancedBtn: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#FFECB3',
    borderRadius: 8,
  },
  advancedBtnText: {
    color: '#FF9800',
    fontWeight: 'bold',
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
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
  placeholder: {
    color: '#BDBDBD',
    fontStyle: 'italic',
    marginVertical: 8,
  },
  placeholderContent: {
    alignItems: 'center',
    marginVertical: 32,
  },
  propertyList: {
    gap: 16,
  },
}); 