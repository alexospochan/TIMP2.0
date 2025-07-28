import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  Dimensions,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { FontAwesome } from "@expo/vector-icons";
import * as Animatable from "react-native-animatable";
import * as ImagePicker from "expo-image-picker";

const { width } = Dimensions.get("window");

const PerfilScreen = () => {
  const [nombreCompleto, setNombreCompleto] = useState("");
  const [correo, setCorreo] = useState("");
  const [rol, setRol] = useState("");
  const [mostrarModal, setMostrarModal] = useState(false);
  const [imagenPerfil, setImagenPerfil] = useState(null);

  const navigation = useNavigation();

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const userData = await AsyncStorage.getItem("userInfo");
        console.log("userData raw en PerfilScreen:", userData);

        if (userData) {
          const user = JSON.parse(userData);
          console.log("user parseado en PerfilScreen:", user);

          setNombreCompleto(user.nombre || "Nombre no disponible");
          setCorreo(user.email || "Correo no disponible");
          setRol(user.rol || "Rol no disponible");

          const imgGuardada = await AsyncStorage.getItem(`fotoPerfil_${user.email}`);
          console.log("Imagen guardada:", imgGuardada);
          if (imgGuardada) setImagenPerfil(imgGuardada);
        } else {
          console.log("No hay userInfo en AsyncStorage");
        }
      } catch (error) {
        console.error("Error al cargar datos:", error);
      }
    };

    cargarDatos();
  }, []);

  const obtenerNombreRol = () => {
    if (rol === "admin") return "Administrador";
    if (rol === "jefe" || rol === "jefe_cuadrilla") return "Jefe de Cuadrilla";
    return rol;
  };

  const cerrarSesion = async () => {
    await AsyncStorage.removeItem("userInfo");
    navigation.reset({
      index: 0,
      routes: [{ name: "Login" }],
    });
  };

  const seleccionarImagen = async () => {
  try {
    // Pedir permisos para acceder a la galería
    const permisoResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permisoResult.status !== "granted") {
      alert("Se necesitan permisos para acceder a la galería de fotos");
      return;
    }

    // Abrir selector de imagen
    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1], // imagen cuadrada
      quality: 0.7,
    });

    if (!resultado.canceled && resultado.assets?.[0]?.uri) {
      const uri = resultado.assets[0].uri;
      await AsyncStorage.setItem(`fotoPerfil_${correo}`, uri);
      setImagenPerfil(uri);
    }
  } catch (error) {
    console.error("Error al seleccionar imagen:", error);
  }
};


  return (
    <View style={styles.container}>
      {/* Sección perfil */}
      <View style={styles.profileSection}>
        <TouchableOpacity onPress={seleccionarImagen}>
          <Image
            source={
              imagenPerfil
                ? { uri: imagenPerfil }
                : require("../../assets/cable.jpg") // Cambia por tu imagen local
            }
            style={styles.avatar}
          />
        </TouchableOpacity>

        <View style={styles.infoContainer}>
          <View style={styles.infoRow}>
            <FontAwesome name="user" size={18} color="#38bdf8" />
            <Text style={styles.infoText}>{nombreCompleto}</Text>
          </View>
          <View style={styles.infoRow}>
            <FontAwesome name="id-badge" size={18} color="#38bdf8" />
            <Text style={styles.infoText}>{obtenerNombreRol()}</Text>
          </View>
        </View>
      </View>

      {/* Correo */}
      <View style={styles.centerEmail}>
        <FontAwesome name="envelope" size={18} color="#38bdf8" />
        <Text style={styles.email}>{correo}</Text>
      </View>

      {/* Botones */}
      <View style={styles.buttonsContainer}>
        {rol === "admin" && (
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate("Usuarios")}
          >
            <FontAwesome name="users" size={16} color="#fff" />
            <Text style={styles.buttonText}>Usuarios</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.button, { backgroundColor: "#dc2626" }]}
          onPress={() => setMostrarModal(true)}
        >
          <FontAwesome name="sign-out" size={16} color="#fff" />
          <Text style={styles.buttonText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </View>

      {/* Modal Confirmación */}
      <Modal transparent animationType="fade" visible={mostrarModal}>
        <View style={styles.modalBackground}>
          <Animatable.View animation="fadeInUp" style={styles.modalContainer}>
            <Text style={styles.modalTitle}>¿Deseas cerrar sesión?</Text>
            <Text style={styles.modalMessage}>
              Esta acción cerrará tu sesión actual. ¿Estás seguro?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setMostrarModal(false)}
              >
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.logoutButton]}
                onPress={cerrarSesion}
              >
                <Text style={styles.logoutText}>Cerrar sesión</Text>
              </TouchableOpacity>
            </View>
          </Animatable.View>
        </View>
      </Modal>
    </View>
  );
};

export default PerfilScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
    padding: 20,
    justifyContent: "space-evenly",
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1e293b",
    borderRadius: 16,
    padding: 20,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    marginRight: 20,
    backgroundColor: "#64748b",
  },
  infoContainer: {
    flex: 1,
    justifyContent: "center",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  infoText: {
    color: "#fff",
    fontSize: 16,
    marginLeft: 10,
  },
  centerEmail: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    gap: 6,
  },
  email: {
    color: "#fff",
    fontSize: 16,
    marginLeft: 8,
  },
  buttonsContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#334155",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginBottom: 15,
    width: "80%",
    justifyContent: "center",
    gap: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: width * 0.85,
    backgroundColor: "#f8fafc",
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
    elevation: 6,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 8,
  },
  modalMessage: {
    color: "#475569",
    fontSize: 15,
    textAlign: "center",
    marginBottom: 25,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    marginHorizontal: 5,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#e2e8f0",
  },
  logoutButton: {
    backgroundColor: "#dc2626",
  },
  cancelText: {
    color: "#0f172a",
    fontWeight: "600",
  },
  logoutText: {
    color: "#fff",
    fontWeight: "600",
  },
});
