import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const initialData = Array.from({ length: 5 }, (_, i) => ({
  id: i + 1,
  categoria: i % 3 === 0 ? 'Avance' : i % 3 === 1 ? 'Daños' : 'Protección',
  importancia: i % 3 === 0 ? 'Baja' : i % 3 === 1 ? 'Alta' : 'Mediana',
  fecha: getCurrentDateTime(),
  usuario: [
    'Juan Manuel Lopez Castillo',
    'Pablo Enrique Martinez',
    'Paulina Nolasco Cabrera',
    'Alfredo Sanchez Juarez',
    'Manuel Rodriguez Rosado',
    'Samantha Caamal Flores',
  ][i],
}));

function getCurrentDateTime() {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const period = hours >= 12 ? 'p.m.' : 'a.m.';
  const formattedHours = hours % 12 || 12;
  const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
  const date = now.toLocaleDateString('es-ES');
  
  return `${formattedHours}:${formattedMinutes} ${period} ${date}`;
}

export default function Reportes() {
  const navigation = useNavigation();
  const [data, setData] = useState(initialData);

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Image source={require('../assets/TIMP.png')} style={styles.logo} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <Text style={styles.menuItem}>Usuarios</Text>
                    <Text style={styles.menuItem}>Mapas</Text>
                    <Text style={styles.menuItem}>Lista</Text>
                    <Text style={styles.menuItem}>Reporte</Text>
                    <Text style={styles.menuItem}>Pinturas</Text>
                    <Text style={styles.menuItem}>Reportes</Text>
        </ScrollView>
      </View>

      <View style={styles.container}>
        <ScrollView>
          <View style={styles.tableHeader}>
            <Text style={styles.headerText}>ID</Text>
            <Text style={styles.headerText}>Categoría</Text>
            <Text style={styles.headerText}>Importancia</Text>
            <Text style={styles.headerText}>Fecha</Text>
            <Text style={styles.headerText}>Usuario</Text>
          </View>
          {data.map((item) => (
            <View key={item.id} style={styles.row}>
              <Text style={styles.cell}>{item.id}</Text>
              <Text style={styles.cell}>{item.categoria}</Text>
              <Text style={[styles.cell, getImportanceStyle(item.importancia)]}>{item.importancia}</Text>
              <Text style={styles.cell}>{item.fecha}</Text>
              <Text style={styles.cell}>{item.usuario}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Botón para ir a Reporte_Prueba */}
        <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('ReportePrueba')}>
          <Text style={styles.addButtonText}>Agregar</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const getImportanceStyle = (importancia) => {
  switch (importancia) {
    case 'Alta':
      return { color: '#dc2626', fontWeight: 'bold' }; 
    case 'Mediana':
      return { color: '#facc15', fontWeight: 'bold' }; 
    case 'Baja':
      return { color: '#16a34a', fontWeight: 'bold' }; 
    default:
      return {};
  }
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#1E293B',
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  menuItem: {
    color: 'white',
    marginHorizontal: 10,
    fontSize: 16,
  },
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderColor: '#334155',
    paddingVertical: 10,
    backgroundColor: '#1e293b',
  },
  headerText: {
    flex: 1,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#334155',
  },
  cell: {
    flex: 1,
    color: 'white',
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: '#1e3a8a',
    padding: 15,
    margin: 5,
    borderRadius: 10,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
