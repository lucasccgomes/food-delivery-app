import { View, Text, TouchableOpacity, Image, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react'
import * as Icon from "react-native-feather";
import { featured } from '../constants'
import { themeColors } from '../theme';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { selectEstablishment } from '../slices/establishmentSlice';
import { selectCartItems, selectCartTotal } from '../slices/cartSlice';

export default function Cart() {
    const establishment = useSelector(selectEstablishment)
    const navigation = useNavigation()
    const cartItems = useSelector(selectCartItems)
    const cartTotal = useSelector(selectCartTotal)
    const [grupedItems, setGroupedItems] = useState({})
    const 

    useEffect(() => {
        const items = cartItems.reduce((group, item) => {
            if (group[item.id]) {
                group[item.id].push(item)
            } else {
                group[item.id] = [item]
            }
            return group;
        }, {})
        setGroupedItems(items)
    }, [cartItems])

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
                    className="absolute z-10 rounded-full p-1 top-5 left-2"
                >
                    <Icon.ArrowLeft strokeWidth={3} stroke="white" />
                </TouchableOpacity>
            </View>
            <View>
                <Text className="text-center font-bold text-xl">
                    Meu Carrinho
                </Text>
                <Text className="text-center text-gray-500">
                    {establishment.name}
                </Text>
            </View>


            {/*Tempo*/}
            <View style={{ backgroundColor: themeColors.bgColor(0.2) }}
                className="flex-row px-4 items-center"
            >
                <Image
                    source={require('../assets/images/bikeGuy.png')}
                    className="w-20 h-20 rounded-full"
                />
                <Text className="flex-1 pl-4">
                    Entrega em 20-30 minutos
                </Text>
                <TouchableOpacity>
                    <Text className="font-bold " style={{ color: themeColors.text }}>
                        Mudar
                    </Text>
                </TouchableOpacity>
            </View>

            {/*Pratos */}
            {/* AS PROPRIEDADE DE ESTILO NÃO ESTA PEGANDO NO SCROLLVIEW*/}
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    paddingBottom: 50,
                }}
                className="bg-white pt-5"
            >


                {
                    Object.entries(grupedItems).map(([key, items]) => {
                        let dish = items[0];
                        return (
                            <View
                                key={key}
                                className="flex-row items-center mt-2 space-x-3 py-2 px-4 bg-white rounded-3xl mx-2 mb-3 "
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
                                <Text className="font-bold " style={{ color: themeColors.text }}>
                                    {items.length} x
                                </Text>
                                <Image className="h-14 w-14 rounded-full"
                                    source={dish.image}
                                />
                                <Text className="flex-1 font-bold text-gray-700">
                                    {dish.name}
                                </Text>
                                <Text className="font-semibold text-base">
                                    R${dish.price}
                                </Text>
                                <TouchableOpacity
                                    style={{ backgroundColor: themeColors.bgColor(1), borderRadius: 50, padding: 2 }}
                                >
                                    <Icon.Minus stroke="white" strokeWidth={2} height={20} width={20} />
                                </TouchableOpacity>
                            </View>
                        )
                    })
                }

            </ScrollView>

            {/*Total*/}
            <View
                style={{ backgroundColor: themeColors.bgColor(0.2) }}
                className="p-6 px-8 rounded-t-3xl space-y-4">

                <View className="flex-row justify-between">
                    <Text className="text-gray-700">Subtotal</Text>
                    <Text className="text-gray-700">R$20</Text>
                </View>

                <View className=" flex-row justify-between">
                    <Text className="text-gray-700">Taxa de entrega</Text>
                    <Text className="text-gray-700">R$0,25</Text>
                </View>

                <View className="flex-row justify-between">
                    <Text className="text-gray-700 font-extrabold">Total do pedido</Text>
                    <Text className="text-gray-700 font-extrabold">R$20,25</Text>
                </View>
                <View>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('MakeWish')}
                        style={{ backgroundColor: themeColors.bgColor(1) }}
                        className="p-3 rounded-full"
                    >
                        <Text className="text-white text-center font-bold text-lg">
                            Fazer Pedido
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    )
}