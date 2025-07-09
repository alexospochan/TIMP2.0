// Interfaz visual ajustada con sincronización al volver y mejoras UX
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
} from 'react-native';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import * as Clipboard from 'expo-clipboard';

const etiquetas = {
  Zanjeado: 'El trabajo consistió en la excavación de una zanja para la instalación de cables de fibra óptica...',
  Avance: 'El trabajo ha progresado de acuerdo al plan establecido y se ha completado un 30%...',
  Daños: 'Se han identificado daños...'
};

export default function CreadorReporte({ navigation, route }) {
  const { proyectoSeleccionado, reporte, usuario } = route.params || {};

  const [prioridad, setPrioridad] = useState(reporte?.importancia || 'Alta');
  const [etiqueta, setEtiqueta] = useState(reporte?.categoria || 'Zanjeado');
  const [descripcion, setDescripcion] = useState(reporte?.descripcion || etiquetas['Zanjeado']);
  const [imagenes, setImagenes] = useState(reporte?.imagenes || []);
  const [coordenadas, setCoordenadas] = useState([]);
  const [modalEtiquetaVisible, setModalEtiquetaVisible] = useState(false);
  const [modalPrioridadVisible, setModalPrioridadVisible] = useState(false);
  const [modalImagenVisible, setModalImagenVisible] = useState(false);
  const [imagenSeleccionada, setImagenSeleccionada] = useState(null);

  useEffect(() => {
    if (reporte) {
      const coords = reporte.imagenes?.map(img => img.coordenadas) || [];
      setCoordenadas(coords);
    }
  }, [reporte]);

  const tomarFoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') return alert('Se requieren permisos de cámara');
    if (imagenes.length >= 4) return alert('Máximo 4 imágenes');

    const result = await ImagePicker.launchCameraAsync({ quality: 1, exif: true });
    if (!result.canceled) {
      const { status: locStatus } = await Location.requestForegroundPermissionsAsync();
      if (locStatus === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        const newImage = {
          uri: result.assets[0].uri,
          coordenadas: `${location.coords.latitude.toFixed(6)}, ${location.coords.longitude.toFixed(6)}`,
        };
        setImagenes([...imagenes, newImage]);
        setCoordenadas([...coordenadas, newImage.coordenadas]);
      } else {
        alert('Se requieren permisos de ubicación');
      }
    }
  };

  const borrarImagen = (index) => {
    Alert.alert('Eliminar imagen', '¿Seguro que deseas eliminar esta fotografía?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar', style: 'destructive', onPress: () => {
          const nuevas = [...imagenes];
          nuevas.splice(index, 1);
          setImagenes(nuevas);
        }
      }
    ]);
  };

  const copiarCoord = async (coord) => {
    await Clipboard.setStringAsync(coord);
    alert('Coordenadas copiadas');
  };

  const guardarReporte = async () => {
    if (!descripcion.trim()) return alert('La descripción no puede estar vacía');
    const datos = {
      categoria: etiqueta,
      importancia: prioridad,
      descripcion,
      usuario: usuario?.email || 'usuario@ejemplo.com',
      fecha: new Date(),
      imagenes,
      proyectoId: proyectoSeleccionado._id,
    };

    try {
      const url = reporte ? `http://192.168.30.94:3000/reportes/${reporte._id}` : 'http://192.168.30.94:3000/reportes';
      const method = reporte ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos),
      });
      if (!res.ok) throw new Error();
      alert('Reporte guardado exitosamente');
      navigation.goBack();
    } catch {
      alert('Error al guardar');
    }
  };

  const fechaActual = new Date().toLocaleString();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0B1626' }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 90 }}>
        <View style={{ flexDirection: 'row', marginBottom: 20 }}>
          <TouchableOpacity onPress={tomarFoto} style={styles.mainImageBox}>
            {imagenes[0] ? (
              <Image source={{ uri: imagenes[0].uri }} style={styles.cardImage} />
            ) : (
              <View style={styles.placeholder}><Text style={{ fontSize: 40, color: '#90cdf4' }}>+</Text></View>
            )}
          </TouchableOpacity>

          <View style={{ flex: 1, marginLeft: 15 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={styles.label}>{fechaActual}</Text>
              <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity onPress={guardarReporte} style={{ marginRight: 12 }}>
                  <Feather name="save" size={22} color="#90cdf4" />
                </TouchableOpacity>
              </View>
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
                      <Pressable key={e} onPress={() => { setEtiqueta(e); setDescripcion(etiquetas[e]); setModalEtiquetaVisible(false); }} style={styles.modalOption}>
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
              <Modal transparent visible={modalPrioridadVisible} animationType="fade" onRequestClose={() => setModalPrioridadVisible(false)}>
                <View style={styles.modalOverlay}>
                  <View style={styles.modalContainer}>
                    {['Alta', 'Media', 'Baja'].map((level) => (
                      <Pressable key={level} onPress={() => { setPrioridad(level); setModalPrioridadVisible(false); }} style={styles.modalOption}>
                        <Text style={{ color: level === 'Alta' ? '#dc2626' : level === 'Media' ? '#f59e0b' : '#16a34a', fontWeight: 'bold' }}>{level}</Text>
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
          <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' }} onPress={() => setModalImagenVisible(false)}>
            {imagenSeleccionada && (
              <Image source={{ uri: imagenSeleccionada }} style={{ width: '95%', height: '80%', resizeMode: 'contain', borderRadius: 10 }} />
            )}
          </Pressable>
        </Modal>
      </ScrollView>
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
    alignItems: 'center'
  },
  placeholder: { justifyContent: 'center', alignItems: 'center' },
  imageCard: {
    backgroundColor: '#142847',
    borderRadius: 15,
    marginBottom: 12,
    overflow: 'hidden'
  },
  cardImage: { width: '100%', height: 180 },
  coordBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#1e2a47',
    padding: 10,
    alignItems: 'center'
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
    textAlignVertical: 'top'
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
  modalContainer: {
    backgroundColor: '#1e2a47',
    margin: 30,
    borderRadius: 10,
    padding: 20
  },
  modalOption: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#334155'
  }
});
