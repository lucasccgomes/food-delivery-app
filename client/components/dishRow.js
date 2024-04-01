import { View, Text, Image, TouchableOpacity, Dimensions } from 'react-native'
import React from 'react'
import { themeColors } from '../theme'
import * as Icon from "react-native-feather";
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, selectCartItemsById, removeFromCart } from '../slices/cartSlice';
import { urlFor } from '../services/sanity/sanity';

const { width, height } = Dimensions.get('window');

export default function DishRow({ item, qtdEstoque }) {
    const dispatch = useDispatch()

    const totalItems = useSelector(state => selectCartItemsById(state, item._id))

    const handleIcrease = () => {
        if (totalItems.length < qtdEstoque) {
            dispatch(addToCart({ ...item }));
        } else {
            // Aqui você pode adicionar uma mensagem ou ação que informa o usuário que ele atingiu o limite
            console.log('Você atingiu a quantidade máxima disponível em estoque.');
        }
    };

    const handleDecrease = () => {
        dispatch(removeFromCart({ id: item._id }));
    };

    const isIncreaseDisabled = totalItems.length >= qtdEstoque;

    return (
        <View
            className="flex-row items-center bg-white p-3 rounded-3xl shadow-2xl mb-4 mx-2"
            style={{
                shadowRadius: 7,
                shadowColor: themeColors.bgColor(1),
                shadowOffset: {
                    width: 0,
                    height: 0,
                },
                shadowOpacity: 0.44,
                shadowRadius: 10.32,
                elevation: 8,
            }}
        >
            <Image className="rounded-3xl"
                style={{ height: 100, width: 100 }}
                source={{ uri: urlFor(item.image).url() }} />
            <View className="flex flex-1 space-y-3">
                <View className="pl-3">
                    <Text className="font-bold"
                        style={{ fontSize: width < 400 ? 16 : 17, }}
                    >
                        {item.name}
                    </Text>
                    <Text className="text-gray-700"
                        style={{ fontSize: width < 400 ? 12 : 12, }}
                    >
                        {item.description}
                    </Text>

                </View>
                <View className="flex-row justify-between pl-3 items-center">
                    <Text className="text-gray-700 font-bold text-lg">
                        R${item.valor}
                    </Text>
                    <View className="flex-row items-center">
                        <Text className="text-gray-700 font-bold mr-2"
                         style={{ fontSize: width < 400 ? 12 : 12, }}
                        >
                         {width < 400 ? 'Disp.:' : 'Disponível:'} {qtdEstoque}
                        </Text>
                        <TouchableOpacity
                            onPress={handleDecrease}
                            disabled={!totalItems.length}
                            className="p-1 rounded-full"
                            style={{ backgroundColor: themeColors.bgColor(1) }}
                        >
                            <Icon.Minus strokeWidth={2} height={20} width={20} stroke={"white"} />
                        </TouchableOpacity>
                        <Text className="px-3">
                            {totalItems.length}
                        </Text>
                        <TouchableOpacity
                            onPress={handleIcrease}
                            disabled={isIncreaseDisabled}
                            className="p-1 rounded-full"
                            style={{ backgroundColor: isIncreaseDisabled ? 'grey' : themeColors.bgColor(1) }}
                        >
                            <Icon.Plus strokeWidth={2} height={20} width={20} stroke={"white"} />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    )
}