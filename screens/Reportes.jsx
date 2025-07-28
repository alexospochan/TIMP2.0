import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome5, Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { API_URL} from '@env';

export default function Reportes({ navigation, route }) {
  const [reportes, setReportes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [proyectoId, setProyectoId] = useState(null);
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const fetchProyectoYReportes = async () => {
      try {
        const usuarioStr = await AsyncStorage.getItem('userInfo');
        if (!usuarioStr) {
          console.warn('No hay usuario guardado en AsyncStorage');
          setLoading(false);
          return;
        }
        const usuarioData = JSON.parse(usuarioStr);
        console.log('Usuario cargado:', usuarioData);
        setUsuario(usuarioData);

        if (usuarioData?.proyecto?._id) {
          setProyectoId(usuarioData.proyecto._id);
          await obtenerReportes(usuarioData.proyecto._id);
        } else {
          console.warn('Usuario no tiene proyecto asignado');
          setLoading(false);
        }
      } catch (error) {
        console.error('Error leyendo usuario o reportes:', error);
        setLoading(false);
      }
    };

    fetchProyectoYReportes();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      if (route.params?.refrescar) {
        if (proyectoId) {
          obtenerReportes(proyectoId);
        }
        navigation.setParams({ refrescar: false });
      }
    }, [route.params?.refrescar, proyectoId])
  );

  const obtenerReportes = async (idProyecto) => {
    setLoading(true);
    try {
      const url = `${API_URL}/reportes/proyecto/${idProyecto}`;
      console.log('Solicitando reportes en:', url);

      const response = await fetch(url);

      if (!response.ok) {
        console.error('Error HTTP al obtener reportes:', response.status);
        setReportes([]);
        setLoading(false);
        return;
      }

      const data = await response.json();
      console.log('Reportes recibidos del backend:', data);

      if (Array.isArray(data)) {
        const ordenados = data.sort((a, b) => {
          const tieneNotifA = tieneComentarioNoLeido(a);
          const tieneNotifB = tieneComentarioNoLeido(b);

          if (tieneNotifA && !tieneNotifB) return -1;
          if (!tieneNotifA && tieneNotifB) return 1;

          return new Date(b.fecha) - new Date(a.fecha);
        });

        setReportes(ordenados);
      } else {
        console.warn('Datos recibidos no son un array:', data);
        setReportes([]);
      }
    } catch (error) {
      console.error('Error en fetch reportes:', error);
      setReportes([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const tieneComentarioNoLeido = (reporte) => {
    if (!usuario?._id) return false;
    if (!reporte.comentario) return false;
    if (!reporte.leidoPor || !Array.isArray(reporte.leidoPor)) return true;

    const yaLeido = reporte.leidoPor.some(
      (idUser) => idUser.toString() === usuario._id.toString()
    );
    return !yaLeido;
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (proyectoId) {
      await obtenerReportes(proyectoId);
    }
  };

  const getColor = (importancia) => {
    switch (importancia) {
      case 'Alta':
        return '#dc2626';
      case 'Mediana':
      case 'Media':
        return '#f59e0b';
      case 'Baja':
        return '#16a34a';
      default:
        return 'white';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Cargando reportes...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Feather name="arrow-left" size={24} color="#93c5fd" />
        </TouchableOpacity>
        <Text style={styles.projectTitle} numberOfLines={2} ellipsizeMode="tail">
          {usuario?.proyecto?.nombre || 'Proyecto'}
        </Text>
      </View>

      <ScrollView
        style={styles.verticalScroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <ScrollView horizontal showsHorizontalScrollIndicator>
            <View style={{ minWidth: 600 }}>
              <View style={styles.tableHeader}>
                <Text style={[styles.cell, styles.headerCell, { flex: 0.3 }]}>ID</Text>
                <Text style={[styles.cell, styles.headerCell, { flex: 1.5 }]}>Categoría</Text>
                <Text style={[styles.cell, styles.headerCell, { flex: 1 }]}>Importancia</Text>
                <Text style={[styles.cell, styles.headerCell, { flex: 2 }]}>Fecha / Usuario</Text>
                <Text style={[styles.cell, styles.headerCell, { flex: 0.3 }]}>🗨️</Text>
              </View>

              {reportes.length === 0 ? (
                <Text style={[styles.noData, { textAlign: 'center', marginTop: 20 }]}>
                  No hay reportes aún.
                </Text>
              ) : (
                reportes.map((r, index) => {
                  const mostrarNotificacion = tieneComentarioNoLeido(r);

                  return (
                    <TouchableOpacity
                      key={r._id}
                      style={[
                        styles.tableRow,
                        { backgroundColor: index % 2 === 0 ? '#1e293b' : '#172554' },
                      ]}
                      onPress={() => {
                        navigation.navigate('DetallesReporteJefe', {
                          reporte: r,
                          usuario,
                        });
                      }}
                    >
                      <Text style={[styles.cell, { flex: 0.3 }]}>{index + 1}</Text>
                      <Text style={[styles.cell, { flex: 1.5 }]}>{r.categoria}</Text>
                      <Text
                        style={[
                          styles.cell,
                          { flex: 1, color: getColor(r.importancia), fontWeight: 'bold' },
                        ]}
                      >
                        {r.importancia}
                      </Text>
                      <Text style={[styles.cell, { flex: 2 }]}>
                        {new Date(r.fecha).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}{' '}
                        {new Date(r.fecha).toLocaleDateString()} / {r.usuario}
                      </Text>
                      <View
                        style={[
                          styles.cell,
                          { flex: 0.3, justifyContent: 'center', alignItems: 'center' },
                        ]}
                      >
                        {mostrarNotificacion && (
                          <Feather name="message-square" size={20} color="#dc2626" />
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })
              )}
            </View>
          </ScrollView>
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.fabCircle}
        onPress={() =>
          navigation.navigate('Crear_reporte', {
            proyectoSeleccionado: { _id: proyectoId },
            usuario,
          })
        }
      >
        <FontAwesome5 name="plus" size={24} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0f172a',
    paddingTop: Platform.OS === 'android' ? 20 : 40,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomColor: '#334155',
    borderBottomWidth: 1,
    backgroundColor: '#0f172a',
    marginBottom: 10,
  },
  backButton: {
    marginRight: 12,
    padding: 8,
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  projectTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#93c5fd',
    flexShrink: 1,
    maxWidth: '85%',
  },
  verticalScroll: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  container: {
    flex: 1,
    paddingTop: 20,
    paddingBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#334155',
    paddingVertical: 12,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 6,
  },
  cell: {
    color: 'white',
    fontSize: 14,
    paddingHorizontal: 8,
    textAlignVertical: 'center',
    textAlign: 'left',
  },
  headerCell: {
    fontWeight: 'bold',
    color: '#93c5fd',
  },
  noData: {
    color: 'white',
    fontStyle: 'italic',
    marginTop: 20,
  },
  fabCircle: {
    position: 'absolute',
    bottom: 70,
    right: 20,
    backgroundColor: '#3B82F6',
    width: 66,
    height: 66,
    borderRadius: 38,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 7,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    marginTop: 10,
    fontSize: 16,
  },
});
