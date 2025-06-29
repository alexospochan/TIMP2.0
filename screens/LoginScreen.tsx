import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  StyleSheet,
  Alert,
  Animated,
  ActivityIndicator,
  Platform,
  ToastAndroid,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../App";
import { FontAwesome } from "@expo/vector-icons";
import Constants from "expo-constants";
import * as Animatable from "react-native-animatable";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

const SERVER_URL =
  (Constants.expoConfig?.extra?.SERVER_URL as string) ||
  ((Constants.manifest as any)?.extra?.SERVER_URL as string);

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState(false);

  const emailAnim = useRef(new Animated.Value(1)).current;
  const passAnim = useRef(new Animated.Value(1)).current;

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleFocus = (animRef: Animated.Value) => {
    Animated.spring(animRef, {
      toValue: 1.03,
      useNativeDriver: true,
    }).start();
  };

  const handleBlur = (animRef: Animated.Value) => {
    Animated.spring(animRef, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handleLogin = async () => {
    let valid = true;

    if (!email) {
      setEmailError("El correo es obligatorio.");
      valid = false;
    } else if (!validateEmail(email)) {
      setEmailError("Ingrese un correo válido.");
      valid = false;
    } else {
      setEmailError("");
    }

    if (!password) {
      setPasswordError("La contraseña es obligatoria.");
      valid = false;
    } else if (password.length < 6) {
      setPasswordError("La contraseña debe tener al menos 6 caracteres.");
      valid = false;
    } else {
      setPasswordError("");
    }

    if (!valid) return;

    setLoading(true);

    try {
      const response = await fetch(`${SERVER_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      setLoading(false);

      console.log("Respuesta del servidor:", data);
      const rol = data.usuario?.rol?.toLowerCase().trim() || "";
      console.log("ROL recibido:", rol);

      if (response.ok) {
        const nombre = data.usuario?.nombre || "Usuario";
        await AsyncStorage.setItem("usuario", JSON.stringify(data.usuario));

        if (Platform.OS === "android") {
          ToastAndroid.show(`Iniciando sesión, ${nombre}`, ToastAndroid.SHORT);
        }

        setTimeout(() => {
          switch (rol) {
            case "admin":
              navigation.replace("BottomTabs");
              break;
            case "jefe":
            case "jefe_cuadrilla":
              navigation.replace("Mapas");
              break;
            default:
              Alert.alert("Error", `Rol no reconocido: ${rol}`);
          }
        }, 1500);
      } else {
        const message = data.message?.toLowerCase() || "";
        if (message.includes("correo")) {
          setEmailError("Correo electrónico no encontrado");
          setPasswordError("");
        } else if (message.includes("contraseña")) {
          setPasswordError("Contraseña incorrecta");
          setEmailError("");
        } else {
          Alert.alert("Error", data.message || "Error en el inicio de sesión");
          setEmailError("");
          setPasswordError("");
        }
      }
    } catch (error) {
      setLoading(false);
      Alert.alert("Error", "No se pudo conectar con el servidor");
    }
  };

  return (
    <ImageBackground source={require("../assets/cable.jpg")} style={styles.background}>
      <View style={styles.container}>
        <Animatable.Image
          animation="fadeInDown"
          duration={400}
          delay={100}
          source={require("../assets/TIMP.png")}
          style={styles.logo}
        />

        <Animatable.Text animation="fadeInDown" duration={400} delay={200} style={styles.title}>
          Iniciar Sesión
        </Animatable.Text>

        {/* Email */}
        <Animatable.View animation="fadeInUp" duration={400} delay={300} style={{ width: "85%" }}>
          <Animated.View style={{ transform: [{ scale: emailAnim }] }}>
            <View style={[styles.inputContainer, emailError ? styles.errorInputContainer : null]}>
              <FontAwesome name="envelope" size={18} color="#fff" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Correo electrónico"
                placeholderTextColor="#fff"
                onFocus={() => handleFocus(emailAnim)}
                onBlur={() => handleBlur(emailAnim)}
                onChangeText={(text) => {
                  setEmail(text);
                  setEmailError("");
                }}
                value={email}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {emailError ? <FontAwesome name="exclamation-circle" size={18} color="red" /> : null}
            </View>
          </Animated.View>
        </Animatable.View>
        {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

        {/* Password */}
        <Animatable.View animation="fadeInUp" duration={400} delay={400} style={{ width: "85%" }}>
          <Animated.View style={{ transform: [{ scale: passAnim }] }}>
            <View
              style={[styles.inputContainer, passwordError ? styles.errorInputContainer : null]}
            >
              <FontAwesome name="lock" size={20} color="#fff" style={styles.icon} />
              <TextInput
                style={styles.passwordInput}
                placeholder="Contraseña"
                placeholderTextColor="#fff"
                secureTextEntry={!showPassword}
                onFocus={() => handleFocus(passAnim)}
                onBlur={() => handleBlur(passAnim)}
                onChangeText={(text) => {
                  setPassword(text);
                  setPasswordError("");
                }}
                value={password}
              />
              <TouchableOpacity style={styles.eyeIcon} onPress={togglePasswordVisibility}>
                <FontAwesome name={showPassword ? "eye-slash" : "eye"} size={20} color="#fff" />
              </TouchableOpacity>
              {passwordError ? <FontAwesome name="exclamation-circle" size={18} color="red" /> : null}
            </View>
          </Animated.View>
        </Animatable.View>
        {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

        {/* Botones */}
        {loading ? (
          <ActivityIndicator size="large" color="#1e90ff" style={{ marginTop: 20 }} />
        ) : (
          <>
            <Animatable.View animation="fadeInUp" duration={400} delay={500} style={{ width: "85%" }}>
              <TouchableOpacity style={styles.button} onPress={handleLogin}>
                <FontAwesome name="sign-in" size={18} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.buttonText}>Iniciar sesión</Text>
              </TouchableOpacity>
            </Animatable.View>

            <Animatable.View animation="fadeInUp" duration={400} delay={600} style={{ width: "85%" }}>
              <TouchableOpacity
                style={styles.button}
                onPress={() => navigation.navigate("Registro")}
              >
                <FontAwesome name="user-plus" size={18} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.buttonText}>Registrarse</Text>
              </TouchableOpacity>
            </Animatable.View>
          </>
        )}
      </View>
    </ImageBackground>
  );
};

export default LoginScreen;

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
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    padding: 20,
  },
  logo: {
    width: 160,
    height: 100,
    resizeMode: "contain",
    marginBottom: 10,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 30,
    textShadowColor: "#000",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
    minHeight: 55,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  errorInputContainer: {
    borderWidth: 1.5,
    borderColor: "red",
    backgroundColor: "rgba(255, 0, 0, 0.15)",
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 14,
    color: "#fff",
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 14,
    paddingRight: 50,
    color: "#fff",
  },
  eyeIcon: {
    position: "absolute",
    right: 10,
    top: "50%",
    transform: [{ translateY: -12 }],
    padding: 5,
    zIndex: 1,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    paddingVertical: 16,
    backgroundColor: "#1e90ff",
    borderRadius: 12,
    marginTop: 15,
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  errorText: {
    color: "red",
    fontSize: 14,
    marginBottom: 6,
    alignSelf: "flex-start",
    marginLeft: "8%",
  },
});
