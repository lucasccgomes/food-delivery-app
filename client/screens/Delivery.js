import { View, Text, Image, TouchableOpacity } from 'react-native'
import React from 'react'
import { useNavigation } from '@react-navigation/native';
import MapView, { Marker } from 'react-native-maps';
import { themeColors } from '../theme';
import * as Icon from "react-native-feather";
import { useDispatch, useSelector } from 'react-redux';
import { selectEstablishment } from '../slices/establishmentSlice';
import { emptyCart } from '../slices/cartSlice';

export default function Delivery() {
    console.log('Renderizando o componente Delivery');
    
    
    //então o problema esta deste ponto para baixo coloque console.log para ajudar a achar o erro
    const establishment = useSelector(selectEstablishment)
    console.log('Establishment:', establishment);

    const navigation = useNavigation();
    const dispatch = useDispatch();

    const cancelOrder = () => {
        console.log('Cancelando pedido');
        navigation.navigate('Home');
        dispatch(emptyCart());
    }

    console.log('Coordenadas do estabelecimento:', establishment.lat, establishment.lnt);

    return (
        <View className="flex-1">
            <MapView

                onMapReady={() => console.log('Mapa carregado')}
                onError={(e) => console.log('Erro ao carregar o mapa', e)}
                initialRegion={{
                    latitude: establishment.lat,
                    longitude: establishment.lnt,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                }}
                className="flex-1"
                mapType='standard'
            >
                <Marker
                    coordinate={{
                        latitude: establishment.lat,
                        longitude: establishment.lnt
                    }}
                    title={establishment.name}
                    description={establishment.description}
                    pinColor={themeColors.bgColor(1)}
                />

            </MapView>
            <View className="rounded-t-3xl -mt-12 bg-white relative">
                <View className="flex-row justify-between px-5 pt-10">
                    <View>
                        <Text className="text-lg text-gray-700 font-semibold">
                            Tempo Estimado
                        </Text>
                        <Text className="text-3xl font-extrabold text-gray-700">
                            20-30 Minutos
                        </Text>
                        <Text className="mt-2 font-semibold text-gray-700">
                            Seu pedido está a caminho
                        </Text>
                    </View>
                    <Image className="w-24 h-24" source={require('../assets/images/bikeGuy2.gif')} />
                </View>
                <View
                    style={{ backgroundColor: themeColors.bgColor(0.8) }}
                    className="p-2 flex-row justify-between items-center rounded-full my-5 mx-2"
                >
                    <View
                        style={{ backgroundColor: 'rgba(255,255, 255, 0.4)' }}
                        className="p-1 rounded-full"
                    >
                        <Image
                            className="h-16 w-16 rounded-full"
                            source={require('../assets/images/deliveryGuy.png')}
                        />
                    </View>
                    <View className="flex-1 ml-3 ">
                        <Text className="text-lg font-bold text-white">
                            Lucas Gomes
                        </Text>
                        <Text className="font-semibold text-white">
                            Seu Atendente
                        </Text>
                    </View>
                    <View className="flex-row items-center space-x-3 mr-3">
                        <TouchableOpacity className="bg-white p-2 rounded-full">
                            <Icon.Phone fill={themeColors.bgColor(1)} stroke={themeColors.bgColor(1)} strokeWidth={1} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={cancelOrder}
                            className="bg-white p-2 rounded-full">
                            <Icon.X stroke={'red'} strokeWidth={4} />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    )
}