import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  ScrollView, KeyboardAvoidingView, Platform, Dimensions, ActivityIndicator,
  Keyboard, TouchableWithoutFeedback 
} from 'react-native';

const { width } = Dimensions.get('window');

async function obtenerCoordenadas(ciudad) {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(ciudad)}`);
    const data = await response.json();
    if (data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon),
      };
    } else {
      return null;
    }
  } catch (error) {
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
        if (!nombre.trim()) return 'El nombre del proyecto es obligatorio';
        return '';
      case 'kmInicio':
        if (!kmInicio.trim()) return 'Kilómetro inicio es obligatorio';
        if (isNaN(kmInicio)) return 'Kilómetro inicio debe ser un número';
        return '';
      case 'kmFinal':
        if (!kmFinal.trim()) return 'Kilómetro final es obligatorio';
        if (isNaN(kmFinal)) return 'Kilómetro final debe ser un número';
        return '';
      case 'manager':
        if (!manager.trim()) return 'El nombre del project manager es obligatorio';
        return '';
      case 'ciudadInicio':
        if (!ciudadInicio.trim()) return 'La ciudad inicial es obligatoria';
        return '';
      case 'ciudadFinal':
        if (!ciudadFinal.trim()) return 'La ciudad final es obligatoria';
        return '';
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
    return !Object.values(nuevosErrores).some(msg => msg.length > 0);
  };

  const onCancelar = () => navigation.goBack();

  const onCrear = async () => {
    if (!validarTodo()) return;

    setIsLoading(true);

    const inicioCoords = await obtenerCoordenadas(ciudadInicio);
    const finalCoords = await obtenerCoordenadas(ciudadFinal);

    if (!inicioCoords || !finalCoords) {
      alert("No se pudieron obtener las coordenadas para las ciudades proporcionadas.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("http://192.168.73.158:3000/proyectos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
        const errorData = await response.json();
        alert("Error al crear proyecto: " + (errorData.message || "Error desconocido"));
        setIsLoading(false);
        return;
      }

      const createdProject = await response.json();
      alert(`Proyecto creado: ${createdProject.nombre}`);
      setIsLoading(false);
      navigation.navigate('BottomTabs', { recargar: true });
    } catch (error) {
      alert("Error de conexión con el servidor");
      setIsLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
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
              onBlur={() => {
                const err = validateField('nombre');
                setErrors({ ...errors, nombre: err });
              }}
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
                  onBlur={() => {
                    const err = validateField('kmInicio');
                    setErrors({ ...errors, kmInicio: err });
                  }}
                  placeholderTextColor="#94A3B8"
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
                  onBlur={() => {
                    const err = validateField('kmFinal');
                    setErrors({ ...errors, kmFinal: err });
                  }}
                  placeholderTextColor="#94A3B8"
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
              onBlur={() => {
                const err = validateField('manager');
                setErrors({ ...errors, manager: err });
              }}
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
                  onBlur={() => {
                    const err = validateField('ciudadInicio');
                    setErrors({ ...errors, ciudadInicio: err });
                  }}
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
                  onBlur={() => {
                    const err = validateField('ciudadFinal');
                    setErrors({ ...errors, ciudadFinal: err });
                  }}
                />
                {!!errors.ciudadFinal && <Text style={styles.errorText}>{errors.ciudadFinal}</Text>}
              </View>
            </View>

            <TextInput
              style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
              placeholder="Descripción"
              placeholderTextColor="#94A3B8"
              multiline={true}
              numberOfLines={4}
              value={descripcion}
              onChangeText={setDescripcion}
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
