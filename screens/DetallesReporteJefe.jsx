import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

import { API_URL } from '../api';

export default function DetallesReporteJefe({ route, navigation }) {
  const { reporte, usuario } = route.params;

  const [modalImagenVisible, setModalImagenVisible] = useState(false);
  const [imagenSeleccionada, setImagenSeleccionada] = useState(null);

  // Aquí guardamos si el usuario actual ya marcó leído el comentario
  const [comentarioLeido, setComentarioLeido] = useState(false);

  // Cada vez que carga o cambia el reporte, verificamos si el usuario está en la lista de leídos
  useEffect(() => {
    if (reporte.leidoPor && usuario?._id) {
      const yaLeido = reporte.leidoPor.some(
        (idUser) => idUser.toString() === usuario._id.toString()
      );
      setComentarioLeido(yaLeido);
    } else {
      setComentarioLeido(false);
    }
  }, [reporte, usuario]);

  // Función para copiar coordenadas al portapapeles
  const copiarCoord = async (coord) => {
    const Clipboard = require('expo-clipboard');
    try {
      await Clipboard.setStringAsync(coord);
      Alert.alert('Coordenadas copiadas');
    } catch {
      Alert.alert('No se pudo copiar las coordenadas');
    }
  };

  // Función para marcar comentario como leído para el usuario actual
  const marcarComoLeido = async () => {
    if (!usuario?._id) {
      Alert.alert('Error', 'No se encontró el ID del usuario.');
      return;
    }
    if (comentarioLeido) {
      Alert.alert('Info', 'El comentario ya está marcado como leído.');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/reportes/${reporte._id}/comentario-leido`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: usuario._id }),
      });
      if (!response.ok) {
        throw new Error('Error al marcar como leído');
      }
      const data = await response.json();
      setComentarioLeido(true);
      Alert.alert('Comentario marcado como leído');

      // Opcional: actualizar reporte local con el reporte que viene del backend actualizado
      if (data.reporte) {
        navigation.setParams({ reporte: data.reporte });
      }
    } catch (error) {
      console.error('Error al marcar como leído:', error);
      Alert.alert('Error al marcar como leído');
    }
  };

  const fechaFormateada = new Date(reporte.fecha).toLocaleString();

  // Función para exportar reporte a PDF
  const exportarPDF = async () => {
    try {
      const contenidoHTML = `
        <html>
          <head>
            <meta charset="utf-8" />
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; background: white; color: #333; }
              h1 { color: #16a34a; }
              .section { margin-bottom: 20px; }
              .label { font-weight: bold; font-size: 18px; margin-bottom: 6px; }
              .value { font-size: 16px; }
              .comentario { background-color: #f0fdf4; padding: 10px; border-radius: 5px; margin-top: 6px; }
              img { max-width: 100%; border-radius: 10px; margin-top: 10px; }
            </style>
          </head>
          <body>
            <h1>Reporte de Afectación</h1>

            <div class="section">
              <div class="label">Categoría:</div>
              <div class="value">${reporte.categoria || 'N/A'}</div>
            </div>

            <div class="section">
              <div class="label">Prioridad:</div>
              <div class="value">${reporte.importancia || 'N/A'}</div>
            </div>

            <div class="section">
              <div class="label">Fecha:</div>
              <div class="value">${fechaFormateada}</div>
            </div>

            <div class="section">
              <div class="label">Usuario:</div>
              <div class="value">${reporte.usuario || usuario?.email || 'Desconocido'}</div>
            </div>

            <div class="section">
              <div class="label">Descripción:</div>
              <div class="value">${reporte.descripcion || '-'}</div>
            </div>

            <div class="section">
              <div class="label">Comentario:</div>
              <div class="comentario">${reporte.comentario || 'Sin comentario'}</div>
            </div>

            ${
              reporte.imagenes?.length > 0
                ? reporte.imagenes
                    .map(
                      (img) => `
              <div class="section">
                <div class="label">Coordenadas:</div>
                <div class="value">${img.coordenadas || 'Sin coordenadas'}</div>
                <img src="${img.uri}" />
              </div>
            `
                    )
                    .join('')
                : ''
            }
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html: contenidoHTML });
      await Sharing.shareAsync(uri);
    } catch (error) {
      Alert.alert('Error al generar PDF');
      console.error(error);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0B1626' }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 90 }}>
        <View style={styles.infoCard}>
          <Text style={styles.label}>Categoría</Text>
          <Text style={styles.value}>{reporte.categoria || 'N/A'}</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.label}>Prioridad</Text>
          <Text
            style={[
              styles.value,
              {
                color:
                  reporte.importancia === 'Alta'
                    ? '#dc2626'
                    : reporte.importancia === 'Media'
                    ? '#f59e0b'
                    : '#16a34a',
                fontWeight: 'bold',
              },
            ]}
          >
            {reporte.importancia || 'N/A'}
          </Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.label}>Fecha</Text>
          <Text style={styles.value}>{fechaFormateada}</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.label}>Usuario</Text>
          <Text style={styles.value}>{reporte.usuario || usuario?.email || 'Desconocido'}</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.label}>Comentario del administrador</Text>
          <Text style={[styles.value, { marginTop: 6 }]}>{reporte.comentario || 'Sin comentario aún.'}</Text>

          {!comentarioLeido && (
            <TouchableOpacity style={styles.leidoBtn} onPress={marcarComoLeido}>
              <Text style={styles.leidoBtnText}>Marcar como leído</Text>
            </TouchableOpacity>
          )}

          {comentarioLeido && (
            <Text style={{ color: '#10b981', marginTop: 8, fontWeight: 'bold' }}>
              Comentario leído ✔
            </Text>
          )}
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.label}>Descripción</Text>
          <Text style={[styles.value, { fontSize: 15, marginTop: 6 }]}>{reporte.descripcion || '-'}</Text>
        </View>

        {reporte.imagenes?.length > 0 ? (
          reporte.imagenes.map((img, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => {
                setImagenSeleccionada(img.uri);
                setModalImagenVisible(true);
              }}
              style={styles.imageCard}
            >
              <Image source={{ uri: img.uri }} style={styles.cardImage} />
              <View style={styles.coordBar}>
                <Text style={styles.coordText}>{img.coordenadas || 'Sin coordenadas'}</Text>
                <TouchableOpacity onPress={() => copiarCoord(img.coordenadas)} style={{ marginLeft: 10 }}>
                  <Feather name="copy" size={20} color="#63b3ed" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={{ color: 'white', marginTop: 10 }}>No hay imágenes disponibles.</Text>
        )}

        <Modal visible={modalImagenVisible} transparent animationType="fade">
          <Pressable
            style={{
              flex: 1,
              backgroundColor: 'rgba(0,0,0,0.9)',
              justifyContent: 'center',
              alignItems: 'center',
            }}
            onPress={() => setModalImagenVisible(false)}
          >
            {imagenSeleccionada && (
              <Image
                source={{ uri: imagenSeleccionada }}
                style={{ width: '95%', height: '80%', resizeMode: 'contain', borderRadius: 10 }}
              />
            )}
          </Pressable>
        </Modal>
      </ScrollView>

      <TouchableOpacity onPress={exportarPDF} style={styles.floatingButton}>
        <Feather name="file-text" size={24} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  infoCard: {
    backgroundColor: '#142847',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
  },
  label: {
    color: '#e1e8f7',
    fontWeight: '700',
    fontSize: 16,
  },
  value: {
    color: '#cbd5e1',
    marginTop: 6,
  },
  imageCard: {
    backgroundColor: '#142847',
    borderRadius: 15,
    marginBottom: 12,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: 180,
  },
  coordBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e2a47',
    padding: 10,
  },
  coordText: {
    color: '#90cdf4',
    fontSize: 13,
    flex: 1,
  },
  leidoBtn: {
    backgroundColor: '#3b82f6',
    marginTop: 12,
    borderRadius: 12,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  leidoBtnText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 15,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#16a34a',
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
