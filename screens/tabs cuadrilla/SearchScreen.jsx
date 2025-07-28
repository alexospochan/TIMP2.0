import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  TextInput,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useNavigation } from "@react-navigation/native";
import { getTodosLosReportes } from "../../api"; // Ajusta la ruta según tu proyecto

export default function ReportesJefeScreen({ route }) {
  const usuario = route?.params?.usuario;

  const [search, setSearch] = useState("");
  const [reportes, setReportes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inputFocused, setInputFocused] = useState(false);

  const navigation = useNavigation();

  useEffect(() => {
    async function fetchReportes() {
      setLoading(true);
      const data = await getTodosLosReportes();
      setReportes(data);
      setLoading(false);
    }
    fetchReportes();
  }, []);

  const filteredReportes = reportes.filter((item) => {
    const kmInicioStr = item.proyectoId?.kmInicio?.toString() || "";
    const kmFinalStr = item.proyectoId?.kmFinal?.toString() || "";
    const searchStr = search.trim();
    return kmInicioStr.includes(searchStr) || kmFinalStr.includes(searchStr);
  });

  const renderItem = ({ item, index }) => {
    const fechaFormateada = new Date(item.fecha).toLocaleDateString();
    const horaFormateada = new Date(item.fecha).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    return (
      <TouchableOpacity
        style={[
          styles.row,
          { backgroundColor: index % 2 === 0 ? "#253241" : "#19212B" },
        ]}
        onPress={() =>
          navigation.navigate("DetallesReportesGeneral", { reporte: item })
        }
      >
        <Text style={[styles.cell, styles.categoria]}>
          {item.categoria || "N/A"}
        </Text>
        <Text style={[styles.cell, styles.proyecto]}>
          {item.proyectoId?.nombre || "Sin proyecto"}
        </Text>
        <Text style={[styles.cell, styles.km]}>
          {item.proyectoId?.kmInicio ?? "?"} - {item.proyectoId?.kmFinal ?? "?"}
        </Text>
        <Text style={[styles.cell, styles.hora]}>{horaFormateada}</Text>
        <Text style={[styles.cell, styles.fecha]}>{fechaFormateada}</Text>
        <Text style={[styles.cell, styles.usuario]}>
          {item.usuario || "Desconocido"}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <View style={styles.searchBar2}>
          <View style={styles.searchBar}>
            <Ionicons
              name="search"
              size={20}
              color="white"
              style={{ marginLeft: 10 }}
            />
            <TextInput
              placeholder="Buscar km..."
              placeholderTextColor="#888"
              style={styles.searchInput}
              value={search}
              onChangeText={setSearch}
              keyboardType="numeric"
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
              editable={true} // Activado para permitir búsqueda
            />
          </View>
        </View>
      </View>

      <View style={{ flex: 1 }}>
        {inputFocused && (
          <BlurView intensity={90} tint="dark" style={styles.blurView} />
        )}

        <ScrollView horizontal style={{ flex: 1 }}>
          <View style={styles.tableContainer}>
            {loading ? (
              <ActivityIndicator
                size="large"
                color="#00ffcc"
                style={{ marginTop: 20 }}
              />
            ) : filteredReportes.length === 0 ? (
              <Text
                style={{ color: "white", textAlign: "center", marginTop: 20 }}
              >
                No hay reportes disponibles.
              </Text>
            ) : (
              <>
                <View style={styles.tableHeader}>
                  <Text style={[styles.headerCell, styles.categoria]}>
                    Categoría
                  </Text>
                  <Text style={[styles.headerCell, styles.proyecto]}>
                    Proyecto
                  </Text>
                  <Text style={[styles.headerCell, styles.km]}>Km</Text>
                  <Text style={[styles.headerCell, styles.hora]}>Hora</Text>
                  <Text style={[styles.headerCell, styles.fecha]}>Fecha</Text>
                  <Text style={[styles.headerCell, styles.usuario]}>
                    Usuario
                  </Text>
                </View>
                <FlatList
                  data={filteredReportes}
                  renderItem={renderItem}
                  keyExtractor={(item) => item._id}
                  keyboardShouldPersistTaps="handled"
                  style={{ width: "100%" }}
                />
              </>
            )}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#040D20", paddingTop: 40 },
  topBar: { flexDirection: "row", alignItems: "center", paddingBottom: 10, zIndex: 2 },
  searchBar2: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#040D20",
    width: "100%",
    justifyContent: "flex-end",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#19212B",
    borderRadius: 25,
    paddingVertical: 6,
    paddingHorizontal: 12,
    width: "75%",
    marginRight: 8,
  },
  searchInput: { flex: 1, color: "white", marginLeft: 12, fontSize: 16 },
  tableContainer: {
    backgroundColor: "#19212B",
    borderRadius: 20,
    overflow: "hidden",
    minWidth: 800,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#0f1b2e",
    paddingVertical: 12,
    borderBottomColor: "#253241",
    borderBottomWidth: 1,
  },
  headerCell: { color: "#ccc", fontWeight: "bold", textAlign: "center" },
  row: {
    flexDirection: "row",
    paddingVertical: 12,
    borderBottomColor: "#253241",
    borderBottomWidth: 1,
  },
  cell: { color: "white", textAlign: "center", paddingHorizontal: 5 },
  categoria: { width: 130 },
  proyecto: { width: 200 },
  km: { width: 100 },
  hora: { width: 80 },
  fecha: { width: 100 },
  usuario: { width: 150 },
  blurView: { ...StyleSheet.absoluteFillObject, zIndex: 1 },
});
