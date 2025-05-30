// ESTE COMPONENTE É UTILIZADO APENAS SE A HOME FOR PARA VARIOS ESTABELECIMENTO









import { View, Text, TouchableNativeFeedback, Image } from 'react-native'
import React from 'react'
import AppStyles from '../shadow';
import * as Icon from "react-native-feather";
import { themeColors } from '../theme';
import { useNavigation } from '@react-navigation/native';
import { urlFor } from '../services/sanity/sanity';

export default function RestaurantCard({ item }) {

    const navigation = useNavigation();
    console.log('item', item);
    

    return (
        <TouchableNativeFeedback
        onPress={() => navigation.navigate('Establishment', {...item})}
        >
            <View className="mr-8 mb-9 bg-white rounded-3xl "
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

                <Image className="h-36 w-64 rounded-t-3xl" source={{uri: urlFor(item.image).url()}} />

                <View className="px-3 pb-4 space-y-2">
                    <Text className="text-lg font-bold pt-2">
                        {item.name}
                    </Text>

                    <View className="flex-row items-center space-x-1">
                        <Image source={require('../assets/images/fullStar.png')} className="h-4 w-4" />
                        <Text className="text-green-700">
                            {item.avaliacao}
                        </Text>
                        <Text className="text-gray-700">
                            ({item.avaliacoes} Vendas) . <Text className="font-semibold">
                                {item?.tipo?.name}
                            </Text>
                        </Text>
                    </View>

                    <View className="flex-row items-center space-x-1">
                        <Icon.MapPin color="gray" width="15" height="15" />
                        <Text className="text-gray-700 text-xs">Sagres. {item.endereco}</Text>
                    </View>

                </View>
            </View>
        </TouchableNativeFeedback>
    )
}