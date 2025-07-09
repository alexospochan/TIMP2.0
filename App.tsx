import React from "react";
import { NavigationContainer, StackRouter } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigatorScreenParams } from "@react-navigation/native";

// Pantallas principales
import LoginScreen from "./screens/LoginScreen";
import RegistroScreen from "./screens/Registro";
import ReportePrueba from "./screens/Reporte_Prueba";
import AgregarProyecto from "./screens/Administrador/AgregarProyecto";
import CreadorReporte from "./screens/Administrador/CreadorReporte";
import MapasAdministrador from "./screens/Administrador/MapasAdministrador";
import Mapas from "./screens/Mapas";
import UsuariosAdmin from "./screens/Administrador/UsuariosAdmin";

// Tabs (barra inferior con 4 botones)
import BottomTabs from "./screens/Administrador/tabs/BottomTabs";
import Agregarnuevousuario from "./screens/Administrador/Agregarnuevousuario";
import EditarUsuario from "./screens/Administrador/EditarUsuario";
import ReportesAdministrador from "./screens/Administrador/ReportesAdministrador";    


// Definición de pantallas dentro de BottomTabs
export type MainTabsParamList = {
  Home: undefined;
  Busqueda: undefined;
  Mas: undefined;
  Perfil: undefined;
};

// Definición de pantallas del stack principal
export type RootStackParamList = {
  Login: undefined;
  Registro: undefined;
  MainTabs: NavigatorScreenParams<MainTabsParamList>;
  ReportePrueba: undefined;
  AgregarProyecto: undefined;
  CreadorReporte: undefined;
  MapasAdministrador: undefined;
  Mapas: undefined;
  BottomTabs: undefined;
  Usuarios: undefined; 
  Agregarnuevousuario:undefined; // Pantalla para agregar un nuevo usuario
  EditarUsuario: undefined; // Pantalla para editar un usuario existente
  ReportesAdministrador: undefined; // Pantalla para ver reportes de administrador
  
};

const Stack = createStackNavigator<RootStackParamList>();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen 
          name="Login" 
          component={LoginScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="Registro" 
          component={RegistroScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="MainTabs" 
          component={BottomTabs} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="ReportePrueba" 
          component={ReportePrueba} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="AgregarProyecto" 
          component={AgregarProyecto} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="CreadorReporte" 
          component={CreadorReporte}
          options={{ headerShown: false }}
        />
        <Stack.Screen
        name="MapasAdministrador"
        component={MapasAdministrador}
        options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Mapas"
          component={Mapas} 
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="BottomTabs"
          component={BottomTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
        name="Usuarios"
        component={UsuariosAdmin} // Cambia esto por la pantalla de Usuarios si la tienes
        options={{ headerShown: false }}
        />
       <Stack.Screen
        name="Agregarnuevousuario"
        component={Agregarnuevousuario}
        options={{ headerShown: false}}
      />
      <Stack.Screen
        name="EditarUsuario"
        component={EditarUsuario} // Cambia esto por la pantalla de Usuarios si la tienes
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ReportesAdministrador"
        component={ReportesAdministrador}
        options={{ headerShown: false }}
      />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
