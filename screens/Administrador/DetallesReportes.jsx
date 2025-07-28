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
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

import { API_URL } from '../../api'; // Ajusta esta importación según tu proyecto

export default function DetallesReporte({ route, navigation }) {
  const { reporte, usuario } = route.params;

  const [modalImagenVisible, setModalImagenVisible] = useState(false);
  const [imagenSeleccionada, setImagenSeleccionada] = useState(null);
  const [comentario, setComentario] = useState(reporte.comentario || '');
  const [guardando, setGuardando] = useState(false);

  const fechaFormateada = new Date(reporte.fecha).toLocaleString();

  // Marca la notificación como leída cuando el componente carga (si es jefe)
  useEffect(() => {
    const marcarNotificacionLeida = async () => {
      try {
        await fetch(`${API_URL}/reportes/${reporte._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ notificacion: false }),
        });
      } catch (error) {
        console.error('Error al marcar notificación como leída', error);
      }
    };

    if (usuario?.rol === 'jefe') {
      marcarNotificacionLeida();
    }
  }, []);

  const copiarCoord = async (coord) => {
    const Clipboard = require('expo-clipboard');
    try {
      await Clipboard.setStringAsync(coord);
      Alert.alert('Coordenadas copiadas');
    } catch {
      Alert.alert('No se pudo copiar las coordenadas');
    }
  };

  const guardarComentario = async () => {
    if (guardando) return; // evitar doble click
    setGuardando(true);
    try {
      // Asumo que tu API acepta PUT a /reportes/:id con un JSON que tenga { comentario: "..." }
      const res = await fetch(`${API_URL}/reportes/${reporte._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comentario }),
      });
      if (!res.ok) throw new Error('Error al guardar comentario');
      Alert.alert('Comentario guardado');
    } catch (error) {
      console.error(error);
      Alert.alert('Error al guardar comentario');
    } finally {
      setGuardando(false);
    }
  };

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
              <div class="comentario">${comentario || '-'}</div>
            </div>

            ${
              reporte.imagenes && reporte.imagenes.length > 0
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
          <Text style={styles.label}>Comentario</Text>
          <TextInput
            multiline
            style={styles.inputArea}
            placeholder="Escribe aquí un comentario..."
            placeholderTextColor="#7b8ea3"
            value={comentario}
            onChangeText={setComentario}
            editable={!guardando}
          />
          <TouchableOpacity
            style={[styles.guardarBtn, guardando && { backgroundColor: '#555' }]}
            onPress={guardarComentario}
            disabled={guardando}
          >
            {guardando ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.guardarBtnText}>Guardar comentario</Text>
            )}
          </TouchableOpacity>
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
  inputArea: {
    backgroundColor: '#1f2d54',
    color: '#cbd5e1',
    borderRadius: 12,
    padding: 15,
    fontSize: 15,
    height: 100,
    textAlignVertical: 'top',
    marginTop: 6,
  },
  guardarBtn: {
    backgroundColor: '#16a34a',
    marginTop: 12,
    borderRadius: 12,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guardarBtnText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
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
