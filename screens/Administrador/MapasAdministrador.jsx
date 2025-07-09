import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView,
  ActivityIndicator, Alert, Platform, StatusBar, Image, Linking
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { FontAwesome5 } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

export default function MapasAdministrador({ navigation }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://192.168.30.94:3000/proyectos');
      if (!response.ok) throw new Error('Error al obtener proyectos');
      const data = await response.json();
      setProjects(data.reverse());
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudieron cargar los proyectos.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchProjects();
    }, [])
  );

  const openGoogleMaps = (lat, lon) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
    Linking.openURL(url);
  };

  const handleAddProject = () => {
    navigation.navigate('AgregarProyecto');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={{ color: 'white', marginTop: 10 }}>Cargando proyectos...</Text>
      </SafeAreaView>
    );
  }

  if (!projects.length) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={{ color: 'white' }}>No hay proyectos disponibles</Text>
        <TouchableOpacity style={styles.floatingAddButton} onPress={handleAddProject}>
          <FontAwesome5 name="folder-plus" size={24} color="white" />
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#1E293B" />
      <View style={styles.container}>
        <View style={styles.header}>
          <Image
            source={require('../../assets/TIMP.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.headerTitle}>Proyectos</Text>
        </View>

        <ScrollView contentContainerStyle={styles.cardContainer}>
          {projects.map((project) => {
            const latInicio = Number(project.latInicio) || 20.6296;
            const lonInicio = Number(project.lonInicio) || -87.0739;
            const latFinal = Number(project.latFinal) || 20.6296;
            const lonFinal = Number(project.lonFinal) || -87.0739;

            return (
              <View key={project._id || project.id} style={styles.card}>
                <View style={styles.mapContainer}>
                  <MapView
                    style={styles.map}
                    initialRegion={{
                      latitude: latInicio,
                      longitude: lonInicio,
                      latitudeDelta: 0.1,
                      longitudeDelta: 0.1,
                    }}
                    scrollEnabled={true}
                    zoomEnabled={true}
                    rotateEnabled={true}
                    pitchEnabled={true}
                  >
                    <Marker
                      coordinate={{ latitude: latInicio, longitude: lonInicio }}
                      title={`${project.nombre} - Inicio`}
                      description={`Ciudad: ${project.ciudadInicio}\nKm: ${project.kmInicio}`}
                      pinColor="green"
                    />
                    <Marker
                      coordinate={{ latitude: latFinal, longitude: lonFinal }}
                      title={`${project.nombre} - Final`}
                      description={`Ciudad: ${project.ciudadFinal}\nKm: ${project.kmFinal}`}
                      pinColor="red"
                    />
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
                    style={styles.mapButton}
                    onPress={() => openGoogleMaps(latInicio, lonInicio)}
                  >
                    <FontAwesome5 name="map-marked-alt" size={20} color="white" />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() =>
                    navigation.navigate('ReportesAdministrador', { proyectoSeleccionado: project })
                  }
                  style={styles.cardInfo}
                >
                  <View style={styles.horizontalRow}>
                    <View style={styles.infoItem}>
                      <Text style={styles.label}>Proyecto</Text>
                      <Text style={styles.value}>{project.nombre}</Text>
                    </View>
                    <View style={styles.infoItem}>
                      <Text style={styles.label}>Kilometraje</Text>
                      <Text style={styles.value}>
                        {project.kmInicio} / {project.kmFinal} Km
                      </Text>
                    </View>
                    <View style={styles.infoItem}>
                      <Text style={styles.label}>Project manager</Text>
                      <Text style={styles.value}>{project.manager}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            );
          })}
        </ScrollView>

        <TouchableOpacity style={styles.floatingAddButton} onPress={handleAddProject}>
          <FontAwesome5 name="folder-plus" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0F172A' },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: { flex: 1, backgroundColor: '#0F172A' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  logo: { width: 60, height: 60, marginRight: 12 },
  headerTitle: { color: 'white', fontSize: 22, fontWeight: 'bold' },
  cardContainer: { paddingBottom: 80, paddingHorizontal: 10 },

  card: {
    backgroundColor: '#1E293B',
    marginVertical: 10,
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
    flexDirection: 'column',
  },

  mapContainer: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 8,
  },
  map: {
    flex: 1,
    width: '100%',
    borderRadius: 10,
  },
  mapButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: '#3B82F6',
    padding: 10,
    borderRadius: 50,
    elevation: 3,
  },

  cardInfo: {
    padding: 10,
    backgroundColor: '#1E293B',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  horizontalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoItem: {
    flex: 1,
    marginHorizontal: 5,
  },
  label: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 13,
    marginBottom: 2,
  },
  value: {
    color: 'white',
    fontSize: 13,
  },

  floatingAddButton: {
    position: 'absolute',
    bottom: 55,
    right: 20,
    backgroundColor: '#3B82F6',
    width: 66,
    height: 66,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
});
