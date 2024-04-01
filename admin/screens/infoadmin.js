import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, Button, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { db } from '../config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export default function CarolConfigScreen() {
    const [taxaEntrega, setTaxaEntrega] = useState('');
    const [categoria, setCategoria] = useState('');
    const [descricao, setDescricao] = useState('');
    const [title, setTitle] = useState('');
    const [urlLogo, setUrlLogo] = useState('');
    const [taxaCartao, setTaxaCartao] = useState('');
    const [fraseLogin, setFraseLogin] = useState('');

    const docRef = doc(db, "admin", "carol");

    useEffect(() => {
        const buscarDados = async () => {
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                setTaxaEntrega(data.TaxaEntrega.toString()); // Certifique-se de converter para string
                setCategoria(data.categoria);
                setDescricao(data.descricao);
                setTitle(data.title);
                setUrlLogo(data.urlLogo);
                setFraseLogin(data.fraseLogin);
                setTaxaCartao(data.porcentagemCartao.toString());
            } else {
                console.log('Documento não encontrado!');
            }
        };

        buscarDados();
    }, []);

    const atualizarDados = async (campo, valor) => {
        if (campo === 'TaxaEntrega' || campo === 'porcentagemCartao') {
            valor = parseFloat(valor);
            if (isNaN(valor)) {
                Alert.alert('Erro', 'Por favor, insira um número válido.');
                return;
            }
        }

        try {
            await updateDoc(docRef, {
                [campo]: valor
            });
            Alert.alert('Sucesso', 'Informação atualizada com sucesso.');
        } catch (error) {
            Alert.alert('Erro', 'Houve um erro ao atualizar a informação.');
        }
    };

    const validarURL = (str) => {
        var pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
            '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
            '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
            '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
            '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
            '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
        return !!pattern.test(str);
    };

    return (
        <ScrollView style={styles.container}>
            <CampoConfig
                label="Taxa de Entrega"
                value={taxaEntrega}
                setValue={(text) => setTaxaEntrega(text.replace(/[^0-9.]/g, ''))}
                keyboardType="numeric"
                onSubmit={() => {
                    const numero = parseFloat(taxaEntrega);
                    if (!isNaN(numero)) {
                        atualizarDados('TaxaEntrega', numero);
                    } else {
                        Alert.alert('Valor inválido', 'Por favor, insira um número válido para a taxa de entrega.');
                    }
                }}
            />
            <CampoConfig
                label="Categoria"
                value={categoria}
                setValue={setCategoria}
                onSubmit={() => atualizarDados('categoria', categoria)}
            />
            <CampoConfig
                label="Descrição"
                value={descricao}
                setValue={setDescricao}
                onSubmit={() => atualizarDados('descricao', descricao)}
            />
            <CampoConfig
                label="Título"
                value={title}
                setValue={setTitle}
                onSubmit={() => atualizarDados('title', title)}
            />
            <CampoConfig
                label="URL do Logo"
                value={urlLogo}
                setValue={setUrlLogo}
                onSubmit={() => atualizarDados('urlLogo', urlLogo)}
            />

            <CampoConfig
                label="Taxa do Cartão"
                value={taxaCartao}
                setValue={(text) => setTaxaCartao(text.replace(/[^0-9.]/g, ''))}
                keyboardType="numeric"
                onSubmit={() => {
                    const numero = parseFloat(taxaCartao);
                    if (!isNaN(numero)) {
                        atualizarDados('porcentagemCartao', numero);
                    } else {
                        Alert.alert('Valor inválido', 'Por favor, insira um número válido para a taxa do cartão.');
                    }
                }}
            />
            <CampoConfig
                label="Frase Login"
                value={fraseLogin}
                setValue={setFraseLogin}
                onSubmit={() => atualizarDados('fraseLogin', fraseLogin)}
            />

        </ScrollView>
    );
}

const CampoConfig = ({ label, value, setValue, onSubmit, keyboardType = 'default' }) => (
    <View style={styles.campoContainer}>
        <Text style={styles.label}>{label}</Text>
        <TextInput
            style={styles.input}
            value={value}
            onChangeText={setValue}
            keyboardType={keyboardType}
        />
        <TouchableOpacity
            onPress={onSubmit}
            className="p-2 rounded-xl bg-cyan-500 my-2">
            <Text className="text-center font-bold text-white">
                Salvar
            </Text>
        </TouchableOpacity>

    </View>
);

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
