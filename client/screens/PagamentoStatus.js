import { View, Text, StatusBar, TouchableOpacity, Image, Dimensions, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react';
import { BackHandler } from 'react-native';
import { useRoute } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import { useUser } from '../context/UserContext';
import * as Icon from "react-native-feather";
import { themeColors } from '../theme';

const { width, height } = Dimensions.get('window');

export default function PagamentoStatus({ navigation }) {
  const [pedidoInfo, setPedidoInfo] = useState(null);
  const route = useRoute();
  const { prefId } = route.params;
  const { user } = useUser();

  useEffect(() => {
    if (prefId) {
      const pedidoRef = firestore()
        .collection('usuarios')
        .doc(user.uid)
        .collection('pedidos')
        .doc(prefId);

      const unsubscribe = pedidoRef.onSnapshot(docSnapshot => {
        if (docSnapshot.exists) {
          const pedidoData = docSnapshot.data();
          setPedidoInfo(pedidoData); // Agora você tem todas as informações do pedido
        } else {
          console.log('Pedido não encontrado');
        }
      }, err => {
        console.error('Erro ao buscar informações do pedido:', err);
      });

      // Lembre-se de desinscrever do listener quando o componente é desmontado
      return () => unsubscribe();
    }
  }, [prefId]);

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
    <View className="h-full"
      style={{ backgroundColor: themeColors.bgColor(0.3) }}
    >
      <View className="flex-1 mt-14">
        <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
        <View className=" z-40 relative py-4 "
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
            top: width < 400 ? 55 : 0,
          }}
        >
          <TouchableOpacity
            onPress={() => navigation.navigate('Home')}
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
            className="absolute rounded-full p-3  top-1 right-8"
          >
            <Icon.X strokeWidth={3} stroke="white" />
          </TouchableOpacity>
        </View>

        <View className="flex justify-center items-center "
          style={{ marginTop: width < 400 ? -63 : 0, }}
        >
          <View
            style={{ display: width < 400 ? 'none' : 'flex', }}
            className="flex justify-center items-center h-24 w-24 rounded-full bg-green-600">
            <Icon.Check
              strokeWidth={3} width={70} height={70} stroke="white" />
          </View>
          <Text className="text-2xl font-bold mt-7">Informações do Pedido</Text>
          {pedidoInfo ? (
            <>

              <View className="flex justify-center items-center bg-orange-50 opacity-80 p-1 rounded-2xl m-1">
                <View className="border-2 rounded-2xl p-3"
                  style={{ borderColor: themeColors.bgColor(0.4) }}
                >
                  <View className="flex justify-start items-start">
                    <View className="flex flex-row mb-1 ">
                      <Text className="font-bold">Nome: </Text>
                      <Text>{pedidoInfo.Nome_2}</Text>
                    </View>

                    <View className="flex flex-row mb-1 ">
                      <Text className="font-bold">N. Pedido: </Text>
                      <Text >{pedidoInfo.numpedido}</Text>
                    </View>

                    <View className="flex flex-row mb-1 ">
                      <Text className="font-bold">Tipo de Pagamento: </Text>
                      <Text >{pedidoInfo.TipoPagamento}</Text>
                    </View>

                    <View className="flex flex-row mb-1 ">
                      <Text className="font-bold">Pagamento: </Text>
                      <Text>{pedidoInfo.status === 'approved' ? 'Aprovado' : pedidoInfo.status}</Text>
                    </View>

                    <View className="flex justify-center items-center w-full">
                      <View className="flex flex-col mt-3 border-y border-dashed pt-2 pb-5 justify-center items-center">
                        {pedidoInfo.EnderecoEntrega ? (
                          <>
                            <Text className="font-bold text-center text-lg mb-2">Endereço de Entrega</Text>
                            <Text>{pedidoInfo.EnderecoEntrega}</Text>
                          </>
                        ) : (
                          <>
                            <Text className="font-bold text-center text-lg mb-2">Endereço de Retirada</Text>
                            <Text>{pedidoInfo.EnderecoRetirada}</Text>
                          </>
                        )}
                      </View>
                    </View>

                  </View>

                  {pedidoInfo && pedidoInfo.itemsDoPedido && (
                    <View className="flex flex-col mt-2">
                      <Text className="font-bold text-center text-xl mb-2">Pedido</Text>

                      <ScrollView style={{ maxHeight: width < 400 ? 75 : 100 }}>
                        {pedidoInfo.itemsDoPedido.map((item, index) => (
                          <View key={index} className="flex flex-row justify-between ">
                            <Text className="mr-4">{item.title}</Text>
                            <Text><Text className="font-bold">Qtd: </Text>{`${item.quantity}`}</Text>
                          </View>
                        ))}
                      </ScrollView>

                    </View>
                  )}

                  <View className="flex flex-row mt-5 border-t border-dashed pt-3">
                    <Text className="font-bold text-xl">Total: </Text>
                    <Text className="text-xl">{`R$${pedidoInfo.ValorTotal.toFixed(2)}`}</Text>
                  </View>

                  <View className="flex flex-col mt-8 p-2 rounded-xl"
                    style={{ marginTop: width < 400 ? 4 : 15, backgroundColor: themeColors.bgColor(0.5) }}
                  >
                    <Text className="font-bold text-center text-lg">Status do Pedido</Text>
                    <Text className="text-center">{pedidoInfo.StatusEntrega}</Text>
                  </View>
                </View>
              </View>
              {/* Adicione mais campos conforme necessário */}
            </>
          ) : (

            <View className="flex justify-center items-center h-full">
              <Image source={require('../assets/images/carregando_02.gif')} className="h-40 w-40" />
            </View>

          )}
        </View>
      </View>
    </View >
  );
};