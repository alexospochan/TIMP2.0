import React from "react";
import { View, Text, StyleSheet } from "react-native";

const BusquedaScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pantalla de Búsqueda</Text>
      <Text>Aquí podrás agregar la funcionalidad de búsqueda más adelante.</Text>
    </View>
  );
};

export default BusquedaScreen;

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
