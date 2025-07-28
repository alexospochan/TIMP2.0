import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image,
  SafeAreaView, Alert, Modal, Pressable
} from 'react-native';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import * as Clipboard from 'expo-clipboard';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

import { API_URL } from '../api';

const etiquetas = {
  Zanjeado: 'El trabajo consistió en la excavación de una zanja para la instalación de cables de fibra óptica...',
  Avance: 'El trabajo ha progresado de acuerdo al plan establecido y se ha completado un 30%...',
  Daños: 'Se han identificado daños...',
};

const CLOUD_NAME = 'dudope9kq';
const UPLOAD_PRESET = 'TIMPAPP';

export default function Crear_Reporte({ navigation, route }) {
  const { proyectoSeleccionado, reporte, usuario } = route.params || {};
  const [prioridad, setPrioridad] = useState(reporte?.importancia || 'Alta');
  const [etiqueta, setEtiqueta] = useState(reporte?.categoria || 'Zanjeado');
  const [descripcion, setDescripcion] = useState(reporte?.descripcion || etiquetas['Zanjeado']);
  const [comentario, setComentario] = useState(reporte?.comentario || '');  // <--- comentario agregado
  const [imagenes, setImagenes] = useState(reporte?.imagenes || []);
  const [modalEtiquetaVisible, setModalEtiquetaVisible] = useState(false);
  const [modalPrioridadVisible, setModalPrioridadVisible] = useState(false);
  const [modalImagenVisible, setModalImagenVisible] = useState(false);
  const [imagenSeleccionada, setImagenSeleccionada] = useState(null);
  const fechaActual = new Date().toLocaleString();

  const subirImagenACloudinary = async (uri) => {
    try {
      const data = new FormData();
      data.append('file', { uri, type: 'image/jpeg', name: 'upload.jpg' });
      data.append('upload_preset', UPLOAD_PRESET);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: data,
      });

      const file = await res.json();
      if (file.secure_url) return file.secure_url;
      throw new Error('No se pudo obtener la URL segura');
    } catch (error) {
      console.error('Error al subir imagen:', error);
      throw error;
    }
  };

  const tomarFoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      alert('Se requieren permisos de cámara');
      return;
    }
    if (imagenes.length >= 20) {
      alert('Máximo 20 imágenes');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({ quality: 0.6 });
    if (!result.canceled) {
      try {
        const uri = result.assets[0].uri;
        const url = await subirImagenACloudinary(uri);
        const nuevaImagen = { uri: url, coordenadas: 'Obteniendo ubicación...' };
        setImagenes(prev => [...prev, nuevaImagen]);

        const { status: locStatus } = await Location.requestForegroundPermissionsAsync();
        if (locStatus === 'granted') {
          const location = await Location.getCurrentPositionAsync({});
          const coords = `${location.coords.latitude.toFixed(6)}, ${location.coords.longitude.toFixed(6)}`;
          setImagenes(prev => {
            const nuevas = [...prev];
            nuevas[nuevas.length - 1] = { ...nuevas[nuevas.length - 1], coordenadas: coords };
            return nuevas;
          });
        }
      } catch {
        alert('Error al subir imagen');
      }
    }
  };

  const borrarImagen = (index) => {
    Alert.alert('Eliminar imagen', '¿Deseas eliminar esta imagen?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => {
          const nuevas = [...imagenes];
          nuevas.splice(index, 1);
          setImagenes(nuevas);
        },
      },
    ]);
  };

  const copiarCoord = async (coord) => {
    await Clipboard.setStringAsync(coord);
    alert('Coordenadas copiadas');
  };

  const guardarReporte = async () => {
    if (!descripcion.trim()) {
      alert('La descripción no puede estar vacía');
      return;
    }

    if (!proyectoSeleccionado?._id) {
      alert('No hay proyecto seleccionado válido');
      return;
    }

    const datos = {
      categoria: etiqueta,
      importancia: prioridad,
      descripcion,
      comentario,      // <--- Guardamos el comentario también
      usuario: usuario?.email || 'usuario@ejemplo.com',
      fecha: new Date(),
      imagenes,
      proyectoId: proyectoSeleccionado._id,
    };

    try {
      const url = reporte ? `${API_URL}/reportes/${reporte._id}` : `${API_URL}/reportes`;
      const method = reporte ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos),
      });

      const text = await res.text();

      if (!res.ok) throw new Error(`Error al guardar: ${res.status} - ${text}`);

      alert('Reporte guardado exitosamente');
      navigation.navigate('Reportes');
    } catch (error) {
      console.error('Error guardando reporte:', error);
      alert('Error al guardar reporte: ' + error.message);
    }
  };

  const exportarPDF = async () => {
    try {
      const imagenesBase64 = await Promise.all(imagenes.map(async (img) => {
        const response = await fetch(img.uri);
        const blob = await response.blob();
        const base64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
        return { ...img, base64 };
      }));

      const html = `
        <html><head><style>
        body { font-family: Arial; padding: 40px; }
        h2 { color: #003366; }
        img { width: 100%; max-height: 300px; margin-bottom: 20px; border-radius: 8px; }
        .coord { font-size: 12px; color: #555; }
        </style></head><body>
        <h2>Reporte: ${etiqueta}</h2>
        <p><strong>Fecha:</strong> ${fechaActual}</p>
        <p><strong>Usuario:</strong> ${usuario?.email || 'usuario@ejemplo.com'}</p>
        <p><strong>Prioridad:</strong> ${prioridad}</p>
        <p><strong>Descripción:</strong><br />${descripcion}</p>
        <p><strong>Comentario:</strong><br />${comentario || 'Sin comentarios'}</p>
        ${imagenesBase64.map(img => `
          <div>
            <p class="coord"><strong>Coordenadas:</strong> ${img.coordenadas}</p>
            <img src="${img.base64}" />
          </div>
        `).join('')}
        </body></html>`;

      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri);
    } catch (err) {
      console.error(err);
      alert('Error al generar PDF');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0B1626' }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 90 }}>
        <View style={{ flexDirection: 'row', marginBottom: 20 }}>
          <TouchableOpacity onPress={tomarFoto} style={styles.mainImageBox}>
            {imagenes[0] ? (
              <Image source={{ uri: imagenes[0].uri }} style={styles.cardImage} />
            ) : (
              <View style={styles.placeholder}>
                <Text style={{ fontSize: 40, color: '#90cdf4' }}>+</Text>
              </View>
            )}
          </TouchableOpacity>

          <View style={{ flex: 1, marginLeft: 15 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={styles.label}>{fechaActual}</Text>
              <TouchableOpacity onPress={guardarReporte} style={styles.saveButton}>
                <Feather name="save" size={20} color="white" />
              </TouchableOpacity>
            </View>

            <Text style={[styles.label, { marginTop: 5 }]}>
              Usuario: {usuario?.email || 'usuario@ejemplo.com'}
            </Text>

            <Text style={[styles.label, { marginTop: 10 }]}>Etiqueta</Text>
            <TouchableOpacity onPress={() => setModalEtiquetaVisible(true)} style={[styles.tag, styles.selectedTag]}>
              <Text style={{ color: 'white' }}>{etiqueta}</Text>
            </TouchableOpacity>

            <Modal transparent visible={modalEtiquetaVisible} animationType="fade">
              <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                  {Object.keys(etiquetas).map(e => (
                    <Pressable key={e} onPress={() => {
                      setEtiqueta(e); setDescripcion(etiquetas[e]); setModalEtiquetaVisible(false);
                    }} style={styles.modalOption}>
                      <Text style={{ color: 'white' }}>{e}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </Modal>

            <Text style={[styles.label, { marginTop: 10 }]}>Prioridad</Text>
            <TouchableOpacity onPress={() => setModalPrioridadVisible(true)} style={styles.tag}>
              <Text style={{
                color: prioridad === 'Alta' ? '#dc2626' : prioridad === 'Media' ? '#f59e0b' : '#16a34a',
                fontWeight: 'bold'
              }}>{prioridad}</Text>
            </TouchableOpacity>

            <Modal transparent visible={modalPrioridadVisible} animationType="fade">
              <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                  {['Alta', 'Media', 'Baja'].map(level => (
                    <Pressable key={level} onPress={() => {
                      setPrioridad(level); setModalPrioridadVisible(false);
                    }} style={styles.modalOption}>
                      <Text style={{
                        color: level === 'Alta' ? '#dc2626' : level === 'Media' ? '#f59e0b' : '#16a34a',
                        fontWeight: 'bold'
                      }}>{level}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </Modal>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.label}>Descripción</Text>
          <TextInput
            multiline
            style={styles.inputArea}
            value={descripcion}
            onChangeText={setDescripcion}
            placeholder="Observaciones..."
            placeholderTextColor="#7b8ea3"
          />
        </View>

        {/* NUEVO APARTADO PARA COMENTARIO */}
        <View style={styles.infoCard}>
          <Text style={styles.label}>Comentario</Text>
          <TextInput
            multiline
            style={styles.inputArea}
            value={comentario}
            onChangeText={setComentario}
            placeholder="Escribe aquí tu comentario"
            placeholderTextColor="#7b8ea3"
          />
        </View>

        {imagenes.map((img, i) => (
          <TouchableOpacity key={i} onPress={() => { setImagenSeleccionada(img.uri); setModalImagenVisible(true); }}>
            <View style={styles.imageCard}>
              <Image source={{ uri: img.uri }} style={styles.cardImage} />
              <View style={styles.coordBar}>
                <Text style={styles.coordText}>{img.coordenadas}</Text>
                <View style={{ flexDirection: 'row' }}>
                  <TouchableOpacity onPress={() => copiarCoord(img.coordenadas)} style={{ marginRight: 10 }}>
                    <Feather name="copy" size={20} color="#63b3ed" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => borrarImagen(i)}>
                    <MaterialIcons name="delete" size={22} color="#f87171" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        <Modal visible={modalImagenVisible} transparent animationType="fade">
          <Pressable
            style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' }}
            onPress={() => setModalImagenVisible(false)}
          >
            {imagenSeleccionada && (
              <Image source={{ uri: imagenSeleccionada }} style={{ width: '95%', height: '80%', resizeMode: 'contain', borderRadius: 10 }} />
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
  mainImageBox: {
    width: 140, height: 180, backgroundColor: '#1e2a47',
    borderRadius: 15, justifyContent: 'center', alignItems: 'center',
  },
  placeholder: { justifyContent: 'center', alignItems: 'center' },
  cardImage: { width: '100%', height: 180 },
  imageCard: { backgroundColor: '#142847', borderRadius: 15, marginBottom: 12, overflow: 'hidden' },
  coordBar: {
    flexDirection: 'row', justifyContent: 'space-between',
    backgroundColor: '#1e2a47', padding: 10, alignItems: 'center',
  },
  coordText: { color: '#90cdf4', fontSize: 14, fontWeight: '500' },
  infoCard: { backgroundColor: '#142847', padding: 15, borderRadius: 15, marginBottom: 20 },
  label: { fontWeight: 'bold', fontSize: 14, color: '#90cdf4' },
  inputArea: {
    height: 110, borderColor: '#1e2a47', borderWidth: 1, borderRadius: 15,
    padding: 10, marginTop: 10, color: 'white', textAlignVertical: 'top',
  },
  tag: {
    backgroundColor: '#1e2a47', borderRadius: 10,
    paddingVertical: 8, paddingHorizontal: 20,
    marginBottom: 10, alignSelf: 'flex-start',
  },
  selectedTag: { backgroundColor: '#3182ce' },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(11,22,38,0.9)',
    justifyContent: 'center', alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#0b1626', borderRadius: 15,
    width: 200, paddingVertical: 20, paddingHorizontal: 10,
  },
  modalOption: {
    paddingVertical: 12, paddingHorizontal: 15,
    borderBottomColor: '#1e2a47', borderBottomWidth: 1,
  },
  saveButton: {
    backgroundColor: '#3182ce', padding: 10, borderRadius: 8,
    alignSelf: 'center', justifyContent: 'center', alignItems: 'center',
  },
  floatingButton: {
    position: 'absolute', bottom: 30, right: 20,
    backgroundColor: '#16a34a', width: 56, height: 56, borderRadius: 28,
    justifyContent: 'center', alignItems: 'center',
    elevation: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3, shadowRadius: 3,
  },
});
