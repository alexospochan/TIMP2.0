import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  Alert,
  LayoutAnimation,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { useNavigation, useFocusEffect, useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { API_URL } from "@env";

const UsuariosAdmin = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [usuarioLogueado, setUsuarioLogueado] = useState(null);

  const navigation = useNavigation();
  const route = useRoute();

  // Mostrar alerta cuando se regresa de editar con éxito
  useFocusEffect(
    useCallback(() => {
      if (route.params?.updated) {
        Alert.alert("Éxito", "Usuario actualizado correctamente.");
        // Opcional: limpiar el parámetro para no mostrar alerta al regresar otra vez
        navigation.setParams({ updated: false });
      }
    }, [route.params])
  );

  const fetchUsuarioLogueado = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem("usuario");
      if (jsonValue != null) {
        setUsuarioLogueado(JSON.parse(jsonValue));
      } else {
        setUsuarioLogueado(null);
      }
    } catch (error) {
      console.error("Error leyendo usuario logueado:", error);
      setUsuarioLogueado(null);
    }
  };

  const fetchUsuarios = () => {
    return fetch(`${API_URL}/usuarios`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setUsuarios(data);
        setLoading(false);
        setRefreshing(false);
      })
      .catch((error) => {
        console.error("Error al cargar usuarios:", error);
        setLoading(false);
        setRefreshing(false);
      });
  };

  useEffect(() => {
    fetchUsuarioLogueado();
    fetchUsuarios();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchUsuarios();
  };

  const handleEliminarUsuario = (id) => {
    Alert.alert(
      "Confirmar eliminación",
      "¿Estás seguro que quieres eliminar este usuario?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await fetch(`${API_URL}/usuarios/${id}`, {
                method: "DELETE",
              });
              if (response.ok) {
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                setUsuarios((prev) => prev.filter((usuario) => usuario._id !== id));
                Alert.alert("Éxito", "Usuario eliminado correctamente.");
              } else {
                Alert.alert("Error", "No se pudo eliminar el usuario.");
              }
            } catch (error) {
              Alert.alert("Error", "Error al intentar eliminar usuario.");
            }
          },
        },
      ]
    );
  };

  const usuariosFiltrados = usuarios.filter((u) => {
    if (!usuarioLogueado) return true;
    const isSameUser = String(u._id) === String(usuarioLogueado.id);
    const isAdmin = usuarioLogueado.rol?.toLowerCase().trim() === "admin";
    return !(isAdmin && isSameUser);
  });

  const renderItem = ({ item }) => (
    <View style={styles.row}>
      <Text style={[styles.cell, styles.nombre]}>
        <Icon name="user" size={16} color="#38bdf8" />{" "}
        {`${item.nombre || ""} ${item.primerApellido || ""} ${item.segundoApellido || ""}`}
      </Text>
      <Text style={[styles.cell, styles.rol]}>
        <Icon name="briefcase" size={16} color="#facc15" />{" "}
        {item.rol === "admin" ? "Administrador" : item.rol}
      </Text>
      <Text style={[styles.cell, styles.email]}>
        <Icon name="envelope" size={16} color="#4ade80" /> {item.email}
      </Text>
      <Text style={[styles.cell, styles.proyecto]}>
        <Icon name="folder" size={16} color="#a78bfa" />{" "}
        {item.proyectoId?.nombre || "Sin asignar"}
      </Text>
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() =>
            navigation.navigate("EditarUsuario", { usuario: item })
          }
          activeOpacity={0.7}
        >
          <Icon name="edit" size={20} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButtonTrash}
          onPress={() => handleEliminarUsuario(item._id)}
          activeOpacity={0.7}
        >
          <Icon name="trash" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#38bdf8" />
        <Text style={{ color: "#fff", marginTop: 10 }}>
          Cargando usuarios...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Usuarios Registrados</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={true}
        style={{ flexGrow: 0 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#38bdf8"]}
          />
        }
      >
        <View>
          <View style={[styles.row, styles.header]}>
            <View style={[styles.cell, styles.nombreHeader]}>
              <Icon name="user" size={16} color="#fff" />
              <Text style={styles.headerText}> Nombre completo</Text>
            </View>
            <View style={[styles.cell, styles.rolHeader]}>
              <Icon name="briefcase" size={16} color="#fff" />
              <Text style={styles.headerText}> Rol</Text>
            </View>
            <View style={[styles.cell, styles.emailHeader]}>
              <Icon name="envelope" size={16} color="#fff" />
              <Text style={styles.headerText}> Correo</Text>
            </View>
            <View style={[styles.cell, styles.proyectoHeader]}>
              <Icon name="folder" size={16} color="#fff" />
              <Text style={styles.headerText}> Proyecto</Text>
            </View>
            <View style={[styles.cell, styles.actionsHeader]}>
              <Text style={styles.headerText}>Acciones</Text>
            </View>
          </View>

          <FlatList
            data={usuariosFiltrados}
            keyExtractor={(item) => item._id}
            renderItem={renderItem}
            scrollEnabled={false}
          />
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("Agregarnuevousuario")}
      >
        <Icon name="user-plus" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

export default UsuariosAdmin;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121825",
    paddingVertical: 25,
    paddingHorizontal: 15,
  },
  title: {
    fontSize: 26,
    color: "#E0E7FF",
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#121825",
    justifyContent: "center",
    alignItems: "center",
  },
  row: {
    flexDirection: "row",
    backgroundColor: "#1F2937",
    borderBottomWidth: 1,
    borderBottomColor: "#374151",
    paddingVertical: 14,
    alignItems: "flex-start",
    paddingHorizontal: 8,
  },
  header: {
    backgroundColor: "#2563EB",
    borderBottomWidth: 2,
    borderBottomColor: "#1E40AF",
  },
  cell: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    borderRightWidth: 1,
    borderRightColor: "#374151",
    flexWrap: "wrap",
  },
  headerText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
  nombreHeader: {
    minWidth: 200,
    maxWidth: 200,
  },
  rolHeader: {
    minWidth: 120,
    maxWidth: 120,
  },
  emailHeader: {
    minWidth: 220,
    maxWidth: 220,
  },
  proyectoHeader: {
    minWidth: 160,
    maxWidth: 160,
  },
  actionsHeader: {
    minWidth: 110,
    justifyContent: "center",
    borderRightWidth: 0,
  },
  nombre: {
    minWidth: 200,
    maxWidth: 200,
    color: "#E0E7FF",
    fontWeight: "600",
  },
  rol: {
    minWidth: 120,
    maxWidth: 120,
    color: "#E0E7FF",
    fontWeight: "500",
  },
  email: {
    minWidth: 220,
    maxWidth: 220,
    color: "#E0E7FF",
  },
  proyecto: {
    minWidth: 160,
    maxWidth: 160,
    color: "#E0E7FF",
  },
  actions: {
    flexDirection: "row",
    minWidth: 110,
    justifyContent: "space-around",
    alignItems: "center",
    borderRightWidth: 0,
  },
  actionButton: {
    backgroundColor: "#3B82F6",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  actionButtonTrash: {
    backgroundColor: "#EF4444",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  fab: {
    position: "absolute",
    bottom: 35,
    right: 25,
    backgroundColor: "#2563EB",
    width: 65,
    height: 65,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    elevation: 7,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
  },
});
