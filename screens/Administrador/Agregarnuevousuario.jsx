import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Platform,
  Animated,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import Icon from "react-native-vector-icons/FontAwesome";
import { useNavigation } from "@react-navigation/native";

const AnimatedIcon = ({ name, color }) => {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [scale]);

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Icon name={name} size={22} color={color} />
    </Animated.View>
  );
};

const AgregarNuevoUsuario = () => {
  const navigation = useNavigation();

  const [nombre, setNombre] = useState("");
  const [primerApellido, setPrimerApellido] = useState("");
  const [segundoApellido, setSegundoApellido] = useState("");
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState("");
  const [rolSeleccionado, setRolSeleccionado] = useState("");
  const [proyectos, setProyectos] = useState([]);

  useEffect(() => {
    fetch("http://192.168.30.94:3000/proyectos")
      .then((res) => res.json())
      .then((data) => setProyectos(data))
      .catch(() =>
        Alert.alert("Error", "No se pudieron cargar los proyectos")
      );
  }, []);

  const crearUsuario = () => {
    if (
      !nombre ||
      !primerApellido ||
      !correo ||
      !contrasena ||
      !rolSeleccionado ||
      (rolSeleccionado === "jefe_cuadrilla" && !proyectoSeleccionado)
    ) {
      Alert.alert(
        "Error",
        "Por favor completa todos los campos obligatorios. El proyecto es obligatorio solo para Jefe de Cuadrilla."
      );
      return;
    }

    const nuevoUsuario = {
      nombre,
      primerApellido,
      segundoApellido,
      email: correo,
      password: contrasena,
      rol: rolSeleccionado,
      proyectoId: proyectoSeleccionado,
    };

    fetch("http://192.168.30.94:3000/usuarios/registrar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nuevoUsuario),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Error al crear usuario");
        return res.json();
      })
      .then(() => {
        Alert.alert(
          "Éxito",
          "Usuario creado correctamente",
          [
            {
              text: "OK",
              onPress: () => navigation.navigate("Usuarios"),
            },
          ],
          { cancelable: false }
        );

        // Limpiar campos después de éxito
        setNombre("");
        setPrimerApellido("");
        setSegundoApellido("");
        setCorreo("");
        setContrasena("");
        setProyectoSeleccionado("");
        setRolSeleccionado("");
      })
      .catch(() => Alert.alert("Error", "No se pudo crear el usuario"));
  };

  const renderInput = (
    iconName,
    placeholder,
    value,
    setValue,
    secure = false,
    keyboardType = "default"
  ) => (
    <View style={styles.inputGroup}>
      <AnimatedIcon name={iconName} color="#38bdf8" />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#94a3b8"
        value={value}
        onChangeText={setValue}
        secureTextEntry={secure}
        keyboardType={keyboardType}
        autoCapitalize="none"
        autoCorrect={false}
      />
    </View>
  );

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Registrar Nuevo Usuario</Text>

      {renderInput("user", "Nombre*", nombre, setNombre)}
      {renderInput("id-badge", "Primer Apellido*", primerApellido, setPrimerApellido)}
      {renderInput("id-badge", "Segundo Apellido", segundoApellido, setSegundoApellido)}
      {renderInput("envelope", "Correo Electrónico*", correo, setCorreo, false, "email-address")}
      {renderInput("lock", "Contraseña*", contrasena, setContrasena, true)}

      <Text style={styles.label}>Rol Asignado*</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={rolSeleccionado}
          onValueChange={setRolSeleccionado}
          style={styles.picker}
        >
          <Picker.Item label="Selecciona un rol..." value="" />
          <Picker.Item label="Administrador" value="admin" />
          <Picker.Item label="Jefe de Cuadrilla" value="jefe_cuadrilla" />
        </Picker>
      </View>

      {rolSeleccionado === "jefe_cuadrilla" && (
        <>
          <Text style={styles.label}>Proyecto Asignado*</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={proyectoSeleccionado}
              onValueChange={setProyectoSeleccionado}
              style={styles.picker}
            >
              <Picker.Item label="Selecciona un proyecto..." value="" />
              {proyectos.map((proy) => (
                <Picker.Item
                  key={proy._id || proy.id}
                  label={proy.nombre}
                  value={proy._id || proy.id}
                />
              ))}
            </Picker>
          </View>
        </>
      )}

      <TouchableOpacity style={styles.boton} onPress={crearUsuario}>
        <Text style={styles.textBoton}>Registrar Usuario</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default AgregarNuevoUsuario;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#0f172a",
    paddingHorizontal: 24,
    paddingTop: 50,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    color: "#38bdf8",
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 30,
    letterSpacing: 0.8,
  },
  label: {
    color: "#cbd5e1",
    fontSize: 16,
    marginBottom: 8,
    marginTop: 16,
    fontWeight: "600",
  },
  inputGroup: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1e293b",
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: Platform.OS === "ios" ? 15 : 12,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
    marginLeft: 12,
  },
  pickerContainer: {
    backgroundColor: "#1e293b",
    borderRadius: 12,
  },
  picker: {
    color: "#fff",
  },
  boton: {
    backgroundColor: "#2563eb",
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 30,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  textBoton: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
  },
});
