import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, RefreshControl, ScrollView } from 'react-native';
import { supabase } from '../utils/supabaseClient';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';

const genderOptions = [
  { label: 'Select Gender', value: '' },
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Other', value: 'other' },
];

export default function SignUpScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      // Clear form data
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setName('');
      setPhone('');
      setGender('');
      setError('');
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleSignUp = async () => {
    setLoading(true);
    setError('');
    console.log('SignUp Attempt:', { email, password, confirmPassword, name, phone, gender });
    try {
      if (!email || !password || !name || !gender) throw new Error('All required fields must be filled');
      if (password !== confirmPassword) throw new Error('Passwords do not match');
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name, phone, gender } }
      });
      console.log('Supabase signUp response:', { error, data });
      if (error) {
        if (error.message && error.message.toLowerCase().includes('user already registered')) {
          throw new Error('This email is already registered. Please sign in or use a different email.');
        }
        throw error;
      }
      if (!error && data && data.user) {
        // Insert into users table
        const { error: insertError, data: insertData } = await supabase
          .from('users')
          .insert([
            {
              id: data.user.id,
              name_en: name,
              email,
              phone,
              gender
            }
          ]);
        if (insertError) {
          console.log('Error inserting into users table:', insertError);
          setError('Sign up successful, but failed to save user profile. Please contact support.');
          return;
        } else {
          console.log('User data inserted into users table:', insertData);
        }
      }
      if (!error && data && !data.session && data.user) {
        setError('Sign up successful! Please check your email to confirm your account before signing in.');
      }
      // Navigation will be handled by auth state listener in main navigator
    } catch (err) {
      console.log('SignUp Error:', err);
      setError(err.message || 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#FF9800", "#FFB300"]} style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#FF9800"]}
            tintColor="#FF9800"
          />
        }
      >
        <View style={styles.card}>
          <Text style={styles.title}>Sign Up</Text>
          <TextInput
            style={styles.input}
            placeholder="Name"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInput
            style={styles.input}
            placeholder="Phone Number (optional)"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={gender}
              onValueChange={setGender}
              style={styles.input}
            >
              {genderOptions.map(opt => (
                <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
              ))}
            </Picker>
          </View>
          <View style={styles.passwordRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(v => !v)} style={styles.eyeBtn}>
              <MaterialIcons name={showPassword ? 'visibility' : 'visibility-off'} size={24} color="#FF9800" />
            </TouchableOpacity>
          </View>
          <View style={styles.passwordRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword(v => !v)} style={styles.eyeBtn}>
              <MaterialIcons name={showConfirmPassword ? 'visibility' : 'visibility-off'} size={24} color="#FF9800" />
            </TouchableOpacity>
          </View>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <TouchableOpacity style={styles.signUpBtn} onPress={handleSignUp} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.signUpBtnText}>Sign Up</Text>}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('SignIn')} style={styles.linkRow}>
            <Text style={styles.linkText}>Already have an account?</Text>
            <Text style={[styles.linkText, { color: '#FF9800', fontWeight: 'bold' }]}> Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '95%',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF9800',
    marginBottom: 24,
  },
  input: {
    width: '100%',
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    marginBottom: 16,
  },
  pickerWrapper: {
    width: '100%',
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  eyeBtn: {
    marginLeft: -40,
    padding: 8,
  },
  signUpBtn: {
    backgroundColor: '#FF9800',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    width: '100%',
    marginTop: 8,
    marginBottom: 8,
  },
  signUpBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  linkRow: {
    flexDirection: 'row',
    marginTop: 8,
    alignItems: 'center',
  },
  linkText: {
    color: '#757575',
    fontSize: 15,
  },
  error: {
    color: '#E53935',
    marginBottom: 8,
    fontWeight: 'bold',
  },
}); 