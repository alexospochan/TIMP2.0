import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  SafeAreaView,
  Alert,
  Modal,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import * as Clipboard from 'expo-clipboard';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

import { API_URL } from '@env';

const etiquetas = {
  Zanjeado: 'El trabajo consistió en la excavación de una zanja para la instalación de cables de fibra óptica...',
  Avance: 'El trabajo ha progresado de acuerdo al plan establecido y se ha completado un 30%...',
  Daños: 'Se han identificado daños...',
};

const CLOUD_NAME = 'dudope9kq';
const UPLOAD_PRESET = 'TIMPAPP';

export default function CreadorReporte({ navigation, route }) {
  const { proyectoSeleccionado, reporte, usuario } = route.params || {};

  const [prioridad, setPrioridad] = useState(reporte?.importancia || 'Alta');
  const [etiqueta, setEtiqueta] = useState(reporte?.categoria || 'Zanjeado');
  const [descripcion, setDescripcion] = useState(reporte?.descripcion || etiquetas['Zanjeado']);
  const [imagenes, setImagenes] = useState(reporte?.imagenes || []);
  const [modalEtiquetaVisible, setModalEtiquetaVisible] = useState(false);
  const [modalPrioridadVisible, setModalPrioridadVisible] = useState(false);
  const [modalImagenVisible, setModalImagenVisible] = useState(false);
  const [imagenSeleccionada, setImagenSeleccionada] = useState(null);
  const [loading, setLoading] = useState(false);

  const fechaActual = new Date().toLocaleString();

  // Verificar usuario autenticado
  useEffect(() => {
    if (!usuario?.email) {
      Alert.alert(
        'No autenticado',
        'Debes iniciar sesión para crear o editar reportes.',
        [{ text: 'OK', onPress: () => navigation.goBack() }],
        { cancelable: false }
      );
    }
  }, [usuario]);

  if (!usuario?.email) return null;

  // Subir imagen a Cloudinary
  const subirImagenACloudinary = async (uri) => {
    try {
      const data = new FormData();
      data.append('file', {
        uri,
        type: 'image/jpeg',
        name: 'upload.jpg',
      });
      data.append('upload_preset', UPLOAD_PRESET);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: data,
      });

      const file = await res.json();

      if (file.secure_url) {
        return file.secure_url;
      } else {
        throw new Error('No se pudo obtener la URL segura');
      }
    } catch (error) {
      console.log('Error al subir imagen a Cloudinary:', error);
      throw error;
    }
  };

  // Tomar foto y obtener ubicación
  const tomarFoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      return alert('Se requieren permisos de cámara');
    }
    if (imagenes.length >= 20) {
      return alert('Máximo 20 imágenes permitidas');
    }

    const result = await ImagePicker.launchCameraAsync({ quality: 0.6, base64: false });
    if (!result.canceled) {
      try {
        setLoading(true);
        const urlCloudinary = await subirImagenACloudinary(result.assets[0].uri);

        let coordenadas = 'Ubicación no disponible';

        const { status: locStatus } = await Location.requestForegroundPermissionsAsync();
        if (locStatus === 'granted') {
          const location = await Location.getCurrentPositionAsync({});
          coordenadas = `${location.coords.latitude.toFixed(6)}, ${location.coords.longitude.toFixed(6)}`;
        }

        const nuevaImagen = {
          uri: urlCloudinary,
          coordenadas,
        };

        setImagenes((prev) => [...prev, nuevaImagen]);
      } catch (error) {
        alert('Error al subir imagen, intenta de nuevo');
      } finally {
        setLoading(false);
      }
    }
  };

  // Borrar imagen
  const borrarImagen = (index) => {
    Alert.alert('Eliminar imagen', '¿Seguro que deseas eliminar esta fotografía?', [
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

  // Copiar coordenadas al portapapeles
  const copiarCoord = async (coord) => {
    await Clipboard.setStringAsync(coord);
    alert('Coordenadas copiadas');
  };

  // Guardar reporte (POST o PUT)
  const guardarReporte = async () => {
    if (!descripcion.trim()) {
      alert('La descripción no puede estar vacía');
      return;
    }
    setLoading(true);

    const datos = {
      categoria: etiqueta,
      importancia: prioridad,
      descripcion,
      usuario: usuario.email,
      fecha: new Date(),
      imagenes,
      proyectoId: proyectoSeleccionado._id,
    };

    try {
      const url = reporte ? `${API_URL}/reportes/${reporte._id}` : `${API_URL}/reportes`;
      const method = reporte ? 'PUT' : 'POST';

      console.log('Guardando reporte a:', url);
      console.log('Datos:', datos);

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos),
      });

      const text = await res.text();
      console.log('Respuesta servidor:', text);

      if (!res.ok) {
        let errorMsg = text;
        try {
          const json = JSON.parse(text);
          errorMsg = json.message || JSON.stringify(json);
        } catch (e) {
          // no JSON, mantener texto
        }
        throw new Error(errorMsg);
      }

      alert('Reporte guardado exitosamente');
      navigation.goBack();
    } catch (error) {
      console.error('Error al guardar reporte:', error);
      alert(`Error al guardar: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Exportar reporte a PDF y compartir
  const exportarPDF = async () => {
    try {
      const imagenesBase64 = await Promise.all(
        imagenes.map(async (img) => {
          const response = await fetch(img.uri);
          const blob = await response.blob();

          const base64 = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });

          return { ...img, base64 };
        })
      );

      const contenidoHTML = `
        <html>
          <head>
            <meta charset="utf-8" />
            <style>
              @page { size: A4; margin: 0; }
              body { margin: 0; font-family: 'Segoe UI', sans-serif; background: white; }
              .portada { height: 100vh; position: relative; overflow: hidden; }
              .logo {
                position: absolute;
                top: 40px;
                left: 60px;
                font-size: 42px;
                font-weight: bold;
                color: #1f4c7c;
                text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.2);
                letter-spacing: 2px;
              }
              .franja { position: absolute; width: 200%; height: 100px; transform: rotate(-12deg); left: -50%; }
              .franja1 { top: 260px; background-color: #00a9e0; z-index: 1; }
              .franja2 { top: 320px; background-color: #003366; z-index: 2; }
              .franja3 { top: 400px; background-color: #005fa3; z-index: 3; }
              .titulo {
                position: absolute;
                top: 360px;
                width: 100%;
                text-align: center;
                font-size: 18px;
                font-weight: normal;
                color: white;
                z-index: 4;
                text-transform: uppercase;
                line-height: 1.5;
              }
              .equipo-container {
                position: absolute;
                bottom: 80px;
                right: 60px;
                z-index: 5;
                text-align: right;
              }
              .barra {
                width: 2px;
                height: 30px;
                background-color: #003366;
                margin-right: 5px;
                display: inline-block;
                vertical-align: middle;
              }
              .equipo-texto {
                display: inline-block;
                vertical-align: middle;
                color: #003366;
                font-size: 14px;
              }
              .equipo-texto strong {
                display: block;
                font-weight: bold;
                color: #003366;
              }
              .contenido {
                padding: 40px;
                page-break-before: always;
              }
              h2 { color: #003366; }
              .section { margin-bottom: 16px; }
              .label { font-weight: bold; }
              .coord { color: #555; font-size: 13px; }
              .image {
                width: 100%;
                height: auto;
                margin-top: 8px;
                border-radius: 8px;
                max-height: 350px;
              }
            </style>
          </head>
          <body>
            <div class="portada">
              <div class="logo">FLYCOM</div>
              <div class="franja franja1"></div>
              <div class="franja franja2"></div>
              <div class="franja franja3"></div>
              <div class="titulo">REPORTE DE AFECTACIÓN A LA<br />INFRAESTRUCTURA GOLD DATA</div>
              <div class="equipo-container">
                <div class="barra"></div>
                <div class="equipo-texto">
                  Equipo<br /><strong>Gold data</strong>
                </div>
              </div>
            </div>

            <div class="contenido">
              <h2>Reporte: ${etiqueta}</h2>
              <div class="section"><span class="label">Fecha:</span> ${fechaActual}</div>
              <div class="section"><span class="label">Usuario:</span> ${usuario?.email || 'usuario@ejemplo.com'}</div>
              <div class="section"><span class="label">Prioridad:</span> ${prioridad}</div>
              <div class="section"><span class="label">Descripción:</span><br />${descripcion}</div>

              ${imagenesBase64
                .map(
                  (img) => `
                <div class="section">
                  <span class="label">Coordenadas:</span>
                  <div class="coord">${img.coordenadas}</div>
                  <img class="image" src="${img.base64}" />
                </div>
              `
                )
                .join('')}
            </div>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html: contenidoHTML });
      await Sharing.shareAsync(uri);
    } catch (error) {
      console.error(error);
      alert('Error al generar PDF');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0B1626' }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 90 }}>
        <View style={{ flexDirection: 'row', marginBottom: 20 }}>
          <TouchableOpacity onPress={tomarFoto} style={styles.mainImageBox} disabled={loading}>
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
              <TouchableOpacity
                onPress={guardarReporte}
                style={{
                  backgroundColor: '#3182ce',
                  padding: 10,
                  borderRadius: 8,
                  alignSelf: 'center',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
                disabled={loading}
              >
                {loading ? <ActivityIndicator color="white" /> : <Feather name="save" size={20} color="white" />}
              </TouchableOpacity>
            </View>
            <Text style={[styles.label, { marginTop: 5 }]}>Usuario: {usuario?.email || 'usuario@ejemplo.com'}</Text>

            <View style={{ marginTop: 10 }}>
              <Text style={styles.label}>Etiqueta</Text>
              <TouchableOpacity onPress={() => setModalEtiquetaVisible(true)} style={[styles.tag, styles.selectedTag]}>
                <Text style={{ color: 'white' }}>{etiqueta}</Text>
              </TouchableOpacity>
              <Modal transparent visible={modalEtiquetaVisible} animationType="fade" onRequestClose={() => setModalEtiquetaVisible(false)}>
                <View style={styles.modalOverlay}>
                  <View style={styles.modalContainer}>
                    {Object.keys(etiquetas).map((e) => (
                      <Pressable
                        key={e}
                        onPress={() => {
                          setEtiqueta(e);
                          setDescripcion(etiquetas[e]);
                          setModalEtiquetaVisible(false);
                        }}
                        style={styles.modalOption}
                      >
                        <Text style={{ color: 'white' }}>{e}</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              </Modal>

              <Text style={[styles.label, { marginTop: 10 }]}>Prioridad</Text>
              <TouchableOpacity onPress={() => setModalPrioridadVisible(true)} style={styles.tag}>
                <Text
                  style={{
                    color: prioridad === 'Alta' ? '#dc2626' : prioridad === 'Media' ? '#f59e0b' : '#16a34a',
                    fontWeight: 'bold',
                  }}
                >
                  {prioridad}
                </Text>
              </TouchableOpacity>
              <Modal transparent visible={modalPrioridadVisible} animationType="fade" onRequestClose={() => setModalPrioridadVisible(false)}>
                <View style={styles.modalOverlay}>
                  <View style={styles.modalContainer}>
                    {['Alta', 'Media', 'Baja'].map((level) => (
                      <Pressable
                        key={level}
                        onPress={() => {
                          setPrioridad(level);
                          setModalPrioridadVisible(false);
                        }}
                        style={styles.modalOption}
                      >
                        <Text style={{ color: level === 'Alta' ? '#dc2626' : level === 'Media' ? '#f59e0b' : '#16a34a', fontWeight: 'bold' }}>
                          {level}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              </Modal>
            </View>
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
            editable={!loading}
          />
        </View>

        {imagenes.map((img, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => {
              setImagenSeleccionada(img.uri);
              setModalImagenVisible(true);
            }}
            disabled={loading}
          >
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

      {/* Botón flotante para exportar PDF */}
      <TouchableOpacity
        onPress={exportarPDF}
        style={{
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
        }}
        disabled={loading}
      >
        <Feather name="file-text" size={24} color="white" />
      </TouchableOpacity>

      {loading && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: 'rgba(0,0,0,0.3)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <ActivityIndicator size="large" color="#fff" />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  mainImageBox: {
    width: 140,
    height: 180,
    backgroundColor: '#1e2a47',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: { justifyContent: 'center', alignItems: 'center' },
  imageCard: {
    backgroundColor: '#142847',
    borderRadius: 15,
    marginBottom: 12,
    overflow: 'hidden',
  },
  cardImage: { width: '100%', height: 180 },
  coordBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#1e2a47',
    padding: 10,
    alignItems: 'center',
  },
  coordText: { color: '#90cdf4', fontSize: 13 },
  infoCard: { backgroundColor: '#142847', borderRadius: 15, padding: 15, marginBottom: 20 },
  label: { color: '#e1e8f7', fontWeight: '700' },
  tag: { backgroundColor: '#1f4d8a', padding: 8, borderRadius: 20, marginTop: 5, paddingHorizontal: 15 },
  selectedTag: { backgroundColor: '#3182ce' },
  inputArea: {
    backgroundColor: '#1f2d54',
    color: '#cbd5e1',
    borderRadius: 12,
    padding: 15,
    fontSize: 15,
    height: 120,
    textAlignVertical: 'top',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    backgroundColor: '#1e2a47',
    margin: 30,
    borderRadius: 10,
    padding: 20,
  },
  modalOption: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
});
