import React from 'react';
import { Modal, TouchableOpacity, Text, TextInput, View } from 'react-native';
import { useAuthStore } from '../stores/authStore';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigationState } from '@react-navigation/native';

export default function GlobalAuthModal() {
  const globalModalOpen = useAuthStore(state => state.globalModalOpen);
  const closeGlobalModal = useAuthStore(state => state.closeGlobalModal);
  const user = useAuthStore(state => state.user);
  const signOut = useAuthStore(state => state.signOut);
  const setGuestMode = useAuthStore(state => state.setGuestMode);
  const guestMode = useAuthStore(state => state.guestMode);
  const [authTab, setAuthTab] = React.useState('signIn');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [name, setName] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [gender, setGender] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  let navigationState;
  try {
    navigationState = useNavigationState(state => state);
  } catch (e) {
    // Navigation context not ready yet
    return null;
  }
  if (!navigationState) return null;
  const currentRouteName = navigationState.routes?.[navigationState.index]?.name;

  // Sign in handler
  const handleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      const { error: signInError } = await require('../utils/supabaseClient').supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;
      closeGlobalModal();
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
      const { data, error: signUpError } = await require('../utils/supabaseClient').supabase.auth.signUp({
        email,
        password,
        options: { data: { name, phone, gender } },
      });
      if (signUpError) throw signUpError;
      closeGlobalModal();
      setEmail(''); setPassword(''); setConfirmPassword(''); setName(''); setPhone(''); setGender('');
    } catch (err) {
      setError(err.message || 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  if (currentRouteName === 'SignIn') return null;

  return (
    <Modal
      visible={globalModalOpen}
      animationType="slide"
      transparent
      onRequestClose={closeGlobalModal}
    >
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' }}>
        <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 24, minWidth: 300, minHeight: 200 }}>
          <TouchableOpacity style={{ position: 'absolute', top: 8, right: 8 }} onPress={closeGlobalModal}>
            <MaterialIcons name="close" size={24} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity style={{ position: 'absolute', top: 8, left: 8 }} onPress={() => { setGuestMode(false); }}>
            <Text style={{ color: '#FF9800', fontWeight: 'bold' }}>Reset Guest Mode</Text>
          </TouchableOpacity>
          {user ? (
            <>
              <Text style={{ textAlign: 'center', color: '#FF9800', fontWeight: 'bold', fontSize: 18, marginBottom: 16 }}>Profile</Text>
              <Text style={{ textAlign: 'center', marginBottom: 16 }}>{user.name || user.email}</Text>
              <TouchableOpacity
                style={{ backgroundColor: '#FF9800', borderRadius: 8, padding: 12, marginTop: 8 }}
                onPress={async () => { await signOut(); closeGlobalModal(); }}
              >
                <Text style={{ color: '#fff', textAlign: 'center', fontWeight: 'bold' }}>Sign Out</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 16 }}>
                <TouchableOpacity onPress={() => setAuthTab('signIn')} style={{ borderBottomWidth: authTab === 'signIn' ? 2 : 0, borderBottomColor: '#FF9800', marginRight: 24 }}>
                  <Text style={{ color: authTab === 'signIn' ? '#FF9800' : '#888', fontWeight: 'bold', fontSize: 16 }}>Sign In</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setAuthTab('signUp')} style={{ borderBottomWidth: authTab === 'signUp' ? 2 : 0, borderBottomColor: '#FF9800' }}>
                  <Text style={{ color: authTab === 'signUp' ? '#FF9800' : '#888', fontWeight: 'bold', fontSize: 16 }}>Sign Up</Text>
                </TouchableOpacity>
              </View>
              {authTab === 'signIn' ? (
                <>
                  <TextInput
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                    style={{ borderWidth: 1, borderColor: '#eee', borderRadius: 8, padding: 10, marginBottom: 10 }}
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                  <TextInput
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    style={{ borderWidth: 1, borderColor: '#eee', borderRadius: 8, padding: 10, marginBottom: 10 }}
                    secureTextEntry
                  />
                  {error ? <Text style={{ color: 'red', marginBottom: 8 }}>{error}</Text> : null}
                  <TouchableOpacity
                    style={{ backgroundColor: '#FF9800', borderRadius: 8, padding: 12, marginTop: 8 }}
                    onPress={handleSignIn}
                    disabled={loading}
                  >
                    <Text style={{ color: '#fff', textAlign: 'center', fontWeight: 'bold' }}>{loading ? 'Signing In...' : 'Sign In'}</Text>
                  </TouchableOpacity>
                  {!user && !guestMode && (
                    <TouchableOpacity
                      style={{ backgroundColor: '#eee', borderRadius: 8, padding: 12, marginTop: 24 }}
                      onPress={() => {
                        setGuestMode(true);
                        setTimeout(() => {
                          closeGlobalModal();
                        }, 50);
                      }}
                    >
                      <Text style={{ color: '#FF9800', textAlign: 'center', fontWeight: 'bold' }}>Continue as Guest</Text>
                    </TouchableOpacity>
                  )}
                </>
              ) : (
                <>
                  <TextInput
                    placeholder="Name"
                    value={name}
                    onChangeText={setName}
                    style={{ borderWidth: 1, borderColor: '#eee', borderRadius: 8, padding: 10, marginBottom: 10 }}
                  />
                  <TextInput
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                    style={{ borderWidth: 1, borderColor: '#eee', borderRadius: 8, padding: 10, marginBottom: 10 }}
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                  <TextInput
                    placeholder="Phone (optional)"
                    value={phone}
                    onChangeText={setPhone}
                    style={{ borderWidth: 1, borderColor: '#eee', borderRadius: 8, padding: 10, marginBottom: 10 }}
                    keyboardType="phone-pad"
                  />
                  <TextInput
                    placeholder="Gender (male/female/other)"
                    value={gender}
                    onChangeText={setGender}
                    style={{ borderWidth: 1, borderColor: '#eee', borderRadius: 8, padding: 10, marginBottom: 10 }}
                  />
                  <TextInput
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    style={{ borderWidth: 1, borderColor: '#eee', borderRadius: 8, padding: 10, marginBottom: 10 }}
                    secureTextEntry
                  />
                  <TextInput
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    style={{ borderWidth: 1, borderColor: '#eee', borderRadius: 8, padding: 10, marginBottom: 10 }}
                    secureTextEntry
                  />
                  {error ? <Text style={{ color: 'red', marginBottom: 8 }}>{error}</Text> : null}
                  <TouchableOpacity
                    style={{ backgroundColor: '#FF9800', borderRadius: 8, padding: 12, marginTop: 8 }}
                    onPress={handleSignUp}
                    disabled={loading}
                  >
                    <Text style={{ color: '#fff', textAlign: 'center', fontWeight: 'bold' }}>{loading ? 'Signing Up...' : 'Sign Up'}</Text>
                  </TouchableOpacity>
                </>
              )}
            </>
          )}
        </View>
      </View>
    </Modal>
  );
} 