import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image, ToastAndroid, SafeAreaView } from 'react-native';
import { MaterialIcons, FontAwesome, Entypo } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import * as FileSystem from 'expo-file-system';

import { Sharing } from 'expo';
import * as Clipboard from 'expo-clipboard';

const etiquetas = {
  'Zanjeado': "Descripción del Trabajo Realizado El trabajo consistió en la excavación de una zanja para la instalación de cables de fibra óptica...",
  'Avance': 'El trabajo ha progresado de acuerdo al plan establecido y se ha completado un 30% deL trabajo realizado en la fecha proramada',
  'Daños': 'Se han identificado daños...',
};

export default function ReportScreen() {
  const [prioridad, setPrioridad] = useState('Alta');
  const [etiqueta, setEtiqueta] = useState('Zanjeado');
  const [descripcion, setDescripcion] = useState(etiquetas['Zanjeado']);
  const [imagenes, setImagenes] = useState([]);
  const [coordenadas, setCoordenadas] = useState([]);

  const handleEtiquetaChange = (nuevaEtiqueta) => {
    setEtiqueta(nuevaEtiqueta);
    setDescripcion(etiquetas[nuevaEtiqueta]);
  };

  const tomarFoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      alert('Se requieren permisos de cámara');
      return;
    }

    if (imagenes.length >= 4) {
      alert('Se ha alcanzado el limite de las 4 imagenes');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [3, 4],
      quality: 1,
    });

    if (!result.canceled) {
      const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
      if (locationStatus === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        const newImage = {
          uri: result.assets[0].uri,
          coordenadas: `${location.coords.latitude.toFixed(6)}, ${location.coords.longitude.toFixed(6)}`,
        };
        setImagenes([newImage, ...imagenes]);
        setCoordenadas([newImage.coordenadas, ...coordenadas]);
      } else {
        alert('Se requieren permisos de ubicación');
      }
    }
  };

  const convertirImagenABase64 = async (uri) => {
    try {
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return base64;
    } catch (error) {
      console.error("Error al convertir la imagen a base64:", error);
      return null;
    }
  };

  const generarPDF = async () => {
    try {
      const pdf = await PDFDocument.create();
      const page = pdf.addPage([600, 800]);
      const { height } = page.getSize();

      if (!page) throw new Error('No se pudo crear la página en el PDF.');

      page.drawText('Reporte de Fotos y Coordenadas', {
        x: 50,
        y: height - 50,
        size: 18,
        color: rgb(0, 0, 0),
      });

      for (let index = 0; index < imagenes.length; index++) {
        const image = imagenes[index];
        const imageBase64 = await convertirImagenABase64(image.uri);
        const imageCoordinates = image.coordenadas;

        if (imageBase64 && imageCoordinates) {
          page.drawImage(imageBase64, {
            x: 50,
            y: height - 100 - index * 200,
            width: 180,
            height: 140,
          });

          page.drawText(`Coordenadas: ${imageCoordinates}`, {
            x: 250,
            y: height - 120 - index * 200,
            size: 12,
            color: rgb(0, 0, 0),
          });
        } else {
          console.error(`Imagen o coordenadas faltantes para la imagen en el índice ${index}`);
        }
      }

      const pdfPath = `${FileSystem.documentDirectory}reporte_fotos.pdf`;
      await pdf.writeToFile(pdfPath);

      ToastAndroid.show('PDF generado exitosamente', ToastAndroid.SHORT);
      await Sharing.shareAsync(pdfPath);
    } catch (error) {
      console.error("Error generando el PDF:", error);
      ToastAndroid.show('Error al generar el PDF', ToastAndroid.SHORT);
    }
  };

  const copiarAlPortapapeles = async (texto) => {
    await Clipboard.setStringAsync(texto);
    ToastAndroid.show('Coordenadas copiadas al portapapeles', ToastAndroid.SHORT);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>

          <TouchableOpacity style={styles.imageContainer} onPress={tomarFoto} activeOpacity={0.8}>
            {imagenes.length > 0 ? (
              <Image source={{ uri: imagenes[0].uri }} style={styles.imagePreview} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Text style={styles.plusSign}>+</Text>
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.infoCard}>
            <View style={styles.infoFixed}>
              <Text style={styles.label}>Fecha</Text>
              <Text style={styles.value}>{new Date().toLocaleTimeString()} {new Date().toLocaleDateString()}</Text>

              <Text style={styles.label}>Usuario</Text>
              <Text style={styles.value}>miguel@teintmex.com</Text>
            </View>

            <View style={styles.buttonsGroup}>
              <Text style={styles.subLabel}>Etiqueta</Text>
              <View style={styles.buttonsRow}>
                {Object.keys(etiquetas).map((item) => (
                  <TouchableOpacity
                    key={item}
                    style={[styles.button, etiqueta === item && styles.buttonSelected]}
                    onPress={() => handleEtiquetaChange(item)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.buttonText}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.buttonsGroup}>
              <Text style={styles.subLabel}>Prioridad</Text>
              <View style={styles.buttonsRow}>
                {['Alta', 'Media', 'Baja'].map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={[styles.button, prioridad === level && styles.buttonSelected]}
                    onPress={() => setPrioridad(level)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.buttonText}>{level}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <Text style={[styles.label, { marginTop: 20 }]}>Observaciones</Text>
            <TextInput
              style={styles.textArea}
              multiline
              value={descripcion}
              onChangeText={setDescripcion}
              placeholder="Escribe aquí tus observaciones..."
              placeholderTextColor="#7b8ea3"
            />
          </View>

          <Text style={[styles.label, { marginTop: 30, marginBottom: 10 }]}>Fotos y Coordenadas:</Text>
          <View style={styles.imagesContainer}>
            {imagenes.length === 0 ? (
              <Text style={styles.noImagesText}>No hay fotos tomadas</Text>
            ) : (
              imagenes.map((image, index) => (
                <View key={index} style={styles.imageCard}>
                  <Image source={{ uri: image.uri }} style={styles.cardImage} />
                  <View style={styles.coordContainer}>
                    <Text style={styles.coordText}>{image.coordenadas}</Text>
                    <TouchableOpacity onPress={() => copiarAlPortapapeles(image.coordenadas)} style={styles.copyButton} activeOpacity={0.7}>
                      <Entypo name="clipboard" size={22} color="#90cdf4" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        </ScrollView>

        <View style={styles.bottomNav}>
          <TouchableOpacity activeOpacity={0.7}><FontAwesome name="home" size={24} color="white" /></TouchableOpacity>
          <TouchableOpacity activeOpacity={0.7}><MaterialIcons name="add-circle-outline" size={28} color="white" /></TouchableOpacity>
          <TouchableOpacity activeOpacity={0.7}><FontAwesome name="user-circle" size={24} color="white" /></TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.exportButton}
          onPress={generarPDF}
          activeOpacity={0.8}
        >
          <MaterialIcons name="file-download" size={28} color="white" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0B1626',
  },
  container: {
    flex: 1,
    paddingTop: 60,      // Considerando lo que pediste
    paddingBottom: 20,
    paddingHorizontal: 25,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 60,
  },
  imageContainer: {
    backgroundColor: '#1e2a47',
    borderRadius: 15,
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.2,
    shadowRadius: 9,
    elevation: 9,
  },
  imagePreview: {
    width: '92%',
    height: 210,
    borderRadius: 15,
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusSign: {
    fontSize: 60,
    color: '#90cdf4',
    fontWeight: 'bold',
  },
  infoCard: {
    backgroundColor: '#142847',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  infoFixed: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    color: '#e1e8f7',
  },
  subLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#b0c5e8',
    marginBottom: 6,
  },
  value: {
    fontSize: 15,
    color: '#d3dce6',
    marginTop: 3,
  },
  buttonsGroup: {
    marginBottom: 15,
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  button: {
    backgroundColor: '#224e9b',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 25,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonSelected: {
    backgroundColor: '#63b3ed',
  },
  buttonText: {
    color: '#e1e8f7',
    fontWeight: '600',
    fontSize: 14,
  },
  textArea: {
    backgroundColor: '#1f2d54',
    color: '#cbd5e1',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    height: 120,
    textAlignVertical: 'top',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 7,
    elevation: 6,
  },
  imagesContainer: {
    marginBottom: 40,
  },
  imageCard: {
    backgroundColor: '#142847',
    borderRadius: 15,
    marginBottom: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 7,
    elevation: 7,
  },
  cardImage: {
    width: '100%',
    height: 180,
  },
  coordContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#1e2a47',
    paddingHorizontal: 15,
    paddingVertical: 12,
    alignItems: 'center',
  },
  coordText: {
    color: '#90cdf4',
    fontSize: 14,
    fontWeight: '600',
  },
  copyButton: {
    padding: 4,
  },
  noImagesText: {
    color: '#7b8ea3',
    fontStyle: 'italic',
    textAlign: 'center',
    fontSize: 16,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 14,
    backgroundColor: '#142847',
    borderTopWidth: 1,
    borderTopColor: '#224e9b',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 9,
  },
  exportButton: {
    position: 'absolute',
    right: 20,
    bottom: 80,
    backgroundColor: '#1e40af',
    padding: 18,
    borderRadius: 50,
    shadowColor: '#1e40af',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.7,
    shadowRadius: 10,
    elevation: 10,
  },
});
