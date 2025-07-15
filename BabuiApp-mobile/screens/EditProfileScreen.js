import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, ActivityIndicator, Alert } from 'react-native';
import BottomNav from '../components/BottomNav';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../utils/supabaseClient';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';

const genderOptions = [
  { label: 'Select Gender', value: '' },
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Other', value: 'other' },
];

export default function EditProfileScreen({ navigation }) {
  const [profile, setProfile] = useState({
    profile_picture_url: '',
    name_en: '',
    name_bn: '',
    email: '',
    phone: '',
    location_en: '',
    location_bn: '',
    bio_en: '',
    bio_bn: '',
    gender: '',
    id: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError('');
      try {
        // Get current user id from Supabase Auth
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError) throw authError;
        const userId = user.id;
        // Fetch user row from users table
        const { data, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single();
        if (userError) throw userError;
        setProfile(data);
      } catch (err) {
        setError(err.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const pickImage = async () => {
    console.log('Opening image picker...');
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaType.Images,
      allowsEditing: false, // no crop, works in Expo Go
      quality: 0.7,
    });
    console.log('Image picker result:', result);
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const image = result.assets[0];
      console.log('Selected image:', image);
      try {
        setSaving(true);
        const ext = image.uri.split('.').pop();
        const fileName = `${profile.id || Date.now()}.${ext}`;
        console.log('Uploading to Supabase Storage:', fileName);
        const response = await fetch(image.uri);
        const fileBlob = await response.blob();
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('profile-pictures')
          .upload(fileName, fileBlob, { upsert: true });
        console.log('Upload response:', { uploadData, uploadError });
        if (uploadError) throw uploadError;
        const { data: publicUrlData } = supabase.storage
          .from('profile-pictures')
          .getPublicUrl(fileName);
        console.log('Public URL data:', publicUrlData);
        setProfile({ ...profile, profile_picture_url: publicUrlData.publicUrl });
      } catch (err) {
        console.log('Image upload error:', err);
        setError('Failed to upload image: ' + (err.message || ''));
      } finally {
        setSaving(false);
      }
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      if (!profile.name_en || !profile.gender) throw new Error('Name (English) and gender are required');
      const { error: updateError } = await supabase
        .from('users')
        .update({
          profile_picture_url: profile.profile_picture_url,
          name_en: profile.name_en,
          name_bn: profile.name_bn,
          phone: profile.phone,
          location_en: profile.location_en,
          location_bn: profile.location_bn,
          bio_en: profile.bio_en,
          bio_bn: profile.bio_bn,
          gender: profile.gender,
        })
        .eq('id', profile.id);
      if (updateError) throw updateError;
      setSuccess('Profile updated!');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
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
      <LinearGradient colors={["#FF9800", "#FFB300"]} style={{ paddingTop: 48, paddingBottom: 24, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 }}>
        <Text style={styles.header}>Edit Profile</Text>
      </LinearGradient>
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        <View style={styles.card}>
          <View style={styles.profilePicRow}>
            <TouchableOpacity onPress={pickImage}>
              <Image source={{ uri: profile.profile_picture_url || 'https://randomuser.me/api/portraits/men/1.jpg' }} style={styles.avatar} />
              <Text style={{ color: '#FF9800', textAlign: 'center', marginTop: 4 }}>Change Photo</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <View style={styles.inputRow}>
            <View style={styles.inputCol}>
              <Text style={styles.label}>Name (English)</Text>
              <TextInput style={styles.input} value={profile.name_en} onChangeText={v => setProfile({ ...profile, name_en: v })} />
            </View>
            <View style={styles.inputCol}>
              <Text style={styles.label}>Name (Bengali)</Text>
              <TextInput style={styles.input} value={profile.name_bn || ''} onChangeText={v => setProfile({ ...profile, name_bn: v })} />
            </View>
          </View>
          <View style={styles.inputRow}>
            <View style={styles.inputCol}>
              <Text style={styles.label}>Email</Text>
              <TextInput style={styles.input} value={profile.email} editable={false} />
            </View>
            <View style={styles.inputCol}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput style={styles.input} value={profile.phone || ''} onChangeText={v => setProfile({ ...profile, phone: v })} keyboardType="phone-pad" />
            </View>
          </View>
          <View style={styles.inputRow}>
            <View style={styles.inputCol}>
              <Text style={styles.label}>Location (English)</Text>
              <TextInput style={styles.input} value={profile.location_en || ''} onChangeText={v => setProfile({ ...profile, location_en: v })} />
            </View>
            <View style={styles.inputCol}>
              <Text style={styles.label}>Location (Bengali)</Text>
              <TextInput style={styles.input} value={profile.location_bn || ''} onChangeText={v => setProfile({ ...profile, location_bn: v })} />
            </View>
          </View>
          <View style={styles.inputRow}>
            <View style={styles.inputCol}>
              <Text style={styles.label}>Bio (English)</Text>
              <TextInput style={styles.input} value={profile.bio_en || ''} onChangeText={v => setProfile({ ...profile, bio_en: v })} multiline />
            </View>
            <View style={styles.inputCol}>
              <Text style={styles.label}>Bio (Bengali)</Text>
              <TextInput style={styles.input} value={profile.bio_bn || ''} onChangeText={v => setProfile({ ...profile, bio_bn: v })} multiline />
            </View>
          </View>
          <View style={styles.inputRow}>
            <View style={styles.inputCol}>
              <Text style={styles.label}>Gender</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={profile.gender}
                  onValueChange={v => setProfile({ ...profile, gender: v })}
                  style={styles.input}
                >
                  {genderOptions.map(opt => (
                    <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
                  ))}
                </Picker>
              </View>
            </View>
          </View>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          {success ? <Text style={styles.success}>{success}</Text> : null}
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
            {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Save Changes</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
      <BottomNav navigation={navigation} active="Profile" />
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
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 24,
  },
  profilePicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    marginRight: 16,
    borderWidth: 3,
    borderColor: '#FF9800',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF9800',
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  inputCol: {
    flex: 1,
  },
  label: {
    color: '#757575',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  pickerWrapper: {
    width: '100%',
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    marginBottom: 4,
    overflow: 'hidden',
  },
  saveBtn: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  error: {
    color: '#E53935',
    marginBottom: 8,
    fontWeight: 'bold',
  },
  success: {
    color: '#388E3C',
    marginBottom: 8,
    fontWeight: 'bold',
  },
}); 