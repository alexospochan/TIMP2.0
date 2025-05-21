import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image, ToastAndroid } from 'react-native';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import * as FileSystem from 'expo-file-system';
import { PDFDocument, rgb } from 'react-native-pdf-lib'; // Importar librería de PDF
import { Sharing } from 'expo';

const etiquetas = {
  'Zanjeado': "Descripción del Trabajo RealizadoEl trabajo consistió en la excavación de una zanja para la instalación de cables de fibra óptica...",
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
          coordenadas: `${location.coords.latitude}, ${location.coords.longitude}`,
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
      console.log("Generando PDF...");

      // Asegurarnos de crear un PDFDocument válido
      const pdf = await PDFDocument.create();
      
      // Crear una página en el PDF, y obtener el tamaño de la página.
      const page = pdf.addPage([600, 800]); 
      const { width, height } = page.getSize();

      // Comprobar que la página se creó correctamente.
      if (!page) {
        throw new Error('No se pudo crear la página en el PDF.');
      }

      // Agregar un título en la página
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
          // Dibujar la imagen en el PDF
          page.drawImage(imageBase64, {
            x: 50,
            y: height - 100 - index * 200,
            width: 180,
            height: 140,
          });

          // Agregar las coordenadas en el PDF
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

      // Guardar el PDF en el sistema de archivos
      const pdfPath = `${FileSystem.documentDirectory}reporte_fotos.pdf`;
      await pdf.writeToFile(pdfPath);

      // Mostrar un mensaje de éxito
      ToastAndroid.show('PDF generado exitosamente', ToastAndroid.SHORT);

      // Intentar compartir el archivo PDF generado
      await Sharing.shareAsync(pdfPath);

    } catch (error) {
      console.error("Error generando el PDF:", error);
      ToastAndroid.show('Error al generar el PDF', ToastAndroid.SHORT);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.mainContainer}>
          <TouchableOpacity style={styles.imageContainer} onPress={tomarFoto}>
            {imagenes.length > 0 ? (
              <Image source={{ uri: imagenes[0].uri }} style={styles.imagePreview} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Text style={styles.plusSign}>+</Text>
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.infoContainer}>
            <Text style={styles.label}>Fecha</Text>
            <Text style={styles.value}>{new Date().toLocaleTimeString()} {new Date().toLocaleDateString()}</Text>
            
            <Text style={styles.label}>Usuario</Text>
            <Text style={styles.value}>miguel@teintmex.com</Text>
            
            <Text style={styles.label}>Etiqueta</Text>
            <View style={styles.buttonContainer}>
              {Object.keys(etiquetas).map((item) => (
                <TouchableOpacity key={item} style={[styles.button, etiqueta === item && styles.buttonSelected]} onPress={() => handleEtiquetaChange(item)}>
                  <Text style={styles.buttonText}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <Text style={styles.label}>Prioridad</Text>
            <View style={styles.buttonContainer}>
              {['Alta', 'Media', 'Baja'].map((level) => (
                <TouchableOpacity key={level} style={[styles.button, prioridad === level && styles.buttonSelected]} onPress={() => setPrioridad(level)}>
                  <Text style={styles.buttonText}>{level}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <Text style={styles.label}>Observaciones</Text>
        <TextInput
          style={styles.textArea}
          multiline
          value={descripcion}
          onChangeText={setDescripcion}
        />

        <Text style={styles.label}>Fotos y Coordenadas:</Text>
        <View style={styles.imageSection}>
          {imagenes.length === 0 ? (
            <Text style={styles.noImagesText}>No hay fotos tomadas</Text>
          ) : (
            imagenes.map((image, index) => (
              <View key={index} style={styles.imageItem}>
                <Text style={styles.imageTitle}>Imagen {index + 1}</Text>
                <Image source={{ uri: image.uri }} style={styles.imagePreview} />
                <Text style={styles.value}>Coordenadas: {image.coordenadas}</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <View style={styles.bottomNav}>
        <TouchableOpacity><FontAwesome name="home" size={24} color="white" /></TouchableOpacity>
        <TouchableOpacity><MaterialIcons name="add-circle-outline" size={28} color="white" /></TouchableOpacity>
        <TouchableOpacity><FontAwesome name="user-circle" size={24} color="white" /></TouchableOpacity>
      </View>

      {/* Botón de Exportar PDF */}
      <TouchableOpacity
        style={styles.exportButton}
        onPress={generarPDF}
      >
        <MaterialIcons name="file-download" size={28} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#040D20' },
  content: { flex: 1, padding: 15 },
  mainContainer: { flexDirection: 'row', alignItems: 'flex-start' },
  infoContainer: { flex: 1, marginLeft: 10 },
  label: { color: 'white', fontSize: 16, fontWeight: 'bold', marginTop: 10 },
  value: { color: 'white', fontSize: 16, marginBottom: 10 },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 10 },
  button: { backgroundColor: '#253241', padding: 6, borderRadius: 10},
  buttonSelected: { backgroundColor: '#2563eb' },
  buttonText: { color: 'white', fontWeight: 'bold' },
  textArea: { backgroundColor: '#1e293b', color: 'white', padding: 10, borderRadius: 5, minHeight: 100, textAlignVertical: 'top' },
  imageContainer: { backgroundColor: '#1e293b', padding: 10, borderRadius: 5, width: 180, height: 240, alignItems: 'center', justifyContent: 'center' },
  imagePreview: { width: '100%', height: 180, borderRadius: 5 },
  imagePlaceholder: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', backgroundColor: '#253241', borderRadius: 5 },
  plusSign: { fontSize: 50, color: 'white' },
  imageSection: { marginTop: 20 },
  noImagesText: { color: 'white', textAlign: 'center', fontSize: 16 },
  imageItem: { marginBottom: 15 },
  imageTitle: { color: 'white', fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  bottomNav: { flexDirection: 'row', justifyContent: 'space-around', padding: 10, backgroundColor: '#1e293b' },
  exportButton: { position: 'absolute', right: 15, bottom: 70, backgroundColor: '#2563eb', padding: 15, borderRadius: 50 },
});
