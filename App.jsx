import React from "react";
import { enableScreens } from "react-native-screens"; 
enableScreens(); // Mejora el rendimiento al usar React Navigation

import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";


// Contexto de autenticación
import { AuthProvider } from "./context/AuthContext";

// Pantallas principales
import LoginScreen from "./screens/LoginScreen";
import RegistroScreen from "./screens/Registro";
import Crear_reporte from "./screens/Crear_Reporte";
import AgregarProyecto from "./screens/Administrador/AgregarProyecto";
import CreadorReporte from "./screens/Administrador/CreadorReporte";
import MapasAdministrador from "./screens/Administrador/MapasAdministrador";
import Mapas from "./screens/Mapas";
import UsuariosAdmin from "./screens/Administrador/UsuariosAdmin";
import JefeCuadrillaTabs from "./screens/tabs cuadrilla/JefeCuadrillaTabs";
import DetallesReportesJefe from "./screens/DetallesReporteJefe";
import DetallesReportesGeneral from "./screens/DetallesReportesGeneral";

// Tabs y otras pantallas del administrador
import BottomTabs from "./screens/Administrador/tabs/BottomTabs";
import Agregarnuevousuario from "./screens/Administrador/Agregarnuevousuario";
import EditarUsuario from "./screens/Administrador/EditarUsuario";
import ReportesAdministrador from "./screens/Administrador/ReportesAdministrador";
import Reportes from "./screens/Reportes";
import DetallesReportes from "./screens/Administrador/DetallesReportes";

const Stack = createStackNavigator();

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {/* Autenticación */}
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Registro" component={RegistroScreen} />

          {/* Tabs por rol */}
          <Stack.Screen name="BottomTabs" component={BottomTabs} />
          <Stack.Screen name="JefeCuadrillaTabs" component={JefeCuadrillaTabs} />

          {/* Pantallas del Administrador */}
          <Stack.Screen name="AgregarProyecto" component={AgregarProyecto} />
          <Stack.Screen name="UsuariosAdmin" component={UsuariosAdmin} />
          <Stack.Screen name="Agregarnuevousuario" component={Agregarnuevousuario} />
          <Stack.Screen name="EditarUsuario" component={EditarUsuario} />
          <Stack.Screen name="ReportesAdministrador" component={ReportesAdministrador} />
          <Stack.Screen name="DetallesReportes" component={DetallesReportes} />
          <Stack.Screen name="MapasAdministrador" component={MapasAdministrador} />
          <Stack.Screen name="CreadorReporte" component={CreadorReporte} />

          {/* Pantallas generales y cuadrilla */}
          <Stack.Screen name="Crear_reporte" component={Crear_reporte} />
          <Stack.Screen name="Mapas" component={Mapas} />
          <Stack.Screen name="Reportes" component={Reportes} />
          <Stack.Screen name="DetallesReportesJefe" component={DetallesReportesJefe} />
          <Stack.Screen name="DetallesReportesGeneral" component={DetallesReportesGeneral} />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}
