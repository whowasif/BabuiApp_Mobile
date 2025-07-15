import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { supabase } from '../utils/supabaseClient';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuthStore } from '../stores/authStore';

export default function SignInScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const setGuestMode = useAuthStore(state => state.setGuestMode);

  const handleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      // Navigation will be handled by auth state listener in main navigator
    } catch (err) {
      setError(err.message || 'Sign in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert('Forgot Password', 'Please enter your email address above first.');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      Alert.alert('Password Reset', 'A password reset email has been sent if the email exists.');
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to send reset email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#FF9800", "#FFB300"]} style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Sign In</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
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
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <TouchableOpacity style={styles.signInBtn} onPress={handleSignIn} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.signInBtnText}>Sign In</Text>}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('SignUp')} style={styles.linkRow}>
          <Text style={styles.linkText}>Don't have an account?</Text>
          <Text style={[styles.linkText, { color: '#FF9800', fontWeight: 'bold' }]}> Sign Up</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotRow}>
          <Text style={[styles.linkText, { color: '#FF9800' }]}>Forgot password?</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ marginTop: 16, backgroundColor: '#eee', borderRadius: 8, padding: 12, width: '100%' }}
          onPress={() => {
            setGuestMode(true);
            // navigation.replace('Home'); // Removed to avoid navigation error
          }}
        >
          <Text style={{ color: '#FF9800', textAlign: 'center', fontWeight: 'bold' }}>Continue as Guest</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 28,
    width: '90%',
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
  signInBtn: {
    backgroundColor: '#FF9800',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    width: '100%',
    marginTop: 8,
    marginBottom: 8,
  },
  signInBtnText: {
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
  forgotRow: {
    marginTop: 12,
  },
  error: {
    color: '#E53935',
    marginBottom: 8,
    fontWeight: 'bold',
  },
}); 