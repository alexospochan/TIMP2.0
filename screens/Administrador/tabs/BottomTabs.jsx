import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { FontAwesome } from "@expo/vector-icons";

import MapasAdministrador from "../MapasAdministrador";
import BusquedaScreen from "./BusquedaScreen";
import MasScreen from "./MasScreen";
import PerfilScreen from "./PerfilScreen";

const Tab = createBottomTabNavigator();

const BottomTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#1e90ff",
        tabBarInactiveTintColor: "gray",
        tabBarStyle: {
          backgroundColor: "#0a2342", // azul oscuro
          borderTopWidth: 0,
          elevation: 5,       // sombra Android
          shadowOpacity: 0.3, // sombra iOS
          paddingBottom: 20,  // más espacio abajo para subir la barra
          height: 70,         // aumentar altura para mayor separación
        },
        tabBarIcon: ({ color, size }) => {
          let iconName = "";

          switch (route.name) {
            case "Home":
              iconName = "home";
              break;
            case "Busqueda":
              iconName = "search";
              break;
            case "Mas":
              iconName = "plus";
              break;
            case "Perfil":
              iconName = "user";
              break;
          }

          // Reducir un poco el tamaño para que suba más
          const iconSize = size - 4 > 0 ? size - 4 : size;

          return (
            <FontAwesome
              name={iconName}
              size={iconSize}
              color={color}
              style={{ marginBottom: 5 }} // mueve el ícono un poco hacia arriba
            />
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={MapasAdministrador} />
      <Tab.Screen name="Busqueda" component={BusquedaScreen} />
      <Tab.Screen name="Mas" component={MasScreen} />
      <Tab.Screen name="Perfil" component={PerfilScreen} />
    </Tab.Navigator>
  );
};

export default BottomTabs;
