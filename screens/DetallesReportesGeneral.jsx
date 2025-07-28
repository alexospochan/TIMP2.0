import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Modal,
  TouchableOpacity,
  Dimensions,
} from "react-native";

const { width, height } = Dimensions.get("window");

export default function DetallesReportesGeneral({ route }) {
  const { reporte } = route.params;
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const formatearFecha = (fechaStr) => {
    if (!fechaStr) return "N/A";
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString();
  };

  const formatearHora = (fechaStr) => {
    if (!fechaStr) return "N/A";
    const fecha = new Date(fechaStr);
    return fecha.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const abrirImagen = (uri) => {
    setSelectedImage(uri);
    setModalVisible(true);
  };

  const cerrarModal = () => {
    setModalVisible(false);
    setSelectedImage(null);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.title}>Detalles del Reporte</Text>

      <InfoCard label="Categoría:" value={reporte.categoria || "N/A"} />
      <InfoCard label="Proyecto:" value={reporte.proyectoId?.nombre || "Sin proyecto"} />
      <InfoCard
        label="Km Inicio - Km Final:"
        value={`${reporte.proyectoId?.kmInicio ?? "?"} - ${reporte.proyectoId?.kmFinal ?? "?"}`}
      />
      <InfoCard label="Fecha:" value={formatearFecha(reporte.fecha)} />
      <InfoCard label="Hora:" value={formatearHora(reporte.fecha)} />
      <InfoCard label="Usuario:" value={reporte.usuario || "Desconocido"} />

      <View style={[styles.card, { paddingVertical: 10 }]}>
        <Text style={styles.label}>Imágenes:</Text>
        {reporte.imagenes && reporte.imagenes.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {reporte.imagenes.map((img, idx) => {
              // Si la imagen es string, uri = string; si es objeto, sacamos uri y coords
              let uri = "";
              let latitud = null;
              let longitud = null;

              if (typeof img === "string") {
                uri = img;
              } else {
                uri = img.uri || img.url || "";
                latitud = img.latitud ?? img.latitude ?? null;
                longitud = img.longitud ?? img.longitude ?? null;
              }

              if (!uri) return null;

              return (
                <View key={idx} style={{ marginRight: 16, alignItems: "center" }}>
                  <TouchableOpacity onPress={() => abrirImagen(uri)} activeOpacity={0.8}>
                    <Image
                      source={{ uri }}
                      style={styles.image}
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                  {(latitud !== null && longitud !== null) && (
                    <Text style={styles.coordsText}>
                      Lat: {latitud.toFixed(5)}, Lon: {longitud.toFixed(5)}
                    </Text>
                  )}
                </View>
              );
            })}
          </ScrollView>
        ) : (
          <Text style={styles.value}>No hay imágenes disponibles.</Text>
        )}
      </View>

      {/* Modal para imagen ampliada con zoom */}
      <Modal visible={modalVisible} transparent={true} onRequestClose={cerrarModal}>
        <View style={styles.modalBackground}>
          <TouchableOpacity style={styles.modalCloseArea} onPress={cerrarModal} />
          <ScrollView
            style={styles.modalScroll}
            maximumZoomScale={4}
            minimumZoomScale={1}
            contentContainerStyle={{ alignItems: "center", justifyContent: "center" }}
          >
            {selectedImage && (
              <Image
                source={{ uri: selectedImage }}
                style={styles.modalImage}
                resizeMode="contain"
              />
            )}
          </ScrollView>
          <TouchableOpacity style={styles.modalCloseButton} onPress={cerrarModal}>
            <Text style={styles.modalCloseText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </ScrollView>
  );
}

const InfoCard = ({ label, value }) => (
  <View style={styles.card}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#040D20",
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#00ffcc",
    marginBottom: 25,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#19212B",
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  label: {
    color: "#ccc",
    fontWeight: "600",
    fontSize: 16,
    marginBottom: 6,
  },
  value: {
    color: "white",
    fontSize: 18,
  },
  image: {
    width: 140,
    height: 140,
    borderRadius: 12,
  },
  coordsText: {
    color: "#ccc",
    fontSize: 12,
    marginTop: 4,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCloseArea: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalScroll: {
    width: width,
    height: height,
  },
  modalImage: {
    width: width,
    height: height * 0.8,
  },
  modalCloseButton: {
    position: "absolute",
    bottom: 40,
    backgroundColor: "#00ffcc",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  modalCloseText: {
    color: "#040D20",
    fontWeight: "bold",
    fontSize: 18,
  },
});
