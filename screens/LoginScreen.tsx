import React, { useState } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ImageBackground, 
  Image,
  StyleSheet
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../App";
import { FontAwesome } from '@expo/vector-icons';   


type Props = NativeStackScreenProps<RootStackParamList, "Login">;

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); 
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = () => {
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

    if (valid) {
      navigation.navigate("Mapas");
    }
  };

  return (
    <ImageBackground 
      source={require("../assets/cable.jpg")} 
      style={styles.background}
    >
      <View style={styles.container}>
        
        <Image source={require("../assets/TIMP.png")} style={styles.logo} />
        
        <Text style={styles.title}>Iniciar Sesión</Text>
        
        <TextInput
          style={[styles.input, emailError ? styles.errorInput : null]}
          placeholder="Correo electrónico"
          placeholderTextColor="#fff"
          onChangeText={text => {
            setEmail(text);
            setEmailError("");
          }}
          value={email}
        />
        {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
        
        <View style={styles.passwordContainer}>
          <TextInput
            style={[styles.passwordInput, passwordError ? styles.errorInput : null]} 
            placeholder="Contraseña"
            placeholderTextColor="#fff"
            secureTextEntry={!showPassword} 
            onChangeText={text => {
              setPassword(text);
              setPasswordError("");
            }}
            value={password}
          />
          <TouchableOpacity 
            style={styles.eyeIcon}
            onPress={togglePasswordVisibility}
          >
            <FontAwesome name={showPassword ? "eye-slash" : "eye"} size={20} color="#fff" />
          </TouchableOpacity>
        </View>
        {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
        
        <TouchableOpacity 
          style={styles.button}
          onPress={handleLogin}
        >
          <Text style={styles.buttonText}>Iniciar sesión</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.button} 
          onPress={() => navigation.navigate("Registro")} 
        >
          <Text style={styles.buttonText}>Registrarse</Text>
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
  logo: {
    width: 160,
    height: 100,
    resizeMode: "contain",
    marginBottom: 10,
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
  passwordContainer: {
    position: "relative",
    width: "80%",
  },
  passwordInput: {
    paddingRight: 40, 
    paddingLeft: 10,
    width: "100%",
    padding: 10,
    borderWidth: 1,
    borderColor: "#fff",
    color: "#fff",
    marginBottom: 10,
    borderRadius: 5,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  eyeIcon: {
    position: "absolute",
    right: 10,
    top: 12,
    padding: 5,
    zIndex: 1, 
  },
  button: {
    width: "80%",
    padding: 12,
    backgroundColor: "#007bff",
    alignItems: "center",
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  errorInput: {
    borderColor: "red",
  },
  errorText: {
    color: "red",
    fontSize: 14,
    marginBottom: 5,
  },
});

export default LoginScreen;
