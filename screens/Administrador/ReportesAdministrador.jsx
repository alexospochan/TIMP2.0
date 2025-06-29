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
  TouchableOpacity,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons'; // Icono del botón

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
        const res = await fetch(`http://192.168.73.158:3000/reportes/proyecto/${proyectoSeleccionado._id}`);
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

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Reportes de {proyectoSeleccionado?.nombre}</Text>

        {loading && <ActivityIndicator size="large" color="#3B82F6" style={{ marginVertical: 20 }} />}

        {error && <Text style={[styles.noData, { color: 'red' }]}>{error}</Text>}

        {!loading && !error && reportes.length === 0 && (
          <Text style={styles.noData}>No hay reportes aún.</Text>
        )}

        {!loading && !error && reportes.map((r) => (
          <View key={r._id} style={styles.reporteCard}>
            <Text style={styles.categoria}>{r.categoria}</Text>
            <Text style={styles.importancia}>{r.importancia}</Text>
            <Text style={styles.fecha}>{new Date(r.fecha).toLocaleString()}</Text>
            <Text style={styles.usuario}>Usuario: {r.usuario}</Text>
            <Text style={styles.descripcion}>{r.descripcion}</Text>

            {r.imagenes && r.imagenes.map((img, i) => (
              <View key={i} style={{ marginTop: 8 }}>
                <Image source={{ uri: img.uri }} style={{ width: 100, height: 100, borderRadius: 8 }} />
                <Text style={styles.coordText}>{img.coordenadas}</Text>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>

      {/* BOTÓN FLOTANTE */}
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
  container: {
    padding: 16,
    paddingTop: 64,
    paddingBottom: 100, // para que no se tape con el botón flotante
  },
  title: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  noData: {
    color: 'white',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 20,
  },
  reporteCard: {
    backgroundColor: '#1e293b',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  categoria: {
    color: '#63b3ed',
    fontWeight: 'bold',
  },
  importancia: {
    color: '#facc15',
  },
  fecha: {
    color: 'white',
    fontSize: 12,
  },
  usuario: {
    color: 'white',
  },
  descripcion: {
    color: 'white',
    marginTop: 8,
  },
  coordText: {
    color: '#90cdf4',
    marginTop: 4,
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
