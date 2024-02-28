import React, { useState } from 'react';
import { Button, TextInput, View, StyleSheet, Text } from 'react-native';
import firestore from '@react-native-firebase/firestore';

const AddInfo = ({ navigation, route }) => {
  const [cidade, setCidade] = useState('');
  const [rua, setRua] = useState('');
  const [numero, setNumero] = useState('');
  const [bairro, setBairro] = useState('');
  const userUid = route.params.userUid; // Garanta que o userUid está sendo passado corretamente

  const adicionarEndereco = async () => {
    await firestore()
      .collection('usuarios')
      .doc(userUid)
      .set({
        EnderecoEntrega: {
          Cidade: cidade,
          Rua: rua,
          Numero: numero,
          Bairro: bairro
        }
      }, { merge: true });
    
    navigation.navigate('TelaPrincipal'); // Ou qualquer outra tela para a qual você deseja redirecionar após
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Adicionar Endereço</Text>
      <TextInput placeholder="Cidade" value={cidade} onChangeText={setCidade} style={styles.input} />
      <TextInput placeholder="Rua" value={rua} onChangeText={setRua} style={styles.input} />
      <TextInput placeholder="Número" value={numero} onChangeText={setNumero} style={styles.input} />
      <TextInput placeholder="Bairro" value={bairro} onChangeText={setBairro} style={styles.input} />
      <Button title="Confirmar" onPress={adicionarEndereco} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center'
  },
  input: {
    marginBottom: 10,
    paddingHorizontal: 10,
    height: 40,
    borderColor: 'gray',
    borderWidth: 1
  }
});

export default AddInfo;
