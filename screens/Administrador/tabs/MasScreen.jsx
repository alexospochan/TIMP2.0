import React from "react";
import { View, Text, StyleSheet } from "react-native";

const MasScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pantalla Más</Text>
      <Text>Opciones adicionales que irás agregando aquí.</Text>
    </View>
  );
};

export default MasScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 12,
  },
});
