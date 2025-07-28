import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  // Carga usuario guardado en AsyncStorage al iniciar app
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('userInfo');
        if (storedUser) {
          setUserInfo(JSON.parse(storedUser));
        }
      } catch (e) {
        console.log('Error loading user:', e);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  // Función para hacer login (guardar usuario)
  const login = async (user) => {
    setUserInfo(user);
    await AsyncStorage.setItem('userInfo', JSON.stringify(user));
  };

  // Función para hacer logout (limpiar usuario)
  const logout = async () => {
    setUserInfo(null);
    await AsyncStorage.removeItem('userInfo');
  };

  // isLoggedIn: true si hay userInfo
  const isLoggedIn = !!userInfo;

  return (
    <AuthContext.Provider value={{ userInfo, isLoggedIn, loading, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
