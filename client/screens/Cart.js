import { View, Text, TouchableOpacity, Image, ScrollView, Modal, Button } from 'react-native'
import React, { useEffect, useState } from 'react'
import * as Icon from "react-native-feather";
import { themeColors } from '../theme';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { selectEstablishment } from '../slices/establishmentSlice';
import { removeFromCart, selectCartItems, selectCartTotal, updateTotalValue } from '../slices/cartSlice';
import { urlFor } from '../services/sanity/sanity';
import { useUser } from '../context/UserContext';
import firestore from '@react-native-firebase/firestore'


export default function Cart() {
    const [modalVisible, setModalVisible] = useState(false);
    const [deliveryOption, setDeliveryOption] = useState('Entrega');
    const { user } = useUser();
    const establishment = useSelector(selectEstablishment);
    const navigation = useNavigation();
    const cartItems = useSelector(selectCartItems);
    const cartTotal = useSelector(selectCartTotal);
    const [groupedItems, setGroupedItems] = useState({});
    const dispatch = useDispatch();
    const [deliveryFee, setDeliveryFee] = useState(2);

    useEffect(() => {
        const items = cartItems.reduce((group, item) => {
            (group[item._id] = group[item._id] || []).push(item);
            return group;
        }, {});
        setGroupedItems(items);
    }, [cartItems]);

    useEffect(() => {
        const total = deliveryFee + cartTotal;
        dispatch(updateTotalValue(total));
    }, [cartTotal, deliveryFee, dispatch]);

    const fazerPedido = async () => {
        if (!user) {
            console.error('Usuário não está logado');
            return;
        }

        // Primeiro, agrupamos os itens pelo ID e somamos as quantidades
        const groupedItemsById = cartItems.reduce((acc, item) => {
            const existingItem = acc[item._id];
            if (existingItem) {
                existingItem.quantidade += 1;
            } else {
                acc[item._id] = { ...item, quantidade: 1 };
            }
            return acc;
        }, {});

        // Em seguida, mapeamos os itens agrupados para o formato desejado
        const itensAgrupados = Object.values(groupedItemsById).map(item => ({
            title: item.name,
            description: item.description,
            pictureurl: urlFor(item.image).url(),
            category_id: item._type,
            quantity: item.quantidade,
            currency_id: "BRL",
            unit_price: item.valor,

        }));


        const pedido = {
            NomeDoUsuario: user.displayName,
            Email: user.email,
            TaxadeEntrega: deliveryFee,
            ValorTotal: deliveryFee + cartTotal,
            estabelecimento: establishment.name,
            criadoEm: firestore.FieldValue.serverTimestamp(),
            RetiradaEntrega: deliveryOption,
            itemsDoPedido: itensAgrupados,

        };


        try {
            await firestore().collection('usuarios').doc(user.uid).set(pedido, { merge: true });
            console.log("Pedido realizado com sucesso:", pedido);

            navigation.navigate('Pay', { itensAgrupados: itensAgrupados });// Coloque o nome correto da rota de confirmação do pedido aqui
        } catch (error) {
            console.error('Erro ao salvar o pedido:', error);
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
                <Text className="text-center font-bold text-xl">
                    Meu Carrinho
                </Text>
                <Text className="text-center text-gray-500">
                    {user.displayName}
                </Text>
            </View>


            {/*Tempo*/}
            <View style={{ backgroundColor: themeColors.bgColor(0.2) }}
                className="flex-row px-4 items-center"
            >
                <Image
                    source={deliveryOption === 'Entrega'
                        ? require('../assets/images/bikeGuy.png')
                        : require('../assets/images/retirada.png')}
                    style={{ width: 80, height: 80, borderRadius: 40 }}
                />
                <Text style={{ flex: 1, paddingLeft: 16 }}>
                    {deliveryOption === 'Entrega' ? 'Entrega em 20-30 minutos' : 'Retirar no Local'}
                </Text>
                <TouchableOpacity
                    onPress={() => setModalVisible(true)}>
                    <Text
                        className="font-bold "
                        style={{ color: themeColors.text }}>
                        Mudar
                    </Text>
                </TouchableOpacity>

                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => {
                        setModalVisible(!modalVisible);
                    }}
                >
                    <View className="bg-white border-4 py-3 px-2  mx-5 mt-24 rounded-2xl flex flex-row items-center justify-center"
                        style={{ borderColor: themeColors.bgColor(0.2) }}
                    >
                        <TouchableOpacity
                            style={{ backgroundColor: themeColors.bgColor(1) }}
                            className="p-3 rounded-full mr-3"
                            onPress={() => {
                                setDeliveryFee(2);
                                setDeliveryOption('Entrega');
                                setModalVisible(!modalVisible);
                            }}
                        >
                            <Text className="text-white text-center font-bold text-lg">
                                Entregar
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={{ backgroundColor: themeColors.bgColor(1) }}
                            className="p-3 rounded-full"
                            onPress={() => {
                                setDeliveryOption('Retirar no Local');
                                setModalVisible(!modalVisible);
                                setDeliveryFee(0);
                            }}
                        >
                            <Text className="text-white text-center font-bold text-lg">
                                Retirar no Local
                            </Text>
                        </TouchableOpacity>
                    </View>

                </Modal>
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
                    Object.entries(groupedItems).map(([key, items]) => (


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
                                source={{ uri: urlFor(items[0]?.image).url() }}
                            />
                            <Text className="flex-1 font-bold text-gray-700">
                                {items[0]?.name}
                            </Text>
                            <Text className="font-semibold text-base">
                                R${items[0]?.valor}
                            </Text>
                            <TouchableOpacity
                                onPress={() => dispatch(removeFromCart({ id: items[0]?._id }))}
                                style={{ backgroundColor: themeColors.bgColor(1), borderRadius: 50, padding: 2 }}
                            >
                                <Icon.Minus stroke="white" strokeWidth={2} height={20} width={20} />
                            </TouchableOpacity>
                        </View>

                    ))
                }

            </ScrollView>

            {/*Total*/}
            <View
                style={{ backgroundColor: themeColors.bgColor(0.2) }}
                className="p-6 px-8 rounded-t-3xl space-y-4">

                <View className="flex-row justify-between">
                    <Text className="text-gray-700">Subtotal</Text>
                    <Text className="text-gray-700">R${cartTotal}</Text>
                </View>

                <View className=" flex-row justify-between">
                    <Text className="text-gray-700">Taxa de entrega</Text>
                    <Text className="text-gray-700">R${deliveryFee}</Text>
                </View>

                <View className="flex-row justify-between">
                    <Text className="text-gray-700 font-extrabold">Total do pedido</Text>
                    <Text className="text-gray-700 font-extrabold">R${deliveryFee + cartTotal}</Text>
                </View>
                <View>
                    <TouchableOpacity
                        onPress={fazerPedido}
                        style={{ backgroundColor: themeColors.bgColor(1) }}
                        className="p-3 rounded-full"
                    >
                        <Text className="text-white text-center font-bold text-lg">
                            Confirmar Pedido
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    )
}
