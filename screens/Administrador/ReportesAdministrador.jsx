// ReportesAdministrador con vista estilo tabla y navegación mejorada
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Image,
  ActivityIndicator,
  TouchableOpacity
} from 'react-native';
import { FontAwesome, Feather } from '@expo/vector-icons';

export default function ReportesAdministrador({ navigation, route }) {
  const { proyectoSeleccionado } = route.params;
  const [reportes, setReportes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReportes = async () => {
      if (!proyectoSeleccionado?._id) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`http://192.168.30.94:3000/reportes/proyecto/${proyectoSeleccionado._id}`);
        if (!res.ok) throw new Error('Error al obtener reportes');
        const data = await res.json();
        setReportes(data);
      } catch (err) {
        console.error('Error cargando reportes:', err);
        setError('No se pudieron cargar los reportes.');
      } finally {
        setLoading(false);
      }
    };

    fetchReportes();
  }, [proyectoSeleccionado]);

  const getColor = (prioridad) => {
    switch (prioridad) {
      case 'Alta': return '#dc2626';
      case 'Media': return '#f59e0b';
      case 'Baja': return '#16a34a';
      default: return 'white';
    }
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar barStyle="light-content" />

      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.navigate('BottomTabs')}>
          <Feather name="arrow-left" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>{proyectoSeleccionado?.nombre}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {loading && <ActivityIndicator size="large" color="#3B82F6" style={{ marginVertical: 20 }} />}
        {error && <Text style={[styles.noData, { color: 'red' }]}>{error}</Text>}
        {!loading && !error && reportes.length === 0 && (
          <Text style={styles.noData}>No hay reportes aún.</Text>
        )}

        {!loading && !error && reportes.map((r) => (
          <TouchableOpacity
            key={r._id}
            onPress={() => navigation.navigate('CreadorReporte', { proyectoSeleccionado, reporte: r })}
            activeOpacity={0.9}
          >
            <View style={styles.reporteRow}>
              <View style={styles.columna}>
                <Text style={styles.label}>Categoría</Text>
                <Text style={styles.valor}>{r.categoria}</Text>
              </View>
              <View style={styles.columna}>
                <Text style={styles.label}>Fecha</Text>
                <Text style={styles.valor}>{new Date(r.fecha).toLocaleString()}</Text>
              </View>
              <View style={styles.columna}>
                <Text style={styles.label}>Usuario</Text>
                <Text style={styles.valor}>{r.usuario}</Text>
              </View>
              <View style={styles.columna}>
                <Text style={styles.label}>Prioridad</Text>
                <Text style={[styles.valor, { color: getColor(r.importancia), fontWeight: 'bold' }]}>
                  {r.importancia}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => navigation.navigate('CreadorReporte', { proyectoSeleccionado })}
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
  container: {
    padding: 16,
    paddingBottom: 100,
  },
  noData: {
    color: 'white',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 20,
  },
  reporteRow: {
    backgroundColor: '#1e293b',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  columna: {
    width: '48%',
    marginBottom: 10,
  },
  label: {
    color: '#94a3b8',
    fontSize: 12,
  },
  valor: {
    color: 'white',
    fontSize: 14,
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
