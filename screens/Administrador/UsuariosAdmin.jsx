import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { useNavigation } from "@react-navigation/native";

const UsuariosAdmin = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  // Función para cargar usuarios
  const fetchUsuarios = () => {
    return fetch("http://192.168.73.158:3000/usuarios")
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
    fetchUsuarios();
  }, []);

  // Pull to refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchUsuarios();
  };

  // Eliminar usuario
  const handleEliminarUsuario = async (id) => {
    try {
      const response = await fetch(`http://192.168.73.158:3000/usuarios/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setUsuarios((prev) => prev.filter((usuario) => usuario._id !== id));
      } else {
        console.error("Error al eliminar usuario");
      }
    } catch (error) {
      console.error("Error al intentar eliminar:", error);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.row}>
      <Text style={[styles.cell, styles.nombre]}>
        <Icon name="user" size={14} color="#38bdf8" />{" "}
        {`${item.nombre || ""} ${item.primerApellido || ""} ${item.segundoApellido || ""}`}
      </Text>
      <Text style={[styles.cell, styles.rol]}>
        <Icon name="briefcase" size={14} color="#facc15" />{" "}
        {item.rol === "admin" ? "Administrador" : item.rol}
      </Text>
      <Text style={[styles.cell, styles.email]}>
        <Icon name="envelope" size={14} color="#4ade80" /> {item.email}
      </Text>

      {/* Botones grandes de editar y eliminar */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate("EditarUsuario", { usuario: item })}
          activeOpacity={0.7}
        >
          <Icon name="edit" size={26} color="#3b82f6" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleEliminarUsuario(item._id)}
          activeOpacity={0.7}
        >
          <Icon name="trash" size={26} color="#ef4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#38bdf8" />
        <Text style={{ color: "#fff", marginTop: 10 }}>Cargando usuarios...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Usuarios Registrados</Text>

      <ScrollView
        horizontal
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#38bdf8"]} />
        }
      >
        <View>
          <View style={[styles.row, styles.header]}>
            <Text style={[styles.cell, styles.nombre]}>Nombre completo</Text>
            <Text style={[styles.cell, styles.rol]}>Rol</Text>
            <Text style={[styles.cell, styles.email]}>Correo</Text>
            <Text style={[styles.cell, styles.actionsHeader]}>Acciones</Text>
          </View>

          <FlatList
            data={usuarios}
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
        <Icon name="user-plus" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

export default UsuariosAdmin;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 26,
    color: "#f8fafc",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#0f172a",
    justifyContent: "center",
    alignItems: "center",
  },
  row: {
    flexDirection: "row",
    backgroundColor: "#1e293b",
    borderBottomWidth: 1,
    borderBottomColor: "#334155",
    paddingVertical: 12,
    alignItems: "center",
  },
  header: {
    backgroundColor: "#334155",
    borderBottomWidth: 2,
    borderBottomColor: "#64748b",
  },
  cell: {
    color: "#e2e8f0",
    paddingHorizontal: 10,
    fontSize: 14,
    flexWrap: "wrap",
  },
  nombre: {
    width: 240,
    fontWeight: "600",
  },
  rol: {
    width: 160,
  },
  email: {
    width: 240,
  },
  actionsHeader: {
    width: 110,
    fontWeight: "600",
  },
  actions: {
    flexDirection: "row",
    width: 110,
    justifyContent: "center",
    alignItems: "center",
  },
  actionButton: {
    marginHorizontal: 10,
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#334155",
  },
  fab: {
    position: "absolute",
    bottom: 60,
    right: 30,
    backgroundColor: "#1e40af",
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});
