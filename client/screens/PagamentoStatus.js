import { View, Text } from 'react-native'
import React, { useEffect } from 'react';
import { BackHandler } from 'react-native';


export default function PagamentoStatus({ navigation }) {
    useEffect(() => {
        const backHandler = BackHandler.addEventListener(
          'hardwareBackPress',
          () => {
            navigation.navigate('Home'); // Substitua 'Home' pelo nome da sua tela Home
            return true; // Previne a ação padrão do botão de voltar
          }
        );
    
        return () => backHandler.remove();
      }, []);

    return (
        <View className="flex-1 h-full w-full items-center justify-center">
          <Text>Status Pagante</Text>
        </View>
    )
}