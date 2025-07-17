import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ScrollView, Modal, TextInput, Animated, RefreshControl, Alert } from 'react-native';
import { BasicSearchFilters, AdvancedSearchFilters } from '../components/SearchFilters';
import PropertyCard from '../components/PropertyCard';
import { usePropertyStore } from '../stores/propertyStore';
import BottomNav from '../components/BottomNav';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import NativePropertiesMap from '../components/NativePropertiesMap';
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
  const toggleFavorite = useAuthStore(state => state.toggleFavorite);
  const isFavorite = useAuthStore(state => state.isFavorite);
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
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchProperties({});
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const [toggleAnim] = useState(new Animated.Value(viewMode === 'grid' ? 0 : 1));

  useEffect(() => {
    Animated.timing(toggleAnim, {
      toValue: viewMode === 'grid' ? 0 : 1,
      duration: 250,
      useNativeDriver: false,
    }).start();
  }, [viewMode]);

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

  const handleClearFilters = () => {
    setFilters({});
    fetchProperties({});
  };

  const renderPropertyCard = ({ item }) => (
    <PropertyCard 
      property={item} 
      onPress={() => navigation.navigate('PropertyDetail', { propertyId: item.id })} 
      onFavorite={() => toggleFavorite(item.id)}
      isFavorite={isFavorite(item.id)}
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
              if (guestMode) {
                // For guest mode, show options
                Alert.alert(
                  'Guest Mode',
                  'You are currently in guest mode. What would you like to do?',
                  [
                    { text: 'Continue as Guest', style: 'cancel' },
                    { text: 'Sign In', onPress: () => setGuestMode(false) },
                    { text: 'Sign Up', onPress: () => setGuestMode(false) }
                  ]
                );
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
        <View style={styles.resultsInfo}>
          <Text style={styles.resultsCount}>{properties.length} Nests Found</Text>
          {Object.keys(filters).length > 0 && (
            <View style={styles.filterInfo}>
              <Text style={styles.activeFilters}>Filters applied</Text>
              <TouchableOpacity style={styles.clearFilterBtn} onPress={handleClearFilters}>
                <MaterialIcons name="clear" size={16} color="#FF9800" />
                <Text style={styles.clearFilterText}>Clear</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        <View style={styles.resultsHeaderCenter}>
          <TouchableOpacity
            style={[styles.switchBtn, viewMode === 'grid' ? styles.switchBtnActive : styles.switchBtnInactive]}
            onPress={() => setViewMode('grid')}
            activeOpacity={0.85}
          >
            <MaterialIcons name="grid-view" size={20} color={viewMode === 'grid' ? '#fff' : '#FF9800'} />
            <Text style={[styles.switchBtnLabel, { color: viewMode === 'grid' ? '#fff' : '#FF9800' }]}>Grid</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.switchBtn, viewMode === 'map' ? styles.switchBtnActive : styles.switchBtnInactive, { marginLeft: 10 }]}
            onPress={() => setViewMode('map')}
            activeOpacity={0.85}
          >
            <MaterialIcons name="map" size={20} color={viewMode === 'map' ? '#fff' : '#FF9800'} />
            <Text style={[styles.switchBtnLabel, { color: viewMode === 'map' ? '#fff' : '#FF9800' }]}>Map</Text>
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
        <NativePropertiesMap
          properties={properties}
          onSelect={setSelectedPropertyId}
          selectedPropertyId={selectedPropertyId}
          initialRegion={{
            latitude: 23.685, // Center of Bangladesh
            longitude: 90.3563,
            latitudeDelta: 2,
            longitudeDelta: 2,
          }}
          setViewMode={setViewMode}
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
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#FF9800"]}
              tintColor="#FF9800"
            />
          }
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
    marginBottom: 8,
    marginTop: 8,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 8,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    maxWidth: 450,
    width: '92%',
    alignSelf: 'center',
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
  resultsHeaderCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
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
  filterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  clearFilterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 8,
  },
  clearFilterText: {
    color: '#FF9800',
    fontWeight: 'bold',
    fontSize: 12,
    marginLeft: 4,
  },
  switchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minWidth: 64,
    elevation: 2,
    borderWidth: 1.5,
    borderColor: '#FF9800',
    backgroundColor: 'transparent',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  switchBtnActive: {
    backgroundColor: '#FF9800',
    borderColor: '#FF9800',
  },
  switchBtnInactive: {
    backgroundColor: '#FFF8E1',
    borderColor: '#FF9800',
  },
  switchBtnLabel: {
    marginLeft: 6,
    fontWeight: 'bold',
    fontSize: 15,
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
  gridViewBtn: {
    position: 'absolute',
    top: 220 , // moved lower for more comfortable gap
    right: 24,
    backgroundColor: '#FF9800',
    borderRadius: 24,
    padding: 10,
    zIndex: 100,
    elevation: 8,
  },
}); 