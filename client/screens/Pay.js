import { View, Text, TouchableOpacity, Image, ScrollView, Modal, TextInput } from 'react-native'
import React, { useEffect, useState } from 'react';
import * as Icon from "react-native-feather";
import { themeColors } from '../theme';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { handleIntegrationMP } from '../services/mercadopago/pagamentoService';
import { WebView } from 'react-native-webview';
import { useUser } from '../context/UserContext';
import firestore from '@react-native-firebase/firestore';
import { emptyCart } from '../slices/cartSlice';
import { useDispatch } from 'react-redux';



export default function Pay() {
    const dispatch = useDispatch();

    const { user } = useUser();

    const totalOrderValue = useSelector(state => state.cart.totalValue);

    const navigation = useNavigation();

    const [paymentUrl, setPaymentUrl] = useState('');

    const [taxaCartao, setTaxaCartao] = useState(0);

    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [showWarningModal, setShowWarningModal] = useState(false);
    const [showChangeModal, setShowChangeModal] = useState(false);
    const [showSelectChangeModal, setShowSelectChangeModal] = useState(false);

    const [changeAmount, setChangeAmount] = useState('');
    const [needsChange, setNeedsChange] = useState(false);
    const [changeNeeded, setChangeNeeded] = useState('');

    console.log('Troco para:', changeAmount)
    console.log('Cliente:', changeNeeded)
    console.log('Meio de pagamento:', selectedPaymentMethod)
    console.log('ID do Usuario (PAY):', user.uid)

    const extractPrefIdFromUrl = (url) => {
        try {
            const params = new URLSearchParams(url.split('?')[1]);
            return params.get('pref_id');
        } catch (error) {
            console.error('Erro ao extrair o pref_id da URL:', error);
            return null; // Retorna null em caso de erro
        }
    };

    const waitAndCheckPaymentStatus = async (userId, prefId, maxWaitTime = 60000, interval = 5000) => {
        const startTime = Date.now();
        while (Date.now() - startTime < maxWaitTime) {
            const status = await checkPaymentStatus(userId, prefId);
            if (status === 'approved') {
                return status;
            }
            await new Promise(resolve => setTimeout(resolve, interval)); // Espera por um intervalo antes de verificar novamente
        }
        return null; // Retorna null se o pagamento não for aprovado dentro do tempo máximo
    };

    const handleConfirm = () => {
        if (selectedPaymentMethod === 'Dinheiro' && changeNeeded === '') {
            setShowSelectChangeModal(true);
        } else {
            navigation.navigate('AguardandoPedido', { changeNeeded, changeAmount });
        }
    };

    useEffect(() => {
        if (selectedPaymentMethod !== 'Dinheiro') {
            setChangeNeeded('');
            setChangeAmount('');
        }
    }, [selectedPaymentMethod]);

    useEffect(() => {
        if (selectedPaymentMethod === 'Cartão de Crédito') {
            setTaxaCartao((5 / 100) * totalOrderValue);
        } else {
            setTaxaCartao(0);
        }
    }, [selectedPaymentMethod, totalOrderValue]);

    const taxaCartaoFor = parseFloat(taxaCartao.toFixed(2));

    const checkPaymentStatus = async (userId, prefId) => {
        try {
            const paymentRef = firestore().collection('usuarios').doc(userId).collection('pedidos').doc(prefId);
            const paymentSnapshot = await paymentRef.get();
            if (paymentSnapshot.exists) {
                const paymentData = paymentSnapshot.data();
                if (paymentData && paymentData.status) {
                    return paymentData.status;
                }
            }
            return null; // Retorna null se o documento não existir ou não tiver status
        } catch (error) {
            console.error('Erro ao verificar o status do pagamento:', error);
            return null; // Retorna null em caso de erro
        }
    };

    const handleBuy = async (selectedPaymentMethod, setPaymentUrl, setIsModalVisible, navigation, userId) => {
        if (!selectedPaymentMethod) {
            setShowWarningModal(true); // Mostra o modal de aviso
        } else {
            const url = await handleIntegrationMP(selectedPaymentMethod);
            setPaymentUrl(url);
            setIsModalVisible(true);

            // Extrair o pref_id da URL
            const prefId = extractPrefIdFromUrl(url);

            if (prefId) {
                // Esperar e verificar o status do pagamento
                const paymentStatus = await waitAndCheckPaymentStatus(userId, prefId);
                if (paymentStatus === 'approved') {
                    setIsModalVisible(false); // Fechar a WebView
                    navigation.navigate('PagamentoStatus'); // Navegar para a tela de pagamento aprovado
                    dispatch(emptyCart());
                } else {
                    // O pagamento não foi aprovado dentro do tempo máximo
                    console.log('O pagamento não foi aprovado dentro do tempo máximo.');
                }
            } else {
                // Não foi possível extrair o pref_id da URL
                console.log('Não foi possível extrair o pref_id da URL.');
            }
        }
    };

    const handlePaymentButtonClick = () => {
        if (!selectedPaymentMethod) {
            setShowWarningModal(true); // Mostra o modal de aviso
        } else {
            handleBuy(selectedPaymentMethod, setPaymentUrl, setIsModalVisible, navigation, user.uid);
        }
    };

    return (
        <View className="bg-white flex-1 mt-10 rounded-2xl">

            {/* Botão de Voltar */}
            <View className=" relative py-4 "
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
                    onPress={() => navigation.navigate('PagamentoStatus')}
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
                    className="rounded-full p-3  top-5 left-8"
                >
                    <Icon.ArrowLeft strokeWidth={3} stroke="white" />
                </TouchableOpacity>
            </View>

            <View>
                <Text className="text-center font-bold text-xl ml-6 -mt-1">
                    Forma de Pagamento
                </Text>
                <Text className="text-center text-gray-500">

                </Text>
            </View>

            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>

                {/* Texto Selecione Meio de Pagamento*/}
                <View style={{ backgroundColor: themeColors.bgColor(0.2) }}
                    className="flex-row px-4 items-center"
                >
                    <Image
                        source={require('../assets/images/paymet.png')}
                        className="w-20 h-20 rounded-full my-1"
                    />
                    <Text className="flex-1 pl-4">
                        Selecione um meio de pagamento
                    </Text>
                </View>

                {/* Modals de mensagens */}
                <Modal
                    animationType="slide"
                    transparent={false}
                    visible={isModalVisible}
                    onRequestClose={() => {
                        setIsModalVisible(!isModalVisible);
                    }}
                >
                    <TouchableOpacity
                        onPress={() => setIsModalVisible(false)}
                        style={{ backgroundColor: themeColors.bgColor(1) }}
                        className="p-3 rounded-full mb-4 mx-3"
                    >
                        <Text className="text-white text-center font-bold text-lg">
                            Sair
                        </Text>
                    </TouchableOpacity>
                    <WebView source={{ uri: paymentUrl }} style={{ flex: 1 }} className="" />

                </Modal>

                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={showWarningModal}
                    onRequestClose={() => setShowWarningModal(false)}
                >
                    <TouchableOpacity className="h-full flex justify-center items-center"
                        onPressOut={() => setShowWarningModal(false)} >
                        <View
                            className=" border w-[85%] -mb-[450px] rounded-xl p-2"
                            style={{
                                backgroundColor: themeColors.bgColor(0.2),
                                borderColor: themeColors.bgColor(0.1),
                            }}
                        >
                            <Text className="text-xs text-center text-red-500">
                                Você precisa selecionar um meio de pagamento!
                            </Text>
                        </View>
                    </TouchableOpacity>
                </Modal>

                <Modal
                    visible={showChangeModal}
                    transparent={true}
                    animationType="slide"
                    onRequestClose={() => setShowChangeModal(false)}
                >
                    <TouchableOpacity
                        className="flex items-center justify-center h-full"
                        activeOpacity={1}
                        onPressOut={() => setShowChangeModal(false)}
                    >
                        <View
                            className="py-2 px-6 -mt-[30%] rounded-xl"
                            style={{
                                backgroundColor: themeColors.btPay,
                                borderColor: themeColors.bgColor(0.1),
                            }}
                        >
                            <Text className="text-lg font-bold">VOCÊ PRECISA DE TROCO ?</Text>
                            <View className="flex flex-row items-center justify-center mt-4">
                                <TouchableOpacity
                                    className="rounded-2xl p-2 mr-3"
                                    style={{
                                        backgroundColor: themeColors.bgColor(1),
                                    }}
                                    onPress={() => { setNeedsChange(true); }}>
                                    <Text className="text-white text-center font-bold text-lg">
                                        SIM
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    className="rounded-2xl p-2"
                                    style={{
                                        backgroundColor: themeColors.bgColor(1),
                                    }}
                                    onPress={() => {
                                        setNeedsChange(false);
                                        setChangeNeeded('NÃO PRECISO DE TROCO');
                                        setChangeAmount('')
                                        setShowChangeModal(false);
                                    }}>
                                    <Text className="text-white text-center font-bold text-lg">
                                        NÃO
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {needsChange && (
                                <>
                                    <TextInput
                                        className="bg-white text-center my-3 text-lg p-2 rounded-lg"
                                        onChangeText={setChangeAmount}
                                        value={changeAmount}
                                        placeholder="TROCO PRA QUANTO ?"
                                        keyboardType="numeric"
                                    />
                                    <TouchableOpacity
                                        className="rounded-2xl p-2"
                                        style={{
                                            backgroundColor: themeColors.bgColor(1),
                                        }}
                                        onPress={() => { setChangeNeeded(`TROCO PARA ${changeAmount}`); setShowChangeModal(false); }}

                                    >
                                        <Text className="text-white text-center font-bold text-lg">
                                            OK
                                        </Text>
                                    </TouchableOpacity>
                                </>
                            )}
                        </View>
                    </TouchableOpacity>
                </Modal>

                <Modal
                    visible={showSelectChangeModal}
                    transparent={true}
                    animationType="slide"
                    onRequestClose={() => setShowSelectChangeModal(false)}
                >
                    <TouchableOpacity
                        className="h-full flex justify-center items-center"
                        activeOpacity={1}
                        onPressOut={() => setShowSelectChangeModal(false)}
                    >
                        <View
                            className=" border w-[85%] -mb-[450px] rounded-xl p-2"
                            style={{
                                backgroundColor: themeColors.bgColor(0.2),
                                borderColor: themeColors.bgColor(0.1),
                            }}
                        >
                            <Text className="text-xs text-center text-red-500">
                                É preciso informar se você precisa de troco!
                            </Text>
                        </View>
                    </TouchableOpacity>
                </Modal>

                {/* Meios de Pagamento*/}
                <View className="flex justify-center items-center h-[80%]">
                    <TouchableOpacity
                        onPress={() => setSelectedPaymentMethod('Pix')}
                        className="flex-row items-center w-72 mt-2 space-x-3 py-2 px-4 rounded-3xl mx-2 mb-3 "
                        style={{
                            backgroundColor: selectedPaymentMethod === 'Pix' ? themeColors.btPay : 'white',
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
                        <Image
                            source={require('../assets/images/pix.png')}
                            className="w-24 h-20 my-1"
                        />
                        <Text>
                            Pix
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => setSelectedPaymentMethod('Cartão de Crédito')}
                        className="flex-row items-center w-72 mt-2 space-x-3 py-2 px-4 bg-white rounded-3xl mx-2 mb-3 "
                        style={{
                            backgroundColor: selectedPaymentMethod === 'Cartão de Crédito' ? themeColors.btPay : 'white',
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
                        <Image
                            source={require('../assets/images/cardcredito.png')}
                            className="w-24 h-20  my-1"
                        />
                        <Text>
                            Cartão de Credito
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => { setShowChangeModal(true); setSelectedPaymentMethod('Dinheiro'); }}
                        className="flex-row items-center w-72 mt-2 space-x-3 py-2 px-4 bg-white rounded-3xl mx-2 mb-3 "
                        style={{
                            backgroundColor: selectedPaymentMethod === 'Dinheiro' ? themeColors.btPay : 'white',
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
                        <Image
                            source={require('../assets/images/dinheiro.png')}
                            className="w-24 h-20 my-1"
                        />
                        <Text>
                            Dinheiro
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/*Total*/}
            <View
                style={{ backgroundColor: themeColors.bgColor(0.2) }}
                className="p-6 px-8 rounded-t-3xl space-y-4">

                <View className="flex-row justify-between">
                    <Text className="text-gray-700">Taxa do Cartão</Text>
                    <Text className="text-gray-700">R${taxaCartaoFor}</Text>
                </View>
                <View className="flex-row justify-between">
                    <Text className="text-gray-700 font-extrabold">Total do Pedido</Text>
                    <Text className="text-gray-700 font-extrabold">R${totalOrderValue + taxaCartaoFor}</Text>
                </View>
                <View>
                    <TouchableOpacity
                        onPress={() => {
                            if (selectedPaymentMethod === 'Dinheiro') {
                                handleConfirm();
                            } else {
                                handlePaymentButtonClick();
                            }
                        }} style={{ backgroundColor: themeColors.bgColor(1) }}
                        className="p-3 rounded-full"
                    >
                        <Text className="text-white text-center font-bold text-lg">
                            {selectedPaymentMethod === 'Dinheiro' ? 'CONFIRMAR' : 'PAGAR'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>

    )
}
