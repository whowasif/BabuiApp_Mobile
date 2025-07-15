import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, ActivityIndicator } from 'react-native';
import BottomNav from '../components/BottomNav';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../stores/authStore';
import { usePropertyStore } from '../stores/propertyStore';
import { Switch, Alert } from 'react-native';
import PropertyCard from '../components/PropertyCard';
import { supabase } from '../utils/supabaseClient';

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
  const user = useAuthStore(state => state.user);
  const signOut = useAuthStore(state => state.signOut);
  const addFavorite = useAuthStore(state => state.addFavorite);
  const removeFavorite = useAuthStore(state => state.removeFavorite);
  const isFavorite = useAuthStore(state => state.isFavorite);
  const properties = usePropertyStore(state => state.properties);
  const fetchProperties = usePropertyStore(state => state.fetchProperties);
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(false);

  useEffect(() => { fetchProperties(); }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
        if (authError) throw authError;
        const userId = authUser.id;
        const { data, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single();
        if (userError) throw userError;
        setProfile(data);
      } catch (err) {
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    if (!user) {
      navigation.replace('SignIn');
    }
  }, [user]);

  const favoriteProperties = properties.filter(p => user?.favorites?.includes(p.id));
  const myProperties = properties.filter(p => p.landlord?.id === user?.id);

  const renderProfileHeader = () => (
    <View style={styles.profileHeader}>
      <Image source={{ uri: profile?.profile_picture_url || 'https://randomuser.me/api/portraits/men/1.jpg' }} style={styles.avatar} />
      <View style={{ alignItems: 'center', flex: 1 }}>
        <Text style={styles.name}>{profile?.name_en || 'User Name'} <Text style={styles.verified}>✔</Text></Text>
        {profile?.name_bn ? <Text style={styles.nameBn}>{profile.name_bn}</Text> : null}
        <Text style={styles.location}>{profile?.location_en || 'Location'}{profile?.location_bn ? ` / ${profile.location_bn}` : ''}</Text>
        <Text style={styles.email}>{profile?.email || 'Email'}</Text>
        <Text style={styles.phone}>{profile?.phone || 'Phone'}</Text>
        <Text style={styles.gender}>{profile?.gender ? `Gender: ${profile.gender}` : ''}</Text>
      </View>
    </View>
  );

  const renderProfileBio = () => (
    <View style={styles.bioCard}>
      {profile?.bio_en ? <Text style={styles.bioEn}>{profile.bio_en}</Text> : null}
      {profile?.bio_bn ? <Text style={styles.bioBn}>{profile.bio_bn}</Text> : null}
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <View>
            {renderProfileBio()}
            <View style={styles.statsRow}>
              <View style={styles.statCard}><MaterialIcons name="home" size={22} color="#4CAF50" /><Text style={styles.statNum}>{myProperties.length}</Text><Text style={styles.statLabel}>Properties</Text></View>
              <View style={styles.statCard}><MaterialIcons name="favorite" size={22} color="#E91E63" /><Text style={styles.statNum}>{user?.favorites?.length || 0}</Text><Text style={styles.statLabel}>Favorites</Text></View>
              <View style={styles.statCard}><MaterialIcons name="message" size={22} color="#2196F3" /><Text style={styles.statNum}>8</Text><Text style={styles.statLabel}>Messages</Text></View>
              <View style={styles.statCard}><MaterialIcons name="star" size={22} color="#FFD600" /><Text style={styles.statNum}>0</Text><Text style={styles.statLabel}>Rating</Text></View>
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
            {myProperties.length === 0 ? (
              <Text style={styles.placeholder}>No properties listed yet.</Text>
            ) : (
              myProperties.map(property => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  onPress={() => navigation.navigate('PropertyDetail', { propertyId: property.id })}
                  onFavorite={() => isFavorite(property.id) ? removeFavorite(property.id) : addFavorite(property.id)}
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
            {favoriteProperties.length === 0 ? (
              <Text style={styles.placeholder}>No favorite properties yet.</Text>
            ) : (
              favoriteProperties.map(property => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  onPress={() => navigation.navigate('PropertyDetail', { propertyId: property.id })}
                  onFavorite={() => removeFavorite(property.id)}
                  isFavorite={true}
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
              <TouchableOpacity style={styles.dangerBtn} onPress={() => Alert.alert('Deactivate Account', 'Feature coming soon!')}><Text style={styles.dangerBtnText}>Deactivate Account</Text></TouchableOpacity>
              <TouchableOpacity style={styles.dangerBtn} onPress={() => Alert.alert('Delete Account', 'Feature coming soon!')}><Text style={styles.dangerBtnText}>Delete Account</Text></TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.logoutBtn} onPress={signOut}>
              <MaterialIcons name="logout" size={20} color="#fff" />
              <Text style={styles.logoutBtnText}>Logout</Text>
            </TouchableOpacity>
          </View>
        );
      default:
        return null;
    }
  };

  const handleSignOut = () => {
    signOut(navigation);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF3E0' }}>
        <ActivityIndicator size="large" color="#FF9800" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#FFF3E0' }}>
      <LinearGradient colors={["#FF9800", "#FFB300"]} style={{ paddingTop: 48, paddingBottom: 32, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 }}>
        {renderProfileHeader()}
        <TouchableOpacity style={styles.editBtn} onPress={() => navigation.navigate('EditProfile')}><Text style={styles.editBtnText}>Edit Profile</Text></TouchableOpacity>
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
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        {renderTabContent()}
      </ScrollView>
      {user && <BottomNav navigation={navigation} active="Profile" />}
      <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
        <MaterialIcons name="logout" size={20} color="#fff" />
        <Text style={styles.signOutBtnText}>Sign Out</Text>
      </TouchableOpacity>
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