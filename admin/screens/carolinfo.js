import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, Button, TouchableOpacity } from 'react-native';
import { db } from '../config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export default function AdminCarolScreen() {
  const [abertoFechado, setAbertoFechado] = useState('');
  const [enderecoRetirada, setEnderecoRetirada] = useState('');
  const [entregaStatus, setEntregaStatus] = useState('');


  // Referência do documento 'carol' na coleção 'admin'
  const docRef = doc(db, "admin", "carol");

  useEffect(() => {
    // Função para buscar os dados iniciais do documento
    const buscarDados = async () => {
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setAbertoFechado(docSnap.data().AberFech);
        setEnderecoRetirada(docSnap.data().EnderecoRetirada);
        setEntregaStatus(docSnap.data().entrega);
      } else {
        console.log('Documento não encontrado!');
      }
    };

    buscarDados();
  }, []);

  useEffect(() => {
    const buscarDados = async () => {
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        // ... Outras atualizações de estado
        setEntregaStatus(docSnap.data().entrega);
      } else {
        console.log('Documento não encontrado!');
      }
    };

    buscarDados();
  }, []);

  const toggleEntregaStatus = async () => {
    const novoStatus = entregaStatus === 'disponivel' ? 'indisponivel' : 'disponivel';
    await updateDoc(docRef, {
      entrega: novoStatus
    });
    setEntregaStatus(novoStatus);
  };


  // Função para atualizar o campo AberFech
  const toggleAberFech = async () => {
    await updateDoc(docRef, {
      AberFech: abertoFechado === 'aberto' ? 'fechado' : 'aberto'
    });
    setAbertoFechado(abertoFechado === 'aberto' ? 'fechado' : 'aberto');
  };

  // Função para atualizar o campo EnderecoRetirada
  const atualizarEnderecoRetirada = async () => {
    await updateDoc(docRef, {
      EnderecoRetirada: enderecoRetirada
    });
  };

  return (
    <View style={styles.container}>
      <Text className="text-center text-lg font-bold">
        Status Atual
      </Text>
      <Text className="text-center font-bold">
        {abertoFechado}
      </Text>

      <TouchableOpacity
        onPress={toggleAberFech}
        className="p-2 rounded-xl bg-cyan-500 my-2">
        <Text className="text-center font-bold text-white">
          {`Mudar status para ${abertoFechado === 'aberto' ? 'fechado' : 'aberto'}`}
        </Text>
      </TouchableOpacity>
      <TextInput
        className="border rounded-lg text-center py-2 mt-4"
        value={enderecoRetirada}
        onChangeText={setEnderecoRetirada}
        onBlur={atualizarEnderecoRetirada}
      />
      <Text className="text-center">
        Siga o padrão: Rua, Numero, Bairro, Cidade
      </Text>
      <Text className="text-center text-lg font-bold mt-3">
        Status Entrega
      </Text>
      <Text className="text-center font-bold">
        {entregaStatus}
      </Text>
      <TouchableOpacity
        onPress={toggleEntregaStatus}
        className="p-2 rounded-xl bg-cyan-500 my-2">
        <Text className="text-center font-bold text-white">
          {`Mudar entrega para ${entregaStatus === 'disponivel' ? 'indisponivel' : 'disponivel'}`}
        </Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: 'gray',
    padding: 10,
    marginVertical: 20,
  },
});
