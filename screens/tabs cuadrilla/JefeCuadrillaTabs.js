import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Mapas from '../Mapas';  // Ajusta si necesitas la ruta
import SearchScreen from './SearchScreen';
import ProfileScreen from './ProfileScreen';

const Tab = createBottomTabNavigator();

export default function JefeCuadrillaTabs() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#fff',      // blanco cuando está activo
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: '#0a2342',       // fondo azul oscuro
          borderTopWidth: 0,
          elevation: 5,
          shadowOpacity: 0.3,
          paddingBottom: 10 + insets.bottom,
          height: 60 + insets.bottom,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = '';
          if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Search') iconName = focused ? 'search' : 'search-outline';
          else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';

          const iconSize = 24;

          return (
            <Ionicons
              name={iconName}
              size={iconSize}
              color={color}
              style={{ marginBottom: 4 }}
            />
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={Mapas} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
