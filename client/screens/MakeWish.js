import { View, Text, Image } from 'react-native'
import React, { useEffect } from 'react'
import { useNavigation } from '@react-navigation/native'

export default function FazerPedido() {

    const navigation = useNavigation();

    useEffect(() => {
        const timer = setTimeout(() => {
          console.log('Navegando para Delivery');
          navigation.navigate('Delivery');
        }, 3000);
      
        return () => clearTimeout(timer);
      }, []);

    return (
        <View className="flex-1 bg-white justify-center items-center">
            <Image
                source={require('../assets/images/delivery.gif')}
                className="h-80 w-80"
            />
        </View>
    )
}