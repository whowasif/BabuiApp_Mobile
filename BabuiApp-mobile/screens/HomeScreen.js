import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ScrollView, Modal, TextInput } from 'react-native';
import { BasicSearchFilters, AdvancedSearchFilters } from '../components/SearchFilters';
import PropertyCard from '../components/PropertyCard';
import { usePropertyStore } from '../stores/propertyStore';
import BottomNav from '../components/BottomNav';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import PropertiesMap from '../components/PropertiesMap';
import { useAuthStore } from '../stores/authStore';
import { supabase } from '../utils/supabaseClient';

export default function HomeScreen({ navigation }) {
  const [viewMode, setViewMode] = useState('grid');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filters, setFilters] = useState({});
  const properties = usePropertyStore(state => state.properties);
  const fetchProperties = usePropertyStore(state => state.fetchProperties);
  const [selectedPropertyId, setSelectedPropertyId] = useState(null);
  const user = useAuthStore(state => state.user);
  const guestMode = useAuthStore(state => state.guestMode);
  if (!user && guestMode) {
    console.log('HomeScreen: Entered guest mode, user is not signed in.');
  }
  const openGlobalModal = useAuthStore(state => state.openGlobalModal);
  const signOut = useAuthStore(state => state.signOut);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [authTab, setAuthTab] = useState('signIn');
  // Auth form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const setGuestMode = useAuthStore(state => state.setGuestMode);
  const [showSignOutModal, setShowSignOutModal] = useState(false);

  // Sign in handler
  const handleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;
      setProfileModalVisible(false);
      setEmail(''); setPassword('');
    } catch (err) {
      setError(err.message || 'Sign in failed');
    } finally {
      setLoading(false);
    }
  };

  // Sign up handler
  const handleSignUp = async () => {
    setLoading(true);
    setError('');
    if (!name) { setError('Name is required'); setLoading(false); return; }
    if (!gender) { setError('Gender is required'); setLoading(false); return; }
    if (password !== confirmPassword) { setError('Passwords do not match'); setLoading(false); return; }
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name, phone, gender } },
      });
      if (signUpError) throw signUpError;
      setProfileModalVisible(false);
      setEmail(''); setPassword(''); setConfirmPassword(''); setName(''); setPhone(''); setGender('');
    } catch (err) {
      setError(err.message || 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

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
          <TouchableOpacity
            style={styles.profileIconBtn}
            onPress={() => {
              if (guestMode && !user) {
                setGuestMode(false);
              } else if (user) {
                setShowSignOutModal(true);
              } else {
                openGlobalModal();
              }
            }}
          >
            <MaterialIcons name="account-circle" size={32} color="#fff" />
          </TouchableOpacity>
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
      {(user || guestMode) && <BottomNav navigation={navigation} active="Home" />}
      {showSignOutModal && (
        <Modal
          visible={showSignOutModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowSignOutModal(false)}
        >
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' }}>
            <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 24, minWidth: 200 }}>
              <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 16, color: '#FF9800', textAlign: 'center' }}>Account</Text>
              <TouchableOpacity
                style={{ backgroundColor: '#FF9800', borderRadius: 8, padding: 12, marginBottom: 8 }}
                onPress={async () => { await signOut(); setShowSignOutModal(false); }}
              >
                <Text style={{ color: '#fff', textAlign: 'center', fontWeight: 'bold' }}>Sign Out</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowSignOutModal(false)}>
                <Text style={{ color: '#888', textAlign: 'center' }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
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
  profileIconBtn: {
    position: 'absolute',
    top: 36, // was 24, increased further to lower the icon more
    right: 16,
    zIndex: 10,
  },
}); 