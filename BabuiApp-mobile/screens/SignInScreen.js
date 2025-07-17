import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView, RefreshControl } from 'react-native';
import { supabase } from '../utils/supabaseClient';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuthStore } from '../stores/authStore';
import authLogger from '../utils/authLogger';
import testAuthFlow from '../utils/testAuthFlow';

export default function SignInScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const setGuestMode = useAuthStore(state => state.setGuestMode);
  const user = useAuthStore(state => state.user);
  const guestMode = useAuthStore(state => state.guestMode);

  // Log component mount
  useEffect(() => {
    authLogger.componentMount('SignInScreen', {
      hasUser: !!user,
      guestMode,
      navigation: navigation?.getState()?.routes
    });

    return () => {
      authLogger.componentUnmount('SignInScreen');
    };
  }, []);

  // Log auth state changes
  useEffect(() => {
    authLogger.info('SignInScreen', 'Auth state changed', {
      hasUser: !!user,
      guestMode,
      userEmail: user?.email
    });
  }, [user, guestMode]);

  const onRefresh = async () => {
    authLogger.info('SignInScreen', 'Refresh triggered');
    setRefreshing(true);
    try {
      // Clear form data
      setEmail('');
      setPassword('');
      setError('');
      authLogger.info('SignInScreen', 'Form cleared on refresh');
    } catch (error) {
      authLogger.logError('SignInScreen', error, { action: 'refresh' });
    } finally {
      setRefreshing(false);
    }
  };

  const handleSignIn = async () => {
    authLogger.signInAttempt(email);
    setLoading(true);
    setError('');
    
    try {
      authLogger.info('SignInScreen', 'Attempting Supabase sign in', { email });
      
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        authLogger.signInError(email, error);
        throw error;
      }
      
      authLogger.signInSuccess(email);
      authLogger.info('SignInScreen', 'Sign in successful, auth state change will handle navigation');
      
      // Navigation will be handled by auth state listener in MainStack
      // Add fallback navigation after 2 seconds in case auth state listener doesn't work
      setTimeout(() => {
        const currentUser = useAuthStore.getState().user;
        if (currentUser && !loading) {
          authLogger.info('SignInScreen', 'Fallback navigation triggered', { userId: currentUser.id });
          navigation.replace('Home');
        }
      }, 2000);
      
    } catch (err) {
      authLogger.logError('SignInScreen', err, { action: 'signIn', email });
      setError(err.message || 'Sign in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      authLogger.warn('SignInScreen', 'Forgot password attempted without email');
      Alert.alert('Forgot Password', 'Please enter your email address above first.');
      return;
    }
    
    authLogger.info('SignInScreen', 'Password reset requested', { email });
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      
      authLogger.info('SignInScreen', 'Password reset email sent', { email });
      Alert.alert('Password Reset', 'A password reset email has been sent if the email exists.');
    } catch (err) {
      authLogger.logError('SignInScreen', err, { action: 'forgotPassword', email });
      Alert.alert('Error', err.message || 'Failed to send reset email.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestMode = () => {
    authLogger.info('SignInScreen', 'Guest mode button pressed');
    
    try {
      authLogger.guestModeActivated();
      setGuestMode(true);
      
      authLogger.info('SignInScreen', 'Guest mode set to true, attempting navigation');
      
      // Force navigation to Home after setting guest mode
      setTimeout(() => {
        authLogger.navigationAttempt('SignIn', 'Home', {
          user: null,
          guestMode: true
        });
        
        navigation.replace('Home');
        
        authLogger.info('SignInScreen', 'Navigation to Home completed');
      }, 100);
      
    } catch (error) {
      authLogger.logError('SignInScreen', error, { action: 'guestModeActivation' });
    }
  };

  const handleSignUpNavigation = () => {
    authLogger.navigationAttempt('SignIn', 'SignUp', {
      user: null,
      guestMode: false
    });
    
    // Ensure guest mode is disabled when navigating to sign up
    setGuestMode(false);
    
    // Add a small delay to ensure state is updated
    setTimeout(() => {
      navigation.navigate('SignUp');
    }, 50);
  };

  const handleDebugTest = () => {
    authLogger.info('SignInScreen', 'Debug test button pressed');
    
    // Log current state
    const currentState = useAuthStore.getState();
    authLogger.info('SignInScreen', 'Current auth state', {
      hasUser: !!currentState.user,
      guestMode: currentState.guestMode,
      userId: currentState.user?.id
    });
    
    // Log available functions in the store
    const storeFunctions = Object.keys(currentState).filter(key => typeof currentState[key] === 'function');
    authLogger.info('SignInScreen', 'Available store functions', { functions: storeFunctions });
    
    // Test navigation state
    const navState = navigation?.getState();
    authLogger.info('SignInScreen', 'Navigation state', {
      currentRoute: navState?.routes?.[navState.index]?.name,
      routeStack: navState?.routes?.map(r => r.name)
    });
    
    // Simple test - just log that we're in debug mode
    authLogger.info('SignInScreen', 'Debug test completed successfully');
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
          <Text style={styles.title}>Sign In</Text>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              authLogger.debug('SignInScreen', 'Email input changed', { email: text });
            }}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <View style={styles.passwordRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                authLogger.debug('SignInScreen', 'Password input changed', { hasPassword: !!text });
              }}
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
          <TouchableOpacity onPress={handleSignUpNavigation} style={styles.linkRow}>
            <Text style={styles.linkText}>Don't have an account?</Text>
            <Text style={[styles.linkText, { color: '#FF9800', fontWeight: 'bold' }]}> Sign Up</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotRow}>
            <Text style={[styles.linkText, { color: '#FF9800' }]}>Forgot password?</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ marginTop: 16, backgroundColor: '#eee', borderRadius: 8, padding: 12, width: '100%' }}
            onPress={handleGuestMode}
            activeOpacity={0.7}
          >
            <Text style={{ color: '#FF9800', textAlign: 'center', fontWeight: 'bold' }}>Continue as Guest</Text>
          </TouchableOpacity>
          
          {/* Debug button - only show in development */}
          {__DEV__ && (
            <TouchableOpacity
              style={{ marginTop: 8, backgroundColor: '#ff4444', borderRadius: 8, padding: 8, width: '100%' }}
              onPress={handleDebugTest}
              activeOpacity={0.7}
            >
              <Text style={{ color: '#fff', textAlign: 'center', fontWeight: 'bold', fontSize: 12 }}>DEBUG: Test Auth Flow</Text>
            </TouchableOpacity>
          )}
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