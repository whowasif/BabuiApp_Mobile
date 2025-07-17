import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import BottomNav from '../components/BottomNav';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../stores/authStore';
import { usePropertyStore } from '../stores/propertyStore';
import { useChatStore } from '../stores/chatStore';
import { Switch, Alert } from 'react-native';
import PropertyCard from '../components/PropertyCard';
import { supabase } from '../utils/supabaseClient';
import authLogger from '../utils/authLogger';

const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'properties', label: 'My Properties' },
  { id: 'favorites', label: 'Favorites' },
  { id: 'settings', label: 'Settings' },
];

const tabIcons = {
  overview: 'person',
  properties: 'home',
  favorites: 'favorite',
  settings: 'settings',
};

export default function ProfileScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);
  const [propertiesLoading, setPropertiesLoading] = useState(true);
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // All store hooks must be called before any conditional returns
  const user = useAuthStore(state => state.user);
  const guestMode = useAuthStore(state => state.guestMode);
  const setGuestMode = useAuthStore(state => state.setGuestMode);
  const signOut = useAuthStore(state => state.signOut);
  const addFavorite = useAuthStore(state => state.addFavorite);
  const removeFavorite = useAuthStore(state => state.removeFavorite);
  const isFavorite = useAuthStore(state => state.isFavorite);
  const toggleFavorite = useAuthStore(state => state.toggleFavorite);
  const properties = usePropertyStore(state => state.properties);
  const fetchProperties = usePropertyStore(state => state.fetchProperties);
  const myProperties = usePropertyStore(state => state.myProperties);
  const fetchMyProperties = usePropertyStore(state => state.fetchMyProperties);
  const chatCount = useChatStore(state => state.chats.length);
  const fetchChats = useChatStore(state => state.fetchChats);

  // Log component mount and state
  useEffect(() => {
    authLogger.componentMount('ProfileScreen', {
      hasUser: !!user,
      guestMode,
      userId: user?.id
    });

    return () => {
      authLogger.componentUnmount('ProfileScreen');
    };
  }, []);

  // Log state changes
  useEffect(() => {
    authLogger.info('ProfileScreen', 'State updated', {
      hasUser: !!user,
      guestMode,
      userId: user?.id
    });
  }, [user, guestMode]);

  // Memoized computed values to avoid recalculation on every render
  const favoriteProperties = useMemo(() => {
    if (!user?.favorites || !properties.length) return [];
    return properties.filter(p => user.favorites.includes(p.id));
  }, [user?.favorites, properties]);

  // Optimized profile fetching with caching
  const fetchProfile = useCallback(async () => {
    if (!user) return;
    
    setProfileLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      setProfile(data);
    } catch (err) {
      console.error('Profile fetch error:', err);
      setProfile(null);
    } finally {
      setProfileLoading(false);
    }
  }, [user?.id]);

  // Optimized properties fetching
  const fetchPropertiesOptimized = useCallback(async () => {
    setPropertiesLoading(true);
    try {
      await fetchProperties();
    } catch (error) {
      console.error('Properties fetch error:', error);
    } finally {
      setPropertiesLoading(false);
    }
  }, [fetchProperties]);

  // Fetch user's properties specifically
  const fetchMyPropertiesOptimized = useCallback(async () => {
    if (!user?.id) return;
    
    setPropertiesLoading(true);
    try {
      await fetchMyProperties(user.id);
    } catch (error) {
      console.error('My properties fetch error:', error);
    } finally {
      setPropertiesLoading(false);
    }
  }, [fetchMyProperties, user?.id]);

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      
      // Load properties, profile, and user's properties in parallel
      await Promise.all([
        fetchPropertiesOptimized(),
        fetchProfile(),
        fetchMyPropertiesOptimized()
      ]);
      
      setLoading(false);
    };

    if (user) {
      loadData();
    }
  }, [user, fetchPropertiesOptimized, fetchProfile, fetchMyPropertiesOptimized]);

  // Fetch chats on mount
  useEffect(() => {
    if (user) {
      fetchChats();
    }
  }, [fetchChats, user]);

  useEffect(() => {
    if (!user && !guestMode) {
      navigation.replace('SignIn');
    }
  }, [user, guestMode, navigation]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Refresh both data sources in parallel
      await Promise.all([
        fetchPropertiesOptimized(),
        fetchProfile()
      ]);
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  }, [fetchPropertiesOptimized, fetchProfile]);

  const renderProfileHeader = useCallback(() => (
    <View style={styles.profileHeader}>
      <Image 
        source={{ uri: profile?.profile_picture_url || 'https://randomuser.me/api/portraits/men/1.jpg' }} 
        style={styles.avatar} 
      />
      <View style={{ alignItems: 'center', flex: 1 }}>
        <Text style={styles.name}>
          {profile?.name_en || 'User Name'} 
          <Text style={styles.verified}>✔</Text>
        </Text>
        {profile?.name_bn ? <Text style={styles.nameBn}>{profile.name_bn}</Text> : null}
        <Text style={styles.location}>
          {profile?.location_en || 'Location'}
          {profile?.location_bn ? ` / ${profile.location_bn}` : ''}
        </Text>
        <Text style={styles.email}>{profile?.email || 'Email'}</Text>
        <Text style={styles.phone}>{profile?.phone || 'Phone'}</Text>
        <Text style={styles.gender}>
          {profile?.gender ? `Gender: ${profile.gender}` : ''}
        </Text>
      </View>
    </View>
  ), [profile]);

  const renderProfileBio = useCallback(() => (
    <View style={styles.bioCard}>
      {profile?.bio_en ? <Text style={styles.bioEn}>{profile.bio_en}</Text> : null}
      {profile?.bio_bn ? <Text style={styles.bioBn}>{profile.bio_bn}</Text> : null}
    </View>
  ), [profile]);

  const renderTabContent = useCallback(() => {
    switch (activeTab) {
      case 'overview':
        return (
          <View>
            {renderProfileBio()}
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <MaterialIcons name="home" size={22} color="#4CAF50" />
                <Text style={styles.statNum}>{myProperties.length}</Text>
                <Text style={styles.statLabel}>Properties</Text>
              </View>
              <View style={styles.statCard}>
                <MaterialIcons name="favorite" size={22} color="#E91E63" />
                <Text style={styles.statNum}>{user?.favorites?.length || 0}</Text>
                <Text style={styles.statLabel}>Favorites</Text>
              </View>
              <View style={styles.statCard}>
                <MaterialIcons name="message" size={22} color="#2196F3" />
                <Text style={styles.statNum}>{chatCount}</Text>
                <Text style={styles.statLabel}>Messages</Text>
              </View>
              <View style={styles.statCard}>
                <MaterialIcons name="star" size={22} color="#FFD600" />
                <Text style={styles.statNum}>0</Text>
                <Text style={styles.statLabel}>Rating</Text>
              </View>
            </View>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Recent Activity</Text>
              <Text style={styles.activityItem}>• Listed a new property - 2 days ago</Text>
              <Text style={styles.activityItem}>• Received a message - 3 days ago</Text>
              <Text style={styles.activityItem}>• Added a property to favorites - 5 days ago</Text>
            </View>
          </View>
        );
      case 'properties':
        return (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>My Properties</Text>
            {propertiesLoading ? (
              <ActivityIndicator size="small" color="#FF9800" style={{ marginVertical: 20 }} />
            ) : myProperties.length === 0 ? (
              <Text style={styles.placeholder}>No properties listed yet.</Text>
            ) : (
              myProperties.map(property => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  onPress={() => navigation.navigate('PropertyDetail', { propertyId: property.id })}
                  onFavorite={() => toggleFavorite(property.id)}
                  isFavorite={isFavorite(property.id)}
                />
              ))
            )}
          </View>
        );
      case 'favorites':
        return (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Favorite Properties</Text>
            {propertiesLoading ? (
              <ActivityIndicator size="small" color="#FF9800" style={{ marginVertical: 20 }} />
            ) : favoriteProperties.length === 0 ? (
              <Text style={styles.placeholder}>No favorite properties yet.</Text>
            ) : (
              favoriteProperties.map(property => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  onPress={() => navigation.navigate('PropertyDetail', { propertyId: property.id })}
                  onFavorite={() => toggleFavorite(property.id)}
                  isFavorite={isFavorite(property.id)}
                />
              ))
            )}
          </View>
        );
      case 'settings':
        return (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Account Settings</Text>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Email Notifications</Text>
              <Switch value={emailNotif} onValueChange={setEmailNotif} />
            </View>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>SMS Notifications</Text>
              <Switch value={smsNotif} onValueChange={setSmsNotif} />
            </View>
            <View style={styles.dangerZone}>
              <Text style={styles.dangerTitle}>Danger Zone</Text>
              <TouchableOpacity style={styles.dangerBtn} onPress={() => Alert.alert('Deactivate Account', 'Feature coming soon!')}>
                <Text style={styles.dangerBtnText}>Deactivate Account</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.dangerBtn} onPress={() => Alert.alert('Delete Account', 'Feature coming soon!')}>
                <Text style={styles.dangerBtnText}>Delete Account</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.logoutBtn} onPress={handleSignOut}>
              <MaterialIcons name="logout" size={20} color="#fff" />
              <Text style={styles.logoutBtnText}>Logout</Text>
            </TouchableOpacity>
          </View>
        );
      default:
        return null;
    }
  }, [activeTab, profile, myProperties, favoriteProperties, propertiesLoading, user, navigation, renderProfileBio, chatCount]);

  const handleSignOut = useCallback(() => {
    signOut(navigation);
  }, [signOut, navigation]);

  // Show guest mode message if user is in guest mode
  if (guestMode && !user) {
    authLogger.info('ProfileScreen', 'Showing guest mode interface');
    
    return (
      <View style={{ flex: 1, backgroundColor: '#FFF3E0', justifyContent: 'center', alignItems: 'center' }}>
        <LinearGradient colors={["#FF9800", "#FFB300"]} style={{ paddingTop: 48, paddingBottom: 32, borderBottomLeftRadius: 32, borderBottomRightRadius: 32, width: '100%' }}>
          <View style={{ alignItems: 'center', paddingHorizontal: 20 }}>
            <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 16 }}>Guest Mode</Text>
            <Text style={{ fontSize: 16, color: '#FFF8E1', textAlign: 'center', marginBottom: 24 }}>
              You are currently browsing in guest mode. Sign in to access your profile and save favorites.
            </Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity 
                style={{ backgroundColor: '#fff', borderRadius: 8, paddingHorizontal: 20, paddingVertical: 12 }}
                onPress={() => {
                  authLogger.info('ProfileScreen', 'Guest mode: Sign In button pressed');
                  
                  // First set guest mode to false
                  setGuestMode(false);
                  
                  // Then navigate to SignIn with a slight delay to ensure state is updated
                  setTimeout(() => {
                    authLogger.navigationAttempt('ProfileScreen', 'Profile', 'SignIn', {
                      hasUser: false,
                      guestMode: false,
                      isAuthenticated: false
                    });
                    navigation.replace('SignIn');
                  }, 50);
                }}
              >
                <Text style={{ color: '#FF9800', fontWeight: 'bold' }}>Sign In</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={{ backgroundColor: 'transparent', borderRadius: 8, paddingHorizontal: 20, paddingVertical: 12, borderWidth: 1, borderColor: '#fff' }}
                onPress={() => {
                  authLogger.info('ProfileScreen', 'Guest mode: Continue Browsing button pressed');
                  navigation.navigate('Home');
                }}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Continue Browsing</Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
        <BottomNav navigation={navigation} active="Profile" />
      </View>
    );
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF3E0' }}>
        <ActivityIndicator size="large" color="#FF9800" />
        <Text style={{ marginTop: 16, color: '#FF9800', fontSize: 16 }}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#FFF3E0' }}>
      <LinearGradient colors={["#FF9800", "#FFB300"]} style={{ paddingTop: 48, paddingBottom: 32, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 }}>
        {renderProfileHeader()}
        <TouchableOpacity style={styles.editBtn} onPress={() => navigation.navigate('EditProfile')}>
          <Text style={styles.editBtnText}>Edit Profile</Text>
        </TouchableOpacity>
        <View style={styles.tabsRow}>
          {tabs.map(tab => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tabBtn, activeTab === tab.id && styles.tabBtnActive]}
              onPress={() => setActiveTab(tab.id)}
            >
              <MaterialIcons name={tabIcons[tab.id]} size={20} color={activeTab === tab.id ? '#fff' : '#FF9800'} />
              <Text style={activeTab === tab.id ? styles.tabBtnTextActive : styles.tabBtnText}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>
      <ScrollView 
        contentContainerStyle={{ paddingBottom: 80 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#FF9800"]}
            tintColor="#FF9800"
          />
        }
      >
        {renderTabContent()}
        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
          <MaterialIcons name="logout" size={20} color="#fff" />
          <Text style={styles.signOutBtnText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
      {user && <BottomNav navigation={navigation} active="Profile" />}
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
  gender: {
    color: '#FFF3E0',
    fontSize: 13,
    marginTop: 4,
  },
  nameBn: {
    fontSize: 18,
    color: '#FFF3E0',
    marginTop: 2,
  },
  bioCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    margin: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  bioEn: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
    marginBottom: 8,
  },
  bioBn: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
    marginBottom: 8,
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
    flexDirection: 'row',
    alignItems: 'center',
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
    marginLeft: 8,
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
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
  },
  dangerZone: {
    backgroundColor: '#FFEBEE',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    marginBottom: 20,
  },
  dangerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#D32F2F',
    marginBottom: 12,
  },
  dangerBtn: {
    backgroundColor: '#FFCDD2',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 15,
    alignItems: 'center',
    marginBottom: 8,
  },
  dangerBtnText: {
    color: '#D32F2F',
    fontWeight: 'bold',
    fontSize: 15,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF9800',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignSelf: 'center',
    elevation: 2,
  },
  logoutBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 10,
  },
  signOutBtn: {
    backgroundColor: '#E53935',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    margin: 16,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  signOutBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
}); 