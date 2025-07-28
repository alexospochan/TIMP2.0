import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback,
  Alert,
} from 'react-native';
import { API_URL } from '@env';

const { width } = Dimensions.get('window');

async function obtenerCoordenadas(ciudad) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(ciudad)}`
    );
    const data = await response.json();
    if (data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon),
      };
    }
    return null;
  } catch (error) {
    console.error('Error obteniendo coordenadas:', error);
    return null;
  }
}

export default function AgregarProyecto({ navigation }) {
  const [nombre, setNombre] = useState('');
  const [kmInicio, setKmInicio] = useState('');
  const [kmFinal, setKmFinal] = useState('');
  const [manager, setManager] = useState('');
  const [ciudadInicio, setCiudadInicio] = useState('');
  const [ciudadFinal, setCiudadFinal] = useState('');
  const [descripcion, setDescripcion] = useState('');

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validateField = (field) => {
    switch (field) {
      case 'nombre':
        return !nombre.trim() ? 'El nombre del proyecto es obligatorio' : '';
      case 'kmInicio':
        return !kmInicio.trim()
          ? 'Kilómetro inicio es obligatorio'
          : isNaN(kmInicio)
          ? 'Debe ser un número'
          : '';
      case 'kmFinal':
        return !kmFinal.trim()
          ? 'Kilómetro final es obligatorio'
          : isNaN(kmFinal)
          ? 'Debe ser un número'
          : '';
      case 'manager':
        return !manager.trim() ? 'El nombre del project manager es obligatorio' : '';
      case 'ciudadInicio':
        return !ciudadInicio.trim() ? 'La ciudad inicial es obligatoria' : '';
      case 'ciudadFinal':
        return !ciudadFinal.trim() ? 'La ciudad final es obligatoria' : '';
      default:
        return '';
    }
  };

  const validarTodo = () => {
    const nuevosErrores = {
      nombre: validateField('nombre'),
      kmInicio: validateField('kmInicio'),
      kmFinal: validateField('kmFinal'),
      manager: validateField('manager'),
      ciudadInicio: validateField('ciudadInicio'),
      ciudadFinal: validateField('ciudadFinal'),
    };
    setErrors(nuevosErrores);
    return !Object.values(nuevosErrores).some((msg) => msg.length > 0);
  };

  const onCancelar = () => navigation.goBack();

  const onCrear = async () => {
    if (!validarTodo()) return;

    setIsLoading(true);

    const inicioCoords = await obtenerCoordenadas(ciudadInicio);
    const finalCoords = await obtenerCoordenadas(ciudadFinal);

    if (!inicioCoords || !finalCoords) {
      Alert.alert(
        'Error',
        'No se pudieron obtener las coordenadas para las ciudades proporcionadas.'
      );
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/proyectos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre,
          kmInicio: Number(kmInicio),
          kmFinal: Number(kmFinal),
          manager,
          ciudadInicio,
          ciudadFinal,
          descripcion,
          latInicio: inicioCoords.lat,
          lonInicio: inicioCoords.lon,
          latFinal: finalCoords.lat,
          lonFinal: finalCoords.lon,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        Alert.alert('Error', 'Error al crear proyecto: ' + (errorData.message || 'Error desconocido'));
        setIsLoading(false);
        return;
      }

      const createdProject = await response.json();
      Alert.alert('Éxito', `Proyecto creado: ${createdProject.nombre}`, [
        {
          text: 'Aceptar',
          onPress: () => navigation.navigate('BottomTabs', { recargar: true }),
        },
      ]);
    } catch (error) {
      console.error('Error fetch:', error);
      Alert.alert('Error', 'Error de conexión con el servidor');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.outerContainer}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
          <View style={styles.formContainer}>
            <Text style={styles.title}>Agregar Nuevo Proyecto</Text>

            <TextInput
              style={styles.input}
              placeholder="Nombre del proyecto"
              placeholderTextColor="#94A3B8"
              value={nombre}
              onChangeText={(text) => {
                setNombre(text);
                if (errors.nombre) setErrors({ ...errors, nombre: '' });
              }}
              onBlur={() => setErrors({ ...errors, nombre: validateField('nombre') })}
              editable={!isLoading}
            />
            {!!errors.nombre && <Text style={styles.errorText}>{errors.nombre}</Text>}

            <View style={styles.row}>
              <View style={styles.halfInputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Km inicio"
                  keyboardType="numeric"
                  value={kmInicio}
                  onChangeText={(text) => {
                    setKmInicio(text);
                    if (errors.kmInicio) setErrors({ ...errors, kmInicio: '' });
                  }}
                  onBlur={() => setErrors({ ...errors, kmInicio: validateField('kmInicio') })}
                  placeholderTextColor="#94A3B8"
                  editable={!isLoading}
                />
                {!!errors.kmInicio && <Text style={styles.errorText}>{errors.kmInicio}</Text>}
              </View>

              <View style={styles.halfInputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Km final"
                  keyboardType="numeric"
                  value={kmFinal}
                  onChangeText={(text) => {
                    setKmFinal(text);
                    if (errors.kmFinal) setErrors({ ...errors, kmFinal: '' });
                  }}
                  onBlur={() => setErrors({ ...errors, kmFinal: validateField('kmFinal') })}
                  placeholderTextColor="#94A3B8"
                  editable={!isLoading}
                />
                {!!errors.kmFinal && <Text style={styles.errorText}>{errors.kmFinal}</Text>}
              </View>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Nombre del project manager"
              placeholderTextColor="#94A3B8"
              value={manager}
              onChangeText={(text) => {
                setManager(text);
                if (errors.manager) setErrors({ ...errors, manager: '' });
              }}
              onBlur={() => setErrors({ ...errors, manager: validateField('manager') })}
              editable={!isLoading}
            />
            {!!errors.manager && <Text style={styles.errorText}>{errors.manager}</Text>}

            <View style={styles.row}>
              <View style={styles.halfInputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Ciudad inicial"
                  placeholderTextColor="#94A3B8"
                  value={ciudadInicio}
                  onChangeText={(text) => {
                    setCiudadInicio(text);
                    if (errors.ciudadInicio) setErrors({ ...errors, ciudadInicio: '' });
                  }}
                  onBlur={() => setErrors({ ...errors, ciudadInicio: validateField('ciudadInicio') })}
                  editable={!isLoading}
                />
                {!!errors.ciudadInicio && <Text style={styles.errorText}>{errors.ciudadInicio}</Text>}
              </View>

              <View style={styles.halfInputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Ciudad final"
                  placeholderTextColor="#94A3B8"
                  value={ciudadFinal}
                  onChangeText={(text) => {
                    setCiudadFinal(text);
                    if (errors.ciudadFinal) setErrors({ ...errors, ciudadFinal: '' });
                  }}
                  onBlur={() => setErrors({ ...errors, ciudadFinal: validateField('ciudadFinal') })}
                  editable={!isLoading}
                />
                {!!errors.ciudadFinal && <Text style={styles.errorText}>{errors.ciudadFinal}</Text>}
              </View>
            </View>

            <TextInput
              style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
              placeholder="Descripción"
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={4}
              value={descripcion}
              onChangeText={setDescripcion}
              editable={!isLoading}
            />

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={onCancelar}
                disabled={isLoading}
              >
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.createButton, isLoading && styles.disabledButton]}
                onPress={onCrear}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <ActivityIndicator size="small" color="white" />
                    <Text style={[styles.buttonText, { marginLeft: 10 }]}>Creando...</Text>
                  </>
                ) : (
                  <Text style={styles.buttonText}>Crear</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  formContainer: {
    backgroundColor: 'rgba(30, 41, 59, 0.95)',
    borderRadius: 20,
    padding: 30,
    width: width * 0.9,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 15,
    elevation: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#1E293B',
    color: 'white',
    fontSize: 16,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 10,
    fontWeight: '500',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInputContainer: {
    flex: 1,
    marginHorizontal: 6,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '600',
    marginTop: -8,
    marginBottom: 8,
    marginLeft: 6,
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 25,
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 15,
    alignItems: 'center',
    marginHorizontal: 8,
    shadowColor: '#00000070',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#64748B',
  },
  createButton: {
    backgroundColor: '#3B82F6',
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 18,
  },
});
