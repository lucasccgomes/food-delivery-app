import { View, Text, Image, TouchableOpacity } from 'react-native'
import React from 'react'
import { themeColors } from '../theme'
import * as Icon from "react-native-feather";
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, removeFromCart, selectCartItemsById } from '../slices/cartSlice';
import { urlFor } from '../services/sanity/sanity';
import { useUser } from '../context/UserContext'; // Importe o hook useUser

export default function DishRow({ item, userId }) {

    console.log("UserId from props in DishRow:", userId);

    const dispatch = useDispatch()
    const totalItems = useSelector(state => selectCartItemsById(state, item._id))
    const { user } = useUser(); // Obtenha o usuário do contexto

    const { userId: userIdFromContext } = useUser();
    console.log("UserId from context in DishRow:", userIdFromContext);

    const handleIncrease = () => {
        dispatch(addToCart({ userId: userId, item: item }));
    }

    const handleDecrease = () => {
        dispatch(removeFromCart({ userId: userId, itemId: item._id }));
    }

    return (
        <View
            className="flex-row items-center bg-white p-3 rounded-3xl shadow-2xl mb-3 mx-2"
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
            <Image className="rounded-3xl"
                style={{ height: 100, width: 100 }}
                source={{ uri: urlFor(item.image).url() }} />
            <View className="flex flex-1 space-y-3">
                <View className="pl-3">
                    <Text className="text-xl">
                        {item.name}
                    </Text>
                    <Text className="text-gray-700">
                        {item.description}
                    </Text>
                </View>
                <View className="flex-row justify-between pl-3 items-center">
                    <Text className="text-gray-700 font-bold text-lg">
                        R${item.valor}
                    </Text>
                    <View className="flex-row items-center">
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
                            onPress={handleIncrease}
                            className="p-1 rounded-full"
                            style={{ backgroundColor: themeColors.bgColor(1) }}
                        >
                            <Icon.Plus strokeWidth={2} height={20} width={20} stroke={"white"} />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    )
}
