import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import PropertyDetailScreen from '../screens/PropertyDetailScreen';
import AddPropertyScreen from '../screens/AddPropertyScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ChatListScreen from '../screens/ChatListScreen';
import MessageScreen from '../screens/MessageScreen';
import SignInScreen from '../screens/SignInScreen';
import SignUpScreen from '../screens/SignUpScreen';
import { supabase } from '../utils/supabaseClient';
import { useAuthStore } from '../stores/authStore';
import GlobalAuthModal from '../components/GlobalAuthModal';
import authLogger from '../utils/authLogger';

const Stack = createNativeStackNavigator();

export default function MainStack() {
  const [session, setSession] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [navigationReady, setNavigationReady] = React.useState(false);
  const guestMode = useAuthStore(state => state.guestMode);
  const user = useAuthStore(state => state.user);
  const navigationRef = React.useRef(null);
  
  React.useEffect(() => {
    authLogger.componentMount('MainStack', {
      hasSession: !!session,
      guestMode,
      hasUser: !!user
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      authLogger.info('MainStack', 'Initial session check completed', {
        hasSession: !!session,
        userId: session?.user?.id
      });
      setSession(session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      authLogger.info('MainStack', 'Auth state change in MainStack', {
        hasSession: !!session,
        userId: session?.user?.id,
        event: _event
      });
      
      setSession(session);
      setLoading(false);
      
      // Handle navigation based on auth state
      if (_event === 'SIGNED_IN' && session?.user) {
        authLogger.info('MainStack', 'User signed in, navigating to Home');
        // Wait a bit for the auth store to update
        setTimeout(() => {
          if (navigationRef.current && navigationReady) {
            authLogger.navigationAttempt('MainStack', 'SignIn', 'Home', {
              hasUser: !!user,
              guestMode: false,
              isAuthenticated: true
            });
            navigationRef.current.reset({
              index: 0,
              routes: [{ name: 'Home' }],
            });
          }
        }, 100);
      } else if (_event === 'SIGNED_OUT') {
        authLogger.info('MainStack', 'User signed out, navigating to SignIn');
        if (navigationRef.current && navigationReady) {
          authLogger.navigationAttempt('MainStack', 'Current', 'SignIn', {
            hasUser: false,
            guestMode: false,
            isAuthenticated: false
          });
          navigationRef.current.reset({
            index: 0,
            routes: [{ name: 'SignIn' }],
          });
        }
      }
    });

    return () => {
      authLogger.componentUnmount('MainStack');
      listener?.subscription.unsubscribe();
    };
  }, []);

  // Log state changes
  React.useEffect(() => {
    authLogger.info('MainStack', 'State updated', {
      hasSession: !!session,
      guestMode,
      hasUser: !!user,
      loading
    });
    
    // Handle guest mode transitions
    if (!guestMode && !session && !user) {
      // Guest mode was disabled and no user is signed in
      authLogger.info('MainStack', 'Guest mode disabled, ensuring SignIn screen is active');
      
      // Only reset navigation if were not already on SignIn and navigation is ready
      setTimeout(() => {
        if (navigationRef.current && !loading && navigationReady) {
          try {
            const currentState = navigationRef.current.getCurrentRoute();
            if (currentState?.name !== 'SignIn') {
              authLogger.info('MainStack', 'Resetting navigation to SignIn after guest mode disabled');
              navigationRef.current.reset({
                index: 0,
                routes: [{ name: 'SignIn' }],
              });
            }
          } catch (error) {
            authLogger.logError('MainStack', error, { action: 'navigationReset', reason: 'guestModeDisabled' });
          }
        }
      }, 100);
    }
    
    // Additional safeguard: If we're on SignIn or SignUp, ensure navigation structure is stable
    if ((!guestMode && !session && !user) || session || user) {
      // This ensures the navigation structure remains consistent
      authLogger.info('MainStack', 'Ensuring stable navigation structure', {
        guestMode,
        hasSession: !!session,
        hasUser: !!user
      });
    }
  }, [session, guestMode, user, loading]);

  if (loading) {
    authLogger.info('MainStack', 'Showing loading state');
    return null; // Or a loading spinner if you want
  }

  // Determine if user is authenticated (either signed in or in guest mode)
  const isAuthenticated = session || guestMode;
  
  // Debug logging
  authLogger.info('MainStack', 'Rendering navigator', {
    hasSession: !!session,
    guestMode,
    hasUser: !!user,
    isAuthenticated,
    initialRoute: isAuthenticated ? "Home" : "SignIn"
  });

  // Prevent navigation structure changes that could cause UI issues
  const shouldShowAuthenticatedScreens = isAuthenticated || session || user;
  
  return (
    <NavigationContainer
      ref={navigationRef}
      onStateChange={(state) => {
        authLogger.info('MainStack', 'Navigation state changed', {
          currentRoute: state?.routes?.[state.index]?.name,
          routeStack: state?.routes?.map(r => r.name)
        });
      }}
      onReady={() => {
        authLogger.info('MainStack', 'Navigation container ready');
        setNavigationReady(true);
      }}
    >
      <>
        <Stack.Navigator 
          screenOptions={{ headerShown: false }}
          initialRouteName={isAuthenticated ? "Home" : "SignIn"}
          screenListeners={{
            focus: (e) => {
              authLogger.info('MainStack', 'Screen focused', {
                screenName: e.target?.split('-')[0]
              });
            },
            blur: (e) => {
              authLogger.info('MainStack', 'Screen blurred', {
                screenName: e.target?.split('-')[0]
              });
            }
          }}
        >
          {/* Always include all screens to prevent navigation errors */}
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="PropertyDetail" component={PropertyDetailScreen} />
          <Stack.Screen name="AddProperty" component={AddPropertyScreen} />
          <Stack.Screen name="EditProfile" component={EditProfileScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="ChatList" component={ChatListScreen} />
          <Stack.Screen name="Message" component={MessageScreen} />
          <Stack.Screen name="SignIn" component={SignInScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
        </Stack.Navigator>
        <GlobalAuthModal />
      </>
    </NavigationContainer>
  );
} 