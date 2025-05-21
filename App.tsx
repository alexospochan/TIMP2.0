import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import LoginScreen from "./screens/LoginScreen";
import RegistroScreen from "./screens/Registro";
import Mapas from "./screens/Mapas";
import Reportes from "./screens/Reportes";
import ReportePrueba from "./screens/Reporte_Prueba";

export type RootStackParamList = {
  Login: undefined;
  Registro: undefined;
  Mapas: undefined;
  Reportes: undefined;
  ReportePrueba: undefined;
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
          name="Mapas" 
          component={Mapas} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="Reportes" 
          component={Reportes} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="ReportePrueba" 
          component={ReportePrueba} 
          options={{ headerShown: false }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;