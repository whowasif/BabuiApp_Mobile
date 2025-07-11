import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import PropertiesScreen from '../screens/PropertiesScreen';
import PropertyDetailScreen from '../screens/PropertyDetailScreen';
import AddPropertyScreen from '../screens/AddPropertyScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ChatScreen from '../screens/ChatScreen';

const Stack = createNativeStackNavigator();

export default function MainStack() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Properties" component={PropertiesScreen} />
        <Stack.Screen name="PropertyDetail" component={PropertyDetailScreen} />
        <Stack.Screen name="AddProperty" component={AddPropertyScreen} />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Chat" component={ChatScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
} 