import React, { useState } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ImageBackground, 
  StyleSheet,
  Alert,
  ActivityIndicator
} from "react-native";

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
      const response = await fetch("http://192.168.138.158:3000/registro", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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
    <ImageBackground 
      source={require("../assets/prueba2.jpg")} 
      style={styles.background}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Registrarse</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Correo electrónico"
          placeholderTextColor="#fff"
          keyboardType="email-address"
          autoCapitalize="none"
          onChangeText={setEmail}
          value={email}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          placeholderTextColor="#fff"
          secureTextEntry
          onChangeText={setPassword}
          value={password}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Confirmar contraseña"
          placeholderTextColor="#fff"
          secureTextEntry
          onChangeText={setConfirmPassword}
          value={confirmPassword}
        />
        
        <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Registrarse</Text>}
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
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", 
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 20,
  },
  input: {
    width: "80%",
    padding: 10,
    borderWidth: 1,
    borderColor: "#fff",
    color: "#fff",
    marginBottom: 10,
    borderRadius: 5,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  button: {
    width: "80%",
    padding: 12,
    backgroundColor: "#007bff",
    alignItems: "center",
    borderRadius: 5,
    marginTop: 10,
  },
  buttonSecondary: {
    width: "80%",
    padding: 12,
    backgroundColor: "#6c757d",
    alignItems: "center",
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default RegistroScreen;
