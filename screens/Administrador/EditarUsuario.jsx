import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Picker } from "@react-native-picker/picker"; // npm install @react-native-picker/picker

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

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const resProyectos = await fetch("http://192.168.73.158:3000/proyectos");
        const proyectosData = await resProyectos.json();

        setProyectosDisponibles(proyectosData);

        setNombre(usuario.nombre || "");
        setPrimerApellido(usuario.primerApellido || "");
        setSegundoApellido(usuario.segundoApellido || "");
        setEmail(usuario.email || "");
        setRol(usuario.rol || "");
        setProyecto(usuario.proyectoId || "");

        setLoading(false);
      } catch (error) {
        Alert.alert("Error", "No se pudieron cargar los datos del usuario o proyectos.");
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);

  const guardarCambios = async () => {
    if (!nombre || !primerApellido || !email || !rol) {
      Alert.alert("Error", "Por favor llena todos los campos obligatorios.");
      return;
    }
    if (rol !== "admin" && !proyecto) {
      Alert.alert("Error", "Por favor asigna un proyecto.");
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
      const response = await fetch(`http://192.168.73.158:3000/usuarios/${usuario._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(usuarioActualizado),
      });

      if (response.ok) {
        Alert.alert("Éxito", "Usuario actualizado correctamente.");
        navigation.goBack();
      } else {
        Alert.alert("Error", "No se pudo actualizar el usuario.");
      }
    } catch (error) {
      Alert.alert("Error", "Error al conectar con el servidor.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#38bdf8" />
        <Text style={{ color: "#fff", marginTop: 10 }}>Cargando datos...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#0f172a" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Editar Usuario</Text>

        <Text style={styles.label}>Nombre*</Text>
        <TextInput
          style={styles.input}
          value={nombre}
          onChangeText={setNombre}
          placeholder="Nombre"
          placeholderTextColor="#94a3b8"
        />

        <Text style={styles.label}>Primer Apellido*</Text>
        <TextInput
          style={styles.input}
          value={primerApellido}
          onChangeText={setPrimerApellido}
          placeholder="Primer Apellido"
          placeholderTextColor="#94a3b8"
        />

        <Text style={styles.label}>Segundo Apellido</Text>
        <TextInput
          style={styles.input}
          value={segundoApellido}
          onChangeText={setSegundoApellido}
          placeholder="Segundo Apellido"
          placeholderTextColor="#94a3b8"
        />

        <Text style={styles.label}>Correo electrónico*</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Correo electrónico"
          placeholderTextColor="#94a3b8"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Contraseña (dejar en blanco para no cambiar)</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="Nueva contraseña"
          placeholderTextColor="#94a3b8"
          secureTextEntry
          autoCapitalize="none"
        />

        <Text style={styles.label}>Rol*</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={rol}
            onValueChange={(val) => setRol(val)}
            dropdownIconColor="#94a3b8"
            style={styles.picker}
          >
            <Picker.Item label="Administrador" value="admin" />
            <Picker.Item label="Jefe de Cuadrilla" value="jefe_cuadrilla" />
          </Picker>
        </View>

        {rol !== "admin" && (
          <>
            <Text style={styles.label}>Proyecto asignado*</Text>
            <View style={styles.pickerContainer}>
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
          </>
        )}

        <View style={{ marginTop: 20 }}>
          <Button
            title={saving ? "Guardando..." : "Guardar Cambios"}
            onPress={guardarCambios}
            disabled={saving}
            color="#1e40af"
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 40, // espacio arriba para que no pegue al borde
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#f8fafc",
    textAlign: "center",
  },
  label: {
    color: "#94a3b8",
    marginBottom: 6,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "#1e293b",
    color: "#f8fafc",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  pickerContainer: {
    backgroundColor: "#1e293b",
    borderRadius: 6,
    marginBottom: 15,
  },
  picker: {
    color: "#f8fafc",
  },
});
