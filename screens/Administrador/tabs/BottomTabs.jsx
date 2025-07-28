import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import MapasAdministrador from "../MapasAdministrador";
import BusquedaScreen from "./BusquedaScreen";
import PerfilScreen from "./PerfilScreen";

const Tab = createBottomTabNavigator();

const BottomTabs = () => {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#fff",
        tabBarInactiveTintColor: "gray",
        tabBarStyle: {
          backgroundColor: "#0a2342",
          borderTopWidth: 0,
          elevation: 5,
          shadowOpacity: 0.3,
          paddingBottom: 10 + insets.bottom, // suma el safe area bottom
          height: 60 + insets.bottom,        // aumenta la altura para el safe area
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = "";

          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Busqueda") {
            iconName = focused ? "search" : "search-outline";
          } else if (route.name === "Perfil") {
            iconName = focused ? "person" : "person-outline";
          }

          const iconSize = 24;

          return (
            <Ionicons
              name={iconName}
              size={iconSize}
              color={color}
              style={{ marginBottom: 4 }} // un poco más arriba
            />
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={MapasAdministrador} />
      <Tab.Screen name="Busqueda" component={BusquedaScreen} />
      <Tab.Screen name="Perfil" component={PerfilScreen} />
    </Tab.Navigator>
  );
};

export default BottomTabs;
