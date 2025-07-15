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

const Stack = createNativeStackNavigator();

export default function MainStack() {
  const [session, setSession] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const guestMode = useAuthStore(state => state.guestMode);
  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return null; // Or a loading spinner if you want
  }

  return (
    <NavigationContainer>
      <>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {(session || guestMode) ? (
            <>
              <Stack.Screen name="Home" component={HomeScreen} />
              <Stack.Screen name="PropertyDetail" component={PropertyDetailScreen} />
              <Stack.Screen name="AddProperty" component={AddPropertyScreen} />
              <Stack.Screen name="EditProfile" component={EditProfileScreen} />
              <Stack.Screen name="Profile" component={ProfileScreen} />
              <Stack.Screen name="ChatList" component={ChatListScreen} />
              <Stack.Screen name="Message" component={MessageScreen} />
            </>
          ) : (
            <>
              <Stack.Screen name="SignIn" component={SignInScreen} />
              <Stack.Screen name="SignUp" component={SignUpScreen} />
            </>
          )}
        </Stack.Navigator>
        <GlobalAuthModal />
      </>
    </NavigationContainer>
  );
} 