import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import * as Animatable from "react-native-animatable";
import { FontAwesome } from "@expo/vector-icons";

const RegistroScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert("Error", "Por favor, completa todos los campos.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://192.168.30.94:3000/usuarios/registrar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Éxito", "Usuario registrado correctamente.");
        navigation.navigate("Login");
      } else {
        Alert.alert("Error", data.message || "Error al registrar usuario.");
      }
    } catch (error) {
      Alert.alert("Error", "No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground source={require("../assets/prueba2.jpg")} style={styles.background}>
      <View style={styles.container}>
        <Animatable.Text animation="fadeInDown" style={styles.title}>
          Registrarse
        </Animatable.Text>

        <Animatable.View animation="fadeInUp" duration={600} style={styles.inputContainer}>
          <FontAwesome name="envelope" size={20} color="#fff" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Correo electrónico"
            placeholderTextColor="#ccc"
            keyboardType="email-address"
            autoCapitalize="none"
            onChangeText={setEmail}
            value={email}
          />
        </Animatable.View>

        <Animatable.View animation="fadeInUp" delay={100} style={styles.inputContainer}>
          <FontAwesome name="lock" size={20} color="#fff" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            placeholderTextColor="#ccc"
            secureTextEntry
            onChangeText={setPassword}
            value={password}
          />
        </Animatable.View>

        <Animatable.View animation="fadeInUp" delay={200} style={styles.inputContainer}>
          <FontAwesome name="lock" size={20} color="#fff" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Confirmar contraseña"
            placeholderTextColor="#ccc"
            secureTextEntry
            onChangeText={setConfirmPassword}
            value={confirmPassword}
          />
        </Animatable.View>

        <TouchableOpacity
          style={styles.button}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Registrarse</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.buttonSecondary}
          onPress={() => navigation.navigate("Login")}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Volver al Login</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 30,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 30,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 45,
    color: "#fff",
  },
  button: {
    backgroundColor: "#007bff",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    marginTop: 10,
  },
  buttonSecondary: {
    backgroundColor: "#6c757d",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default RegistroScreen;
