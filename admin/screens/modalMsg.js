import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, Button, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { db } from '../config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export default function ModalMsgConfigScreen() {
    const [modalMsg, setModalMsg] = useState({
        Mensagem: '',
        Status: '',
        imagem: ''
    });

    const docRef = doc(db, "admin", "carol");

    useEffect(() => {
        const buscarDados = async () => {
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                setModalMsg(data.ModalMsg);
            } else {
                console.log('Documento não encontrado!');
            }
        };

        buscarDados();
    }, []);

    const atualizarStatus = async () => {
        try {
            const novoStatus = modalMsg.Status === 'ativo' ? 'desativado' : 'ativo';
            await updateDoc(docRef, {
                'ModalMsg.Status': novoStatus
            });
            setModalMsg(prevState => ({ ...prevState, Status: novoStatus }));
            Alert.alert('Sucesso', 'Status atualizado com sucesso.');
        } catch (error) {
            Alert.alert('Erro', 'Houve um erro ao atualizar o status.');
        }
    };

    const atualizarImagem = async (novaImagem) => {
        try {
            await updateDoc(docRef, {
                'ModalMsg.imagem': novaImagem
            });
            setModalMsg(prevState => ({ ...prevState, imagem: novaImagem }));
            Alert.alert('Sucesso', 'Imagem atualizada com sucesso.');
        } catch (error) {
            Alert.alert('Erro', 'Houve um erro ao atualizar a imagem.');
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.campoContainer}>
                <Text className="text-center font-bold">Status da Imagem</Text>
                <Text className=" text-center">{modalMsg.Status}</Text>
                <TouchableOpacity
                    onPress={atualizarStatus}
                    className="p-2 rounded-xl bg-cyan-500 my-2">
                    <Text
                        style={styles.buttonText}
                        className="text-center font-bold text-white">
                        Mudar para  {modalMsg.Status === 'ativo' ? 'Desativado' : 'Ativo'}
                    </Text>
                </TouchableOpacity>
            </View>
            <View style={styles.campoContainer}>
                <Text style={styles.label}>Imagem:</Text>
                <TextInput
                    style={styles.input}
                    value={modalMsg.imagem}
                    onChangeText={(text) => setModalMsg(prevState => ({ ...prevState, imagem: text }))}
                />
                <TouchableOpacity
                    onPress={() => atualizarImagem(modalMsg.imagem)}
                    className="p-2 rounded-xl bg-cyan-500 my-2">
                    <Text className="text-center font-bold text-white">
                        Salvar
                    </Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    campoContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        marginBottom: 5,
    },
    input: {
        borderWidth: 1,
        borderColor: 'gray',
        padding: 10,
    },
});
