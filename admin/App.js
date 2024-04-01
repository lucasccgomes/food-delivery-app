import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, View, Button, TouchableOpacity, Text } from 'react-native';
import GerenciaEstoqueScreen from './screens/estoque';
import AdminCarolScreen from './screens/carolinfo';
import CarolConfigScreen from './screens/infoadmin';
import MonitorPedidosScreen from './screens/pedidos';
import ModalMsgConfigScreen from './screens/modalMsg';

export default function App() {
  const [showGerenciaEstoque, setShowGerenciaEstoque] = useState(false);
  const [showAdminCarol, setShowAdminCarol] = useState(false);
  const [showCarolConfig, setShowCarolConfig] = useState(false);
  const [showModalMsgConfigScreen, setShowModalMsgConfigScreen] = useState(false);

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <MonitorPedidosScreen />
      <ScrollView className="h-[550px] p-3">
        <TouchableOpacity
          onPress={() => setShowGerenciaEstoque(!showGerenciaEstoque)}
          className="p-2 rounded-xl bg-violet-700 my-2">
          <Text className="text-center font-bold text-white">
            {showGerenciaEstoque ? 'Ocultar Gerenciamento Estoque' : 'Mostrar Gerenciamento Estoque'}
          </Text>
        </TouchableOpacity>
        {showGerenciaEstoque && <GerenciaEstoqueScreen />}

        <TouchableOpacity
          onPress={() => setShowAdminCarol(!showAdminCarol)}
          className="p-2 rounded-xl bg-violet-700 my-2">
          <Text className="text-center font-bold text-white">
            {showAdminCarol ? 'Ocultar Admin Carol' : 'Mostrar Admin Carol'}
          </Text>
        </TouchableOpacity>
        {showAdminCarol && <AdminCarolScreen />}

        <TouchableOpacity
          onPress={() => setShowCarolConfig(!showCarolConfig)}
          className="p-2 rounded-xl bg-violet-700 my-2">
          <Text
            style={styles.buttonText}
            className="text-center font-bold text-white">
            {showCarolConfig ? 'Ocultar Configurações Carol' : 'Mostrar Configurações Carol'}
          </Text>
        </TouchableOpacity>
        {showCarolConfig && <CarolConfigScreen />}

        <TouchableOpacity
          onPress={() => setShowModalMsgConfigScreen(!showModalMsgConfigScreen)}
          className="p-2 rounded-xl bg-violet-700 my-2">
          <Text
            style={styles.buttonText}
            className="text-center font-bold text-white">
            {showModalMsgConfigScreen ? 'Ocultar Tela Imagem MSG' : 'Mostrar Tela Imagem MSG'}
          </Text>
        </TouchableOpacity>
        {showModalMsgConfigScreen && <ModalMsgConfigScreen/>}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: 25,
  },
  scrollView: {
    borderTopWidth: 8,
    borderTopColor: '#FBCFE8', // ou use 'pink' se preferir
  },
});