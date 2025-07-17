import React, { useEffect, useRef } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Animated, Dimensions, Alert } from 'react-native';
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useAuthStore } from '../stores/authStore';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function BottomNav({ navigation, active }) {
  const user = useAuthStore(state => state.user);
  const guestMode = useAuthStore(state => state.guestMode);
  const openGlobalModal = useAuthStore(state => state.openGlobalModal);
  const setGuestMode = useAuthStore(state => state.setGuestMode);

  // Animation values for each tab
  const homeAnim = useRef(new Animated.Value(active === 'Home' ? 1 : 0)).current;
  const addAnim = useRef(new Animated.Value(0)).current;
  const chatAnim = useRef(new Animated.Value(active === 'ChatList' ? 1 : 0)).current;
  const profileAnim = useRef(new Animated.Value(active === 'Profile' ? 1 : 0)).current;

  const handleNav = (screen) => {
    // Allow guest mode users to navigate to Home and Profile
    if (guestMode) {
      if (screen === 'Home' || screen === 'Profile') {
        navigation.navigate(screen);
      } else {
        // For other screens, show a message or redirect to sign in
        Alert.alert(
          'Sign In Required',
          'Please sign in to access this feature.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Sign In', onPress: () => setGuestMode(false) }
          ]
        );
      }
    } else if (!user && ['AddProperty', 'ChatList', 'Profile'].includes(screen)) {
      // For non-guest users without account, redirect to sign in
      setGuestMode(false);
    } else {
      navigation.navigate(screen);
    }
  };

  // Animate tab selection
  useEffect(() => {
    const animations = [
      Animated.timing(homeAnim, {
        toValue: active === 'Home' ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(chatAnim, {
        toValue: active === 'ChatList' ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(profileAnim, {
        toValue: active === 'Profile' ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ];

    Animated.parallel(animations).start();
  }, [active]);

  // Add button pulse animation
  useEffect(() => {
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(addAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(addAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    return () => pulseAnimation.stop();
  }, []);

  const AnimatedIcon = ({ icon, isActive, animValue, size = 24, color = '#FF9800' }) => (
    <Animated.View
      style={{
        transform: [
          {
            scale: animValue.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 1.2],
            }),
          },
        ],
      }}
    >
      {icon}
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#fff', '#fafafa']}
        style={styles.gradientBackground}
      >
        {/* Home Tab */}
        <TouchableOpacity 
          style={styles.tab} 
          onPress={() => navigation.navigate('Home')}
          activeOpacity={0.7}
        >
          <Animated.View style={[
            styles.iconContainer,
            active === 'Home' && styles.activeIconContainer
          ]}>
            <AnimatedIcon
              icon={<MaterialIcons name="home" size={24} color={active === 'Home' ? '#FF9800' : '#BDBDBD'} />}
              isActive={active === 'Home'}
              animValue={homeAnim}
            />
          </Animated.View>
          <Text style={[styles.label, active === 'Home' && styles.activeLabel]}>Home</Text>
        </TouchableOpacity>

        {/* Add Property FAB */}
        <TouchableOpacity 
          style={styles.fab} 
          onPress={() => handleNav('AddProperty')}
          activeOpacity={0.8}
        >
          <Animated.View
            style={[
              styles.fabContainer,
              {
                transform: [
                  {
                    scale: addAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.1],
                    }),
                  },
                ],
              },
            ]}
          >
            <LinearGradient
              colors={['#4CAF50', '#45a049']}
              style={styles.fabGradient}
            >
              <Ionicons name="add" size={28} color="#fff" />
            </LinearGradient>
          </Animated.View>
          <Text style={styles.fabLabel}>Add</Text>
        </TouchableOpacity>

        {/* Chat Tab */}
        <TouchableOpacity 
          style={styles.tab} 
          onPress={() => handleNav('ChatList')}
          activeOpacity={0.7}
        >
          <Animated.View style={[
            styles.iconContainer,
            active === 'ChatList' && styles.activeIconContainer
          ]}>
            <AnimatedIcon
              icon={<Ionicons name="chatbubble-ellipses" size={24} color={active === 'ChatList' ? '#FF9800' : '#BDBDBD'} />}
              isActive={active === 'ChatList'}
              animValue={chatAnim}
            />
          </Animated.View>
          <Text style={[styles.label, active === 'ChatList' && styles.activeLabel]}>Chat</Text>
        </TouchableOpacity>

        {/* Profile Tab */}
        <TouchableOpacity 
          style={styles.tab} 
          onPress={() => handleNav('Profile')}
          activeOpacity={0.7}
        >
          <Animated.View style={[
            styles.iconContainer,
            active === 'Profile' && styles.activeIconContainer
          ]}>
            <AnimatedIcon
              icon={<FontAwesome5 name="user" size={22} color={active === 'Profile' ? '#FF9800' : '#BDBDBD'} />}
              isActive={active === 'Profile'}
              animValue={profileAnim}
            />
          </Animated.View>
          <Text style={[styles.label, active === 'Profile' && styles.activeLabel]}>Profile</Text>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 80,
    backgroundColor: 'transparent',
  },
  gradientBackground: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    elevation: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -5 },
  },
  tab: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: 8,
  },
  iconContainer: {
    padding: 8,
    borderRadius: 12,
    marginBottom: 4,
  },
  activeIconContainer: {
    backgroundColor: '#FFF3E0',
    shadowColor: '#FF9800',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  label: {
    fontSize: 11,
    color: '#BDBDBD',
    fontWeight: '500',
    textAlign: 'center',
  },
  activeLabel: {
    color: '#FF9800',
    fontWeight: 'bold',
  },
  fab: {
    alignItems: 'center',
    marginTop: -20,
    flex: 1,
  },
  fabContainer: {
    shadowColor: '#4CAF50',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  fabLabel: {
    fontSize: 10,
    color: '#4CAF50',
    fontWeight: 'bold',
    marginTop: 4,
  },
}); 