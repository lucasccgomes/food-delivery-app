import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, Button, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { db } from '../config';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';

export default function GerenciaEstoqueScreen() {
  const [itensEstoque, setItensEstoque] = useState([]);
  const [atualizacoesPendentes, setAtualizacoesPendentes] = useState({});

  const handleSave = async () => {
    console.log('Salvando todas as atualizações de estoque');
    try {
      const updatePromises = Object.entries(atualizacoesPendentes).map(([id, novaQuantidade]) => {
        const itemRef = doc(db, "admin", "carol", "GerenciaEstoque", id);
        return updateDoc(itemRef, {
          qtdEstoque: novaQuantidade
        });
      });

      await Promise.all(updatePromises);

      console.log('Todas as quantidades de estoque foram atualizadas');
      Alert.alert('Sucesso', 'Estoque atualizado com sucesso!');

      // Limpa as atualizações pendentes depois de salvar
      setAtualizacoesPendentes({});
    } catch (error) {
      console.error('Erro ao salvar as atualizações de estoque:', error);
      Alert.alert('Erro', 'Falha ao atualizar estoque!');
    }
  };

  const handleChangeQuantidade = (id, novaQuantidade) => {
    const numero = isNaN(novaQuantidade) ? 0 : parseInt(novaQuantidade); // Converte para número, padrão para 0 se for NaN
    setAtualizacoesPendentes(prevAtualizacoes => ({
      ...prevAtualizacoes,
      [id]: numero
    }));
  };

  useEffect(() => {
    const buscarItensEstoque = async () => {
      console.log('Iniciando a busca dos itens de estoque');
      try {
        // Referência para a subcoleção 'GerenciaEstoque' dentro do documento 'carol' na coleção 'admin'
        const gerenciaEstoqueRef = collection(db, "admin", "carol", "GerenciaEstoque");
        const querySnapshot = await getDocs(gerenciaEstoqueRef);
        const itens = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        console.log('Itens de estoque recebidos:', itens);
        setItensEstoque(itens);
      } catch (error) {
        console.error('Erro ao buscar itens de estoque:', error);
      }
    };

    buscarItensEstoque();
  }, []);

  const atualizarQuantidade = async (id, novaQuantidade) => {
    console.log(`Atualizando a quantidade do item ${id} para ${novaQuantidade}`);
    try {
      // Caminho completo do documento incluindo todas as coleções e subcoleções
      const itemRef = doc(db, "admin", "carol", "GerenciaEstoque", id);
      await updateDoc(itemRef, {
        qtdEstoque: novaQuantidade
      });
      console.log('Quantidade atualizada com sucesso');
    } catch (error) {
      console.error('Erro ao atualizar a quantidade de estoque:', error);
    }
  };


  if (itensEstoque.length === 0) {
    console.log('Nenhum item de estoque foi carregado ainda ou a coleção está vazia.');
  }
  return (
    <ScrollView style={styles.container}>
      {itensEstoque.map(item => (
        <View key={item.id} style={styles.itemContainer}>
          <Text style={styles.itemNome}>{item.nome}</Text>
          <TextInput
            style={styles.input}
            defaultValue={item.qtdEstoque.toString()}
            keyboardType='numeric'
            onChangeText={(text) => handleChangeQuantidade(item.id, text)}
          />
        </View>
      ))}
      <TouchableOpacity
        onPress={handleSave}
        className="p-2 rounded-xl bg-cyan-500 my-2">
        <Text
          style={styles.buttonText}
          className="text-center font-bold text-white">
          Salvar Alterações
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  itemNome: {
    fontSize: 18,
  },
  input: {
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    padding: 10,
    width: 100,
    textAlign: 'center',
  }
});
