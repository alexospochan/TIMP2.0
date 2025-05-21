import { auth } from "./firebaseConfig";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";

// Función para registrar un usuario
export const registerUser = async (email: string, password: string) => {
  try {
    await createUserWithEmailAndPassword(auth, email, password);
    alert("Usuario registrado con éxito");
  } catch (error: any) {
    alert("Error al registrar: " + error.message);
  }
};

// Función para iniciar sesión
export const loginUser = async (email: string, password: string) => {
  try {
    await signInWithEmailAndPassword(auth, email, password);
    alert("Inicio de sesión exitoso");
    
  } catch (error: any) {
    alert("Error al iniciar sesión: " + error.message);
  }
};

// Función para cerrar sesión
export const logoutUser = async () => {
  try {
    await signOut(auth);
    alert("Sesión cerrada");
  } catch (error: any) {
    alert("Error al cerrar sesión: " + error.message);
  }
};
