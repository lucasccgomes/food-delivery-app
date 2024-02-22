import { View, Text, TouchableOpacity, Image, ScrollView } from 'react-native'
import React, { useState } from 'react';
import * as Icon from "react-native-feather";
import { themeColors } from '../theme';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { handleIntegrationMP } from '../services/mercadopago/pagamentoService';
import { WebView } from 'react-native-webview';


export default function Pay() {
    const totalOrderValue = useSelector(state => state.cart.totalValue);
    const navigation = useNavigation();
    const [paymentUrl, setPaymentUrl] = useState('');
    const taxaCartao = (5 / 100) * totalOrderValue;
    const taxaCartaoFor = parseFloat(taxaCartao.toFixed(3));
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);

    const handleBuy = async () => {
        const url = await handleIntegrationMP();
        setPaymentUrl(url);
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
                    className="absolute z-10 rounded-full p-3  top-5 left-8"
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
                {/*Selecione Meio de Pagamento*/}
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


                {/*<WebView
                    source={{ uri: paymentUrl }}
                    style={{ flex: 1 }}
                />*/}


                <View className="items-center">
                    <View className="flex-row items-center w-72 mt-2 space-x-3 py-2 px-4 bg-white rounded-3xl mx-2 mb-3 "
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
                        <Image
                            source={require('../assets/images/pix.png')}
                            className="w-24 h-20 my-1"
                        />
                        <Text>
                            Pix
                        </Text>
                    </View>
                    <View className="flex-row items-center w-72 mt-2 space-x-3 py-2 px-4 bg-white rounded-3xl mx-2 mb-3 "
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
                        <Image
                            source={require('../assets/images/cardcredito.png')}
                            className="w-24 h-20  my-1"
                        />
                        <Text>
                            Cartão de Credito
                        </Text>
                    </View>
                    <View className="flex-row items-center w-72 mt-2 space-x-3 py-2 px-4 bg-white rounded-3xl mx-2 mb-3 "
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
                        <Image
                            source={require('../assets/images/dinheiro.png')}
                            className="w-24 h-20 my-1"
                        />
                        <Text>
                            Dinheiro
                        </Text>
                    </View>
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
                        onPress={handleBuy}
                        style={{ backgroundColor: themeColors.bgColor(1) }}
                        className="p-3 rounded-full"
                    >
                        <Text className="text-white text-center font-bold text-lg">
                            Pagar
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>

    )
}
