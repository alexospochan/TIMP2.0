import React from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MapView, { Marker } from 'react-native-maps';
import { FontAwesome } from '@expo/vector-icons'; 

const projects = [
  { id: 1, route: 'D.F - Alvarado', distance: '95 / 237 Km', manager: 'Uriel Espronceda Z.', coordinates: { latitude: 19.432608, longitude: -99.133209 } }, 
  { id: 2, route: 'D.F - Puebla', distance: '80 / 237 Km', manager: 'Uriel Espronceda Z.', coordinates: { latitude: 19.017352, longitude: -98.203079 } },
  { id: 3, route: 'D.F - Toluca', distance: '60 / 237 Km', manager: 'Uriel Espronceda Z.', coordinates: { latitude: 19.282608, longitude: -99.657209 } },
  { id: 4, route: 'D.F - Querétaro', distance: '120 / 237 Km', manager: 'Uriel Espronceda Z.', coordinates: { latitude: 20.5888, longitude: -100.3899 } },
  { id: 5, route: 'D.F - Veracruz', distance: '270 / 237 Km', manager: 'Uriel Espronceda Z.', coordinates: { latitude: 19.1738, longitude: -96.1342 } },
  { id: 6, route: 'D.F - Guadalajara', distance: '460 / 237 Km', manager: 'Uriel Espronceda Z.', coordinates: { latitude: 20.6597, longitude: -103.3496 } }
];

export default function App() {
  const navigation = useNavigation();

  // Función de navegación a la página de reportes de un proyecto
  const handleNavigate = (id) => {
    navigation.navigate('Reportes', { projectId: id });
  };

  // Función para abrir Google Maps
  const openGoogleMaps = (latitude, longitude) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    Linking.openURL(url);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Image source={require('../assets/TIMP.png')} style={styles.logo} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <Text style={styles.menuItem}>Usuarios</Text>
          <Text style={styles.menuItem}>Mapas</Text>
          <Text style={styles.menuItem}>Lista</Text>
          <Text style={styles.menuItem}>Reporte</Text>
          <Text style={styles.menuItem}>Pinturas</Text>
          <Text style={styles.menuItem}>Reportes</Text>
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.cardContainer}>
        {projects.map((project) => (
          <View key={project.id} style={styles.card}>
            <View style={styles.mapContainer}>
              <MapView
                style={styles.map}
                initialRegion={{
                  latitude: project.coordinates.latitude,
                  longitude: project.coordinates.longitude,
                  latitudeDelta: 0.05,
                  longitudeDelta: 0.05,
                }}
              >
                <Marker coordinate={project.coordinates} title={project.route} description={`Kilometraje: ${project.distance}`} />
              </MapView>

              {/* Botón flotante para abrir Google Maps */}
              <TouchableOpacity 
                style={styles.mapButton} 
                onPress={() => openGoogleMaps(project.coordinates.latitude, project.coordinates.longitude)}
              >
                <FontAwesome name="map" size={20} color="white" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.addButton} onPress={() => handleNavigate(project.id)}>
              <Text style={styles.addButtonText}>Agregar +</Text>
            </TouchableOpacity>

            <View style={styles.cardInfo}>
              <Text style={styles.infoText}>Proyecto: {project.route}</Text>
              <Text style={styles.infoText}>Kilometraje: {project.distance}</Text>
              <Text style={styles.infoText}>Project manager: {project.manager}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    paddingTop: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#1E293B',
    marginTop: 14, 
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  menuItem: {
    color: 'white',
    marginHorizontal: 10,
    fontSize: 16,
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
