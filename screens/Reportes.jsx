import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView, 
  StatusBar, 
  Image, 
  Platform,
  TextInput
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome, Entypo } from '@expo/vector-icons';

const initialData = Array.from({ length: 10 }, (_, i) => ({
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
  ][i % 6],
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
  const [searchText, setSearchText] = useState('');
  const inputRef = useRef(null);

  const filteredData = data.filter(item =>
    item.importancia.toLowerCase().includes(searchText.toLowerCase())
  );

  const focusInput = () => {
    if(inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <Image source={require('../assets/TIMP.png')} style={styles.logo} />
        <Text style={styles.headerTitle}>Reportes</Text>

        <TouchableOpacity activeOpacity={1} onPress={focusInput} style={styles.searchContainer}>
          <TextInput
            ref={inputRef}
            placeholder="Buscar"
            placeholderTextColor="#a0aec0"
            style={styles.searchInput}
            value={searchText}
            onChangeText={setSearchText}
            autoCapitalize="none"
            autoCorrect={false}
            underlineColorAndroid="transparent"
          />
          <Entypo name="magnifying-glass" size={20} color="#a0aec0" />
        </TouchableOpacity>
      </View>

      <View style={styles.container}>
        <ScrollView>
          <ScrollView horizontal>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={styles.headerText}>ID</Text>
                <Text style={styles.headerText}>Categoría</Text>
                <Text style={styles.headerText}>Importancia</Text>
                <Text style={styles.headerText}>Fecha</Text>
                <Text style={styles.headerText}>Usuario</Text>
              </View>

              {filteredData.length === 0 ? (
                <View style={[styles.row, { justifyContent: 'center' }]}>
                  <Text style={{ color: 'white', fontStyle: 'italic' }}>No se encontraron resultados</Text>
                </View>
              ) : (
                filteredData.map((item) => (
                  <View key={item.id} style={styles.row}>
                    <Text style={styles.cell}>{item.id}</Text>
                    <Text style={styles.cell}>{item.categoria}</Text>
                    <Text style={[styles.cell, getImportanceStyle(item.importancia)]}>
                      {item.importancia}
                    </Text>
                    <Text style={styles.cell}>{item.fecha}</Text>
                    <Text style={styles.cell}>{item.usuario}</Text>
                  </View>
                ))
              )}
            </View>
          </ScrollView>
        </ScrollView>

        <TouchableOpacity 
          style={styles.fab} 
          onPress={() => navigation.navigate('ReportePrueba')}
        >
          <FontAwesome name="plus" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const getImportanceStyle = (importancia) => {
  switch (importancia) {
    case 'Alta':
      return { color: '#ef4444', fontWeight: 'bold' };
    case 'Mediana':
      return { color: '#facc15', fontWeight: 'bold' };
    case 'Baja':
      return { color: '#22c55e', fontWeight: 'bold' };
    default:
      return {};
  }
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#0f172a',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingTop: 15,
    backgroundColor: '#1E293B',
    position: 'relative',
  },
  logo: {
    width: 60,
    height: 60,
    marginRight: 10,
    resizeMode: 'contain',
  },
  headerTitle: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',  // <-- Centra texto + icono horizontalmente
    backgroundColor: '#334155',
    borderRadius: 25,
    paddingHorizontal: 10,
    paddingVertical: 6,
    minWidth: 120,
  },
  searchInput: {
    color: 'white',
    fontSize: 14,
    marginRight: 6,
    paddingVertical: 0,
    flex: 1,
    textAlign: 'center', // <-- Centra el texto dentro del input
  },
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    paddingHorizontal: 5,
  },
  table: {
    minWidth: 800,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#334155',
    paddingVertical: 12,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  headerText: {
    flex: 1,
    color: '#ffffff',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 14,
    minWidth: 120,
  },
  row: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    marginVertical: 5,
    borderRadius: 8,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  cell: {
    flex: 1,
    color: 'white',
    textAlign: 'center',
    fontSize: 13,
    minWidth: 120,
  },
  fab: {
    position: 'absolute',
    bottom: 70,
    right: 20,
    backgroundColor: '#2563eb',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});
