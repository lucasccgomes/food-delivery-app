import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Alert, TextInput, Dimensions, Image, StatusBar, ScrollView, Modal } from 'react-native';
import { themeColors } from '../theme'; // Supondo que themeColors esteja importado corretamente
import firestore from '@react-native-firebase/firestore';
import * as Icon from "react-native-feather";
import { useUser } from '../context/UserContext';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { emptyCart } from '../slices/cartSlice';

const { width, height } = Dimensions.get('window');

export default function PayTroco({ route }) {
    const [needsChange, setNeedsChange] = useState(null);
    const { user } = useUser();
    const { prefId, orderItems, valorTotalComTaxa } = route.params;
    const [logoUrl, setLogoUrl] = useState('');
    const [changeAmount, setChangeAmount] = useState('');
    const navigation = useNavigation();
    const dispatch = useDispatch();
    useEffect(() => {
        const docRef = firestore().collection('admin').doc('carol');
        const unsubscribe = docRef.onSnapshot(doc => {
            if (doc.exists) {
                const data = doc.data();
                setLogoUrl(data.urlLogo);
            } else {
                console.log('Documento não encontrado');
            }
        }, error => {
            console.error('Erro ao obter as cidades:', error);
        });

        return () => unsubscribe();
    }, []);

    const handleConfirmChangeNeeded = async (needs) => {
        if (needsChange === null) {
            Alert.alert(
                "Aviso", // Título do alerta
                "Você precisa informar se precisa de troco!", // Mensagem do alerta
                [
                    { text: "OK" } // Botão para fechar o alerta
                ]
            );
            return;
        }
        if (needsChange && !changeAmount) { // Verifique se o usuário selecionou "Sim" e não informou o valor do troco
            Alert.alert(
                "Aviso", // Título do alerta
                "Você precisa informar o valor!", // Mensagem do alerta
                [
                    { text: "OK" } // Botão para fechar o alerta
                ]
            );
            return; // Pare a execução da função
        }

        try {
            const troco = Math.max(0, changeAmount - valorTotalComTaxa)
            // Certifique-se de que o caminho para a coleção e o documento está correto
            await firestore()
                .collection('usuarios')
                .doc(user.uid)
                .collection('pedidosMoney') // Atualize para o caminho correto conforme sua estrutura
                .doc(prefId)
                .set({
                    Troco: needsChange ? 'Sim' : 'Não',
                    ValorTroco: needsChange ? troco : null,
                    TrocoPara: needsChange ? changeAmount : null
                }, { merge: true });

            navigation.reset({
                index: 0,
                routes: [{ name: 'PedidoMoney', params: { prefId } }],
            });
            await updateStock(orderItems);
            dispatch(emptyCart());
            // Aqui você pode incluir a navegação, se necessário
        } catch (error) {
            console.error('Erro ao atualizar a informação:', error);
            Alert.alert('Erro', 'Não foi possível atualizar a informação.');
        }
    };

    const updateStock = async (orderItems) => {
        const batch = firestore().batch();

        orderItems.forEach((item) => {
            const itemRef = firestore()
                .collection('admin')
                .doc('carol')
                .collection('GerenciaEstoque')
                .doc(item._id); // Aqui usamos o _id que vem dos orderItems

            // Este comando decrementará a quantidade em estoque
            batch.update(itemRef, {
                qtdEstoque: firestore.FieldValue.increment(-item.quantity)
            });
        });

        try {
            await batch.commit();
            console.log('Estoque atualizado com sucesso.');
        } catch (error) {
            console.error('Erro ao atualizar o estoque:', error);
        }
    };



    console.log(changeAmount)
    return (
        <View className="bg-white  flex-1 mt-10 rounded-2xl">
            <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
            {/* Botão de Sair */}
            <View className=" z-40 relative py-4 "
                style={{
                    shadowRadius: 7,
                    shadowColor: themeColors.bgColor(1),
                    shadowOffset: {
                        width: 0,
                        height: 0,
                    },
                    shadowOpacity: 0.44,
                    shadowRadius: 10.32,
                    elevation: 13,
                }}
            >
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={{
                        backgroundColor: themeColors.bgColor(1),
                        shadowRadius: 7,
                        shadowColor: themeColors.bgColor(1),
                        shadowOffset: {
                            width: 0,
                            height: 0,
                        },
                        shadowOpacity: 0.44,
                        shadowRadius: 10.32,
                        elevation: 13,
                    }}
                    className="absolute rounded-full p-3  top-5 left-8"
                >
                    <Icon.ArrowLeft strokeWidth={3} stroke="white" />
                </TouchableOpacity>
            </View>

            <View>
                <Text className="text-center font-bold text-xl ml-6 -mt-1">
                    Você precisa de troco ?
                </Text>
                <Text className="text-center text-gray-500">

                </Text>
            </View>

            {/* Texto Selecione Meio de Pagamento*/}
            <View style={{ backgroundColor: themeColors.bgColor(0.2) }}
                className="flex-row px-4 items-center"
            >
                <Image
                    source={require('../assets/images/troco.png')}
                    className="w-20 h-20 rounded-full my-1"
                    style={{ width: width < 380 ? 50 : 70, height: width < 380 ? 50 : 70, }}
                />
                <View className="flex justify-center items-center mt-[5%] pl-3">
                    <Text className="flex-1 mb-2">
                        Você selecionou pagamento em dinheiro.
                    </Text>
                    <Text className="flex-1 -mt-[9%]">
                        Você precisa de troco ?
                    </Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                <View className="flex flex-col gap-7 items-center justify-center h-[58%] mt-8"

                >
                    <View
                        style={{ flexDirection: width < 380 ? 'row' : 'row', gap: width < 380 ? 8 : 10, }}
                    >
                        <TouchableOpacity
                            className="rounded-2xl py-5 px-8"
                            style={[{ backgroundColor: needsChange === true ? themeColors.bgColor(1) : themeColors.bgColor(0.5) }]}
                            onPress={() => setNeedsChange(true)}
                        >
                            <Text className="text-white text-center font-bold text-3xl">SIM</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="rounded-2xl py-5 px-8"
                            style={[{ backgroundColor: needsChange === false ? themeColors.bgColor(1) : themeColors.bgColor(0.5) }]}
                            onPress={() => setNeedsChange(false)}
                        >
                            <Text className="text-white text-center font-bold text-3xl">NÃO</Text>
                        </TouchableOpacity>
                    </View>
                    <View
                        style={[{ opacity: needsChange === true ? 20 : 0, }]}
                    >
                        <Text className=" text-lg text-center">
                            Troco pra quanto ?
                        </Text>
                        <View
                            style={{ borderColor: themeColors.bgColor(0.8) }}
                            className="border mt-3 rounded-xl"
                        >
                            <TextInput
                                className="p-3  text-center text-lg "

                                onChangeText={setChangeAmount}
                                value={changeAmount}
                                keyboardType="numeric"
                                placeholder="Digite o valor"
                                editable={needsChange === true}
                            />
                        </View>
                    </View>
                </View>
            </ScrollView>
            <View
                style={{ backgroundColor: themeColors.bgColor(0.2) }}
                className="p-6 px-8 rounded-t-3xl space-y-4">

                <View className="flex-row justify-between">
                    <Text className="text-gray-700">Seu Troco:</Text>
                    <Text className="text-gray-700">R${Math.max(0, changeAmount - valorTotalComTaxa)}</Text>
                </View>
                <View className="flex-row justify-between">
                    <Text className="text-gray-700 font-extrabold">Total do Pedido</Text>
                    <Text className="text-gray-700 font-extrabold">R${valorTotalComTaxa}</Text>
                </View>
                <View>
                    <TouchableOpacity
                        className="rounded-2xl py-3 px-5"
                        style={{ backgroundColor: themeColors.bgColor(1) }}
                        onPress={handleConfirmChangeNeeded}
                    >
                        <Text className="text-white text-center font-bold text-lg">CONFIRMAR</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}




