import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  StatusBar,
  Platform,
  Image,
  ScrollView,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@env';

export default function MapasAdministrador({ navigation }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const obtenerUsuario = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem('userInfo');
        if (jsonValue != null) {
          setUsuario(JSON.parse(jsonValue));
        }
      } catch (e) {
        console.log('Error leyendo usuario:', e);
        Alert.alert('Error', 'No se pudo cargar el usuario.');
      }
    };
    obtenerUsuario();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/proyectos`);
      const data = await response.json();
      setProjects(data.reverse());
    } catch (error) {
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
          {projects.map((project) => (
            <View key={project._id || project.id} style={styles.card}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() =>
                  navigation.navigate('ReportesAdministrador', {
                    proyectoSeleccionado: project,
                    usuario,
                  })
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
                    <Text style={styles.label}>Manager</Text>
                    <Text style={styles.value}>{project.manager || 'N/A'}</Text>
                  </View>
                </View>
                {/* Aquí ya no mostramos botón o link a Google Maps */}
              </TouchableOpacity>
            </View>
          ))}
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
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  cardInfo: {
    padding: 10,
    backgroundColor: '#1E293B',
    borderRadius: 10,
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
  },
});
