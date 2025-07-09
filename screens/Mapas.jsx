import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, Linking, Platform, StatusBar, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MapView, { Marker } from 'react-native-maps';
import { FontAwesome } from '@expo/vector-icons';

export default function MapasAdministrador() {
  const navigation = useNavigation();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Función para obtener proyectos desde backend
  const fetchProjects = async () => {
    try {
      const response = await fetch('http://192.168.30.94:3000/proyectos');
      if (!response.ok) throw new Error('Error al obtener proyectos');
      const data = await response.json();
      setProjects(data);
    } catch (error) {
      console.error(error);
      alert('Error cargando proyectos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleNavigate = (id) => {
    navigation.navigate('Reportes', { projectId: id });
  };

  const openGoogleMaps = (latitude, longitude) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    Linking.openURL(url);
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={{ color: 'white', marginTop: 10 }}>Cargando proyectos...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#1E293B"
      />
      <View style={styles.container}>
        <View style={styles.header}>
          <Image
            source={require('../assets/TIMP.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.headerTitle}>Proyectos</Text>
        </View>

        <ScrollView contentContainerStyle={styles.cardContainer}>
          {projects.length === 0 && (
            <Text style={{ color: 'white', textAlign: 'center', marginTop: 20 }}>
              No hay proyectos disponibles
            </Text>
          )}
          {projects.map((project) => (
            <View key={project._id} style={styles.card}>
              <View style={styles.mapContainer}>
                <MapView
                  style={styles.map}
                  initialRegion={{
                    latitude: parseFloat(project.latitude) || 20.6296, // Usa un valor por defecto si no tienes lat/lng en tu proyecto
                    longitude: parseFloat(project.longitude) || -87.0739,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                  }}
                >
                  <Marker
                    coordinate={{
                      latitude: parseFloat(project.latitude) || 20.6296,
                      longitude: parseFloat(project.longitude) || -87.0739,
                    }}
                    title={project.nombre}
                    description={`Kilometraje: ${project.kmInicio} / ${project.kmFinal} Km`}
                  />
                </MapView>

                <TouchableOpacity
                  style={styles.mapButton}
                  onPress={() =>
                    openGoogleMaps(parseFloat(project.latitude) || 20.6296, parseFloat(project.longitude) || -87.0739)
                  }
                >
                  <FontAwesome name="map" size={20} color="white" />
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.addButton} onPress={() => handleNavigate(project._id)}>
                <Text style={styles.addButtonText}>Agregar +</Text>
              </TouchableOpacity>

              <View style={styles.cardInfo}>
                <Text style={styles.infoText}>Proyecto: {project.nombre}</Text>
                <Text style={styles.infoText}>Kilometraje: {project.kmInicio} / {project.kmFinal} Km</Text>
                <Text style={styles.infoText}>Project manager: {project.manager}</Text>
                <Text style={styles.infoText}>Ciudad inicio: {project.ciudadInicio}</Text>
                <Text style={styles.infoText}>Ciudad final: {project.ciudadFinal}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

// Reutiliza tus estilos actuales o agrega los que necesites
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  logo: {
    width: 60,
    height: 60,
    marginRight: 12,
  },
  headerTitle: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
  },
  cardContainer: {
    paddingBottom: 20,
    paddingHorizontal: 10,
  },
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
  },
  mapContainer: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
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
  addButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#3B82F6',
    padding: 8,
    borderRadius: 5,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  cardInfo: {
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    backgroundColor: '#1E293B',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  infoText: {
    color: 'white',
    fontSize: 14,
    marginVertical: 2,
  },
});
