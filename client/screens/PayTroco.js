import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Alert, TextInput, Dimensions, Image, StatusBar } from 'react-native';
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
    const { prefId } = route.params;
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
        try {
            // Certifique-se de que o caminho para a coleção e o documento está correto
            await firestore()
                .collection('usuarios')
                .doc(user.uid)
                .collection('pedidosMoney') // Atualize para o caminho correto conforme sua estrutura
                .doc(prefId)
                .set({ Troco: needsChange ? 'Sim' : 'Não', ValorTroco: needsChange ? changeAmount : null }, { merge: true });

                navigation.reset({
                    index: 0,
                    routes: [{ name: 'PedidoMoney', params: { prefId } }],
                });
                dispatch(emptyCart());
            // Aqui você pode incluir a navegação, se necessário
        } catch (error) {
            console.error('Erro ao atualizar a informação:', error);
            Alert.alert('Erro', 'Não foi possível atualizar a informação.');
        }
    };

    return (
        <View className="bg-white  flex-1 mt-10 rounded-2xl">
            <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
            {/* Botão de Voltar */}
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
                    style={{ width: width < 400 ? 50 : 70, height: width < 400 ? 50 : 70, }}
                />
                <Text className="flex-1 pl-4">
                    Você selecionou pagamento em dinheiro informe se precisa de troco ?
                </Text>
            </View>
            <View className="flex flex-col gap-7 items-center justify-center mt-8">
                <TouchableOpacity
                    className="rounded-2xl py-5 px-8"
                    style={[{ backgroundColor: needsChange === true ? themeColors.bgColor(1) : themeColors.bgColor(0.7) }]}
                    onPress={() => setNeedsChange(true)}
                >
                    <Text className="text-white text-center font-bold text-3xl">SIM</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    className="rounded-2xl py-5 px-8"
                    style={[{ backgroundColor: needsChange === false ? themeColors.bgColor(1) : themeColors.bgColor(0.7) }]}
                    onPress={() => setNeedsChange(false)}
                >
                    <Text className="text-white text-center font-bold text-3xl">NÃO</Text>
                </TouchableOpacity>
            </View>
            <View
            >
                {needsChange && (
                    <View style={{ backgroundColor: themeColors.bgColor(0.2) }}
                        className="p-6 px-8 rounded-t-3xl space-y-4 h-full w-full mt-[10%]">
                        <Text className="mb-2 text-lg text-center">
                            Troco pra quanto ?
                        </Text>
                        <View
                            style={{ borderColor: themeColors.bgColor(0.8) }}
                            className="mb-[30%] border rounded-xl text-center text-lg"
                        >
                            <TextInput
                                className="p-3 rounded-xl text-center text-lg bg-white "
                                onChangeText={setChangeAmount}
                                value={changeAmount}
                                keyboardType="numeric"
                                placeholder="Digite o valor"
                                editable={needsChange === true} // O input será editável somente se needsChange for true
                            />
                        </View>

                        <TouchableOpacity
                            className="rounded-2xl py-3 px-5 w-full"
                            style={{ backgroundColor: themeColors.bgColor(1) }}
                            onPress={handleConfirmChangeNeeded}
                        >
                            <Text className="text-white text-center font-bold text-lg">
                                CONFIRMAR VALOR
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}
                {!needsChange && (
                    <View style={{ backgroundColor: themeColors.bgColor(0.2) }}
                        className="p-6 px-8 rounded-t-3xl space-y-4 h-full w-full mt-[70%]"
                    >
                        <TouchableOpacity
                            className="rounded-2xl py-3 px-5"
                            style={{ backgroundColor: themeColors.bgColor(1) }}
                            onPress={handleConfirmChangeNeeded}
                        >
                            <Text className="text-white text-center font-bold text-lg">CONFIRMAR</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </View>
    );
}




