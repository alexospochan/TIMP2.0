import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { FontAwesome, Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@env';

export default function ReportesAdministrador({ navigation, route }) {
  const { proyectoSeleccionado } = route.params || {};
  const [usuario, setUsuario] = useState(route.params?.usuario || null);
  const [reportes, setReportes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Si no hay usuario en params, intentar cargarlo de AsyncStorage
  useEffect(() => {
    const obtenerUsuario = async () => {
      if (!usuario) {
        try {
          const jsonValue = await AsyncStorage.getItem('usuario');
          if (jsonValue != null) {
            setUsuario(JSON.parse(jsonValue));
          }
        } catch (e) {
          console.log('Error leyendo usuario de AsyncStorage:', e);
        }
      }
    };
    obtenerUsuario();
  }, [usuario]);

  const fetchReportes = async () => {
    if (!proyectoSeleccionado?._id) return;
    if (!refreshing) setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/reportes/proyecto/${proyectoSeleccionado._id}`);
      if (!res.ok) throw new Error('Error al obtener reportes');
      const data = await res.json();
      setReportes(data);
    } catch (err) {
      console.error('Error cargando reportes:', err);
      setError('No se pudieron cargar los reportes.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReportes();
  }, [proyectoSeleccionado]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchReportes();
  };

  const getColor = (prioridad) => {
    switch (prioridad) {
      case 'Alta':
        return '#dc2626';
      case 'Media':
        return '#f59e0b';
      case 'Baja':
        return '#16a34a';
      default:
        return 'white';
    }
  };

  const irACreadorReporte = (reporte = null) => {
    if (!usuario?.email) {
      Alert.alert(
        'No autenticado',
        'Debes iniciar sesión para crear o editar reportes.',
        [{ text: 'OK' }]
      );
      return;
    }

    navigation.navigate('CreadorReporte', { proyectoSeleccionado, reporte, usuario });
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar barStyle="light-content" />

      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.navigate('BottomTabs')}>
          <Feather name="arrow-left" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>{proyectoSeleccionado?.nombre || 'Proyecto'}</Text>
      </View>

      <ScrollView
        horizontal
        contentContainerStyle={styles.scrollTable}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#3B82F6']}
            tintColor="#3B82F6"
          />
        }
      >
        <View>
          <View style={styles.tableHeader}>
            <Text style={[styles.cell, styles.headerText]}>Categoría</Text>
            <Text style={[styles.cell, styles.headerText]}>Fecha</Text>
            <Text style={[styles.cell, styles.headerText]}>Usuario</Text>
            <Text style={[styles.cell, styles.headerText]}>Importancia</Text>
          </View>

          {loading && !refreshing && (
            <ActivityIndicator size="large" color="#3B82F6" style={{ marginVertical: 20 }} />
          )}

          {error && <Text style={[styles.noData, { color: 'red' }]}>{error}</Text>}

          {!loading && !error && reportes.length === 0 && (
            <Text style={styles.noData}>No hay reportes aún.</Text>
          )}

          {!loading &&
            !error &&
            reportes.map((r, index) => (
              <TouchableOpacity
                key={r._id}
                onPress={() => irACreadorReporte(r)}
                activeOpacity={0.95}
              >
                <View
                  style={[
                    styles.tableRow,
                    { backgroundColor: index % 2 === 0 ? '#1e3a8a' : '#172554' },
                  ]}
                >
                  <Text style={styles.cell}>{r.categoria}</Text>
                  <Text style={styles.cell}>{new Date(r.fecha).toLocaleString()}</Text>
                  <Text style={styles.cell}>{r.usuario}</Text>
                  <Text
                    style={[styles.cell, { color: getColor(r.importancia), fontWeight: 'bold' }]}
                  >
                    {r.importancia}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => irACreadorReporte(null)}
      >
        <FontAwesome name="plus" size={24} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 40,
    backgroundColor: '#0f172a',
  },
  title: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  scrollTable: {
    paddingBottom: 100,
    paddingHorizontal: 16,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 6,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 6,
  },
  cell: {
    width: 140,
    color: 'white',
    fontSize: 14,
    paddingRight: 8,
  },
  headerText: {
    fontWeight: 'bold',
    color: '#93c5fd',
  },
  noData: {
    color: 'white',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 20,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 60,
    right: 20,
    backgroundColor: '#3B82F6',
    width: 56,
    height: 56,
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
