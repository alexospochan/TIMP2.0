import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Platform,
  StatusBar,
  Image,
  Linking,
  RefreshControl,
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome5 } from '@expo/vector-icons';
import { getProyectoPorId, getUsuarioPorId } from '../api'; // tu api.ts

export default function Mapas({ navigation }) {
  const [proyecto, setProyecto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Actualiza usuario local con datos de la API
  const actualizarUsuarioLocal = async () => {
    try {
      // Cambio importante: leer con la clave 'userInfo' igual que en login
      const userJson = await AsyncStorage.getItem('userInfo');
      if (!userJson) return null;

      const user = JSON.parse(userJson);
      if (!user._id) return user;

      // Obtener usuario actualizado desde backend para tener proyecto actualizado
      const usuarioActualizado = await getUsuarioPorId(user._id);
      if (usuarioActualizado) {
        await AsyncStorage.setItem('userInfo', JSON.stringify(usuarioActualizado));
        return usuarioActualizado;
      }
      return user;
    } catch (error) {
      console.error('Error actualizando usuario local:', error);
      Alert.alert('Error', 'No se pudo actualizar el usuario.');
      return null;
    }
  };

  // Carga el proyecto asignado al usuario
  const loadProyecto = async () => {
    try {
      setLoading(true);

      const user = await actualizarUsuarioLocal();
      if (!user) {
        Alert.alert('Error', 'No se encontró usuario en sesión');
        setLoading(false);
        return;
      }

      // Validar que el usuario tenga proyecto asignado
      if (!user.proyecto || !user.proyecto._id) {
        Alert.alert('Info', 'No tienes proyecto asignado.');
        setLoading(false);
        return;
      }

      // Obtener datos completos del proyecto asignado
      const proyectoCompleto = await getProyectoPorId(user.proyecto._id);
      if (!proyectoCompleto) {
        Alert.alert('Error', 'No se pudo cargar la información completa del proyecto.');
        setLoading(false);
        return;
      }

      setProyecto(proyectoCompleto);
    } catch (error) {
      Alert.alert('Error', 'Error al cargar datos del usuario');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProyecto();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadProyecto();
    setRefreshing(false);
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={{ color: 'white', marginTop: 10 }}>Cargando proyecto...</Text>
      </SafeAreaView>
    );
  }

  if (!proyecto) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={{ color: 'white' }}>No tienes proyecto asignado.</Text>
      </SafeAreaView>
    );
  }

  // Coordenadas con valores por defecto
  const latInicio = Number(proyecto.latInicio) || 20.6296;
  const lonInicio = Number(proyecto.lonInicio) || -87.0739;
  const latFinal = Number(proyecto.latFinal) || 20.6296;
  const lonFinal = Number(proyecto.lonFinal) || -87.0739;

  // Ajuste del zoom del mapa
  const latDelta = Math.max(Math.abs(latFinal - latInicio) * 2, 0.05);
  const lonDelta = Math.max(Math.abs(lonFinal - lonInicio) * 2, 0.05);

  const openGoogleMaps = (lat, lon) => {
    if (typeof lat !== 'number' || typeof lon !== 'number') {
      Alert.alert('Error', 'Coordenadas inválidas para abrir en Google Maps.');
      return;
    }
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'No se pudo abrir Google Maps.');
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
      <View style={styles.mainContainer}>
        <View style={styles.logoHeader}>
          <Image source={require('../assets/TIMP.png')} style={styles.logo} resizeMode="contain" />
        </View>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#3B82F6']} />
          }
        >
          <View style={styles.card}>
            <View style={styles.mapBox}>
              <MapView
                style={styles.map}
                initialRegion={{
                  latitude: (latInicio + latFinal) / 2,
                  longitude: (lonInicio + lonFinal) / 2,
                  latitudeDelta: latDelta,
                  longitudeDelta: lonDelta,
                }}
                scrollEnabled
                zoomEnabled
                rotateEnabled
                pitchEnabled
              >
                <Marker coordinate={{ latitude: latInicio, longitude: lonInicio }} pinColor="green" />
                <Marker coordinate={{ latitude: latFinal, longitude: lonFinal }} pinColor="red" />
                <Polyline
                  coordinates={[
                    { latitude: latInicio, longitude: lonInicio },
                    { latitude: latFinal, longitude: lonFinal },
                  ]}
                  strokeColor="#3B82F6"
                  strokeWidth={4}
                />
              </MapView>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => navigation.navigate('Reportes')}
              >
                <FontAwesome5 name="plus" size={14} color="#1E293B" />
                <Text style={styles.addButtonText}>Agregar</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Text style={styles.label}>Proyecto</Text>
                <Text style={styles.value}>{proyecto.nombre}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.label}>Kilometraje</Text>
                <Text style={styles.value}>
                  {proyecto.kmInicio} / {proyecto.kmFinal} Km
                </Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.label}>Project manager</Text>
                <Text style={styles.value}>{proyecto.manager || 'N/A'}</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainContainer: {
    flex: 1,
  },
  logoHeader: {
    paddingLeft: 15,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 5 : 15,
    paddingBottom: 10,
    backgroundColor: '#0F172A',
  },
  logo: {
    width: 50,
    height: 50,
  },
  scrollContent: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 10,
    overflow: 'hidden',
    marginVertical: 10,
    width: '95%',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  mapBox: {
    height: 180,
    position: 'relative',
  },
  map: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  addButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButtonText: {
    marginLeft: 5,
    fontWeight: 'bold',
    color: '#1E293B',
    fontSize: 13,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
    backgroundColor: '#1E293B',
  },
  infoItem: {
    alignItems: 'center',
    flex: 1,
  },
  label: {
    color: '#9CA3AF',
    fontSize: 12,
    marginBottom: 2,
  },
  value: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
