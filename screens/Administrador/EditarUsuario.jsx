import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  LayoutAnimation,
  Modal,
  Animated,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Picker } from "@react-native-picker/picker";

import { API_URL } from "@env";

export default function EditarUsuario() {
  const route = useRoute();
  const navigation = useNavigation();
  const { usuario } = route.params;

  const [nombre, setNombre] = useState("");
  const [primerApellido, setPrimerApellido] = useState("");
  const [segundoApellido, setSegundoApellido] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState("");
  const [proyecto, setProyecto] = useState("");
  const [proyectosDisponibles, setProyectosDisponibles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Para control modal "No hiciste cambios"
  const [modalVisible, setModalVisible] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Estado para error de contraseña corta
  const [errorPass, setErrorPass] = useState(false);

  // Guardamos el estado original para comparación
  const originalData = useRef({});

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const resProyectos = await fetch(`${API_URL}/proyectos`);
        const proyectosData = await resProyectos.json();

        setProyectosDisponibles(proyectosData);

        setNombre(usuario.nombre || "");
        setPrimerApellido(usuario.primerApellido || "");
        setSegundoApellido(usuario.segundoApellido || "");
        setEmail(usuario.email || "");
        setRol(usuario.rol || "");
        setProyecto(usuario.proyectoId || "");

        originalData.current = {
          nombre: usuario.nombre || "",
          primerApellido: usuario.primerApellido || "",
          segundoApellido: usuario.segundoApellido || "",
          email: usuario.email || "",
          rol: usuario.rol || "",
          proyecto: usuario.proyectoId || "",
          password: "", // vacío, para no comparar contraseña
        };

        setLoading(false);
      } catch (error) {
        alert("Error al cargar datos");
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);

  const handleRolChange = (val) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setRol(val);
  };

  // Función para mostrar modal con fade-in
  const showModal = () => {
    setModalVisible(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  // Ocultar modal con fade-out
  const hideModal = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
    });
  };

  // Compara si hubo cambios en los campos
  const huboCambios = () => {
    return (
      nombre !== originalData.current.nombre ||
      primerApellido !== originalData.current.primerApellido ||
      segundoApellido !== originalData.current.segundoApellido ||
      email !== originalData.current.email ||
      rol !== originalData.current.rol ||
      proyecto !== originalData.current.proyecto ||
      (password && password.length > 0)
    );
  };

  const guardarCambios = async () => {
    if (!nombre || !primerApellido || !email || !rol) {
      alert("Por favor llena todos los campos obligatorios.");
      return;
    }
    if (rol !== "admin" && !proyecto) {
      alert("Por favor asigna un proyecto.");
      return;
    }

    // Validar contraseña mínimo 6 si no está vacía
    if (password && password.length > 0 && password.length < 6) {
      setErrorPass(true);
      return;
    } else {
      setErrorPass(false);
    }

    // Revisar si hubo cambios
    if (!huboCambios()) {
      showModal();
      return;
    }

    setSaving(true);

    const usuarioActualizado = {
      nombre,
      primerApellido,
      segundoApellido,
      email,
      rol,
      proyectoId: rol === "admin" ? null : proyecto,
    };
    if (password) {
      usuarioActualizado.password = password;
    }

    try {
      const response = await fetch(`${API_URL}/usuarios/${usuario._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(usuarioActualizado),
      });

      if (response.ok) {
        alert("Usuario actualizado correctamente.");
        navigation.goBack();
      } else {
        alert("No se pudo actualizar el usuario.");
      }
    } catch (error) {
      alert("Error al conectar con el servidor.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Cargando datos...</Text>
      </View>
    );
  }

  return (
    <>
      <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>Editar Usuario</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nombre*</Text>
            <TextInput
              style={styles.input}
              value={nombre}
              onChangeText={setNombre}
              placeholder="Nombre"
              placeholderTextColor="#94a3b8"
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Primer Apellido*</Text>
            <TextInput
              style={styles.input}
              value={primerApellido}
              onChangeText={setPrimerApellido}
              placeholder="Primer Apellido"
              placeholderTextColor="#94a3b8"
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Segundo Apellido</Text>
            <TextInput
              style={styles.input}
              value={segundoApellido}
              onChangeText={setSegundoApellido}
              placeholder="Segundo Apellido"
              placeholderTextColor="#94a3b8"
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Correo electrónico*</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Correo electrónico"
              placeholderTextColor="#94a3b8"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Contraseña (dejar en blanco para no cambiar)</Text>
            <TextInput
              style={[styles.input, errorPass && styles.inputError]}
              value={password}
              onChangeText={setPassword}
              placeholder="Nueva contraseña"
              placeholderTextColor="#94a3b8"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={30}
            />
            {errorPass && (
              <Text style={styles.errorText}>
                La contraseña debe tener al menos 6 caracteres.
              </Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Rol*</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={rol}
                onValueChange={handleRolChange}
                dropdownIconColor="#94a3b8"
                style={styles.picker}
              >
                <Picker.Item label="Administrador" value="admin" />
                <Picker.Item label="Jefe de Cuadrilla" value="jefe_cuadrilla" />
              </Picker>
            </View>
          </View>

          {rol !== "admin" && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Proyecto asignado*</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={proyecto}
                  onValueChange={(val) => setProyecto(val)}
                  dropdownIconColor="#94a3b8"
                  style={styles.picker}
                >
                  <Picker.Item label="Selecciona un proyecto" value="" />
                  {proyectosDisponibles.map((p) => (
                    <Picker.Item key={p._id || p.id} label={p.nombre} value={p._id || p.id} />
                  ))}
                </Picker>
              </View>
            </View>
          )}

          <TouchableOpacity
            onPress={guardarCambios}
            disabled={saving}
            style={[styles.button, saving && styles.buttonDisabled]}
            activeOpacity={0.8}
          >
            {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Guardar Cambios</Text>}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modal de confirmación "No hiciste cambios" */}
      <Modal
        transparent
        visible={modalVisible}
        animationType="none"
        onRequestClose={hideModal}
      >
        <View style={styles.modalOverlay}>
          <Animated.View style={[styles.modalContainer, { opacity: fadeAnim }]}>
            <Text style={styles.modalTitle}>No hiciste cambios</Text>
            <Text style={styles.modalMessage}>
              No detectamos cambios en el usuario. ¿Quieres regresar sin guardar?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancel]}
                onPress={hideModal}
              >
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalConfirm]}
                onPress={() => {
                  setModalVisible(false);
                  navigation.navigate("UsuariosAdmin");
                }}
              >
                <Text style={styles.modalConfirmText}>Aceptar</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  container: {
    padding: 20,
    paddingTop: 40,
    paddingBottom: 60,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#94a3b8",
    fontSize: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 30,
    color: "#e0e7ff",
    textAlign: "center",
  },
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    color: "#94a3b8",
    marginBottom: 6,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "#1f2937",
    color: "#e0e7ff",
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#4b5563",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  inputError: {
    borderColor: "#f87171", // rojo suave
    backgroundColor: "#fde8e8", // fondo rojo muy sutil
    color: "#b91c1c",
  },
  errorText: {
    color: "#b91c1c",
    fontSize: 13,
    marginTop: 4,
    marginLeft: 4,
  },
  pickerWrapper: {
    backgroundColor: "#1f2937",
    borderRadius: 6,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#4b5563",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  picker: {
    color: "#e0e7ff",
    paddingVertical: 8,
  },
  button: {
    backgroundColor: "#2563eb",
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 25,
    shadowColor: "#2563eb",
    shadowOpacity: 0.6,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 6 },
  },
  buttonDisabled: {
    backgroundColor: "#94a3b8",
  },
  buttonText: {
    color: "#f8fafc",
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },

  /* Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.75)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContainer: {
    width: "100%",
    backgroundColor: "#1e293b",
    borderRadius: 14,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.5,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#e0e7ff",
    marginBottom: 12,
    textAlign: "center",
  },
  modalMessage: {
    fontSize: 16,
    color: "#94a3b8",
    marginBottom: 20,
    textAlign: "center",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 8,
    paddingVertical: 12,
    borderRadius: 8,
  },
  modalCancel: {
    backgroundColor: "#374151",
  },
  modalCancelText: {
    color: "#94a3b8",
    fontSize: 16,
    textAlign: "center",
    fontWeight: "600",
  },
  modalConfirm: {
    backgroundColor: "#2563eb",
  },
  modalConfirmText: {
    color: "#f8fafc",
    fontSize: 16,
    textAlign: "center",
    fontWeight: "700",
  },
});
