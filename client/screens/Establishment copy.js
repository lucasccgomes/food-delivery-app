import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StatusBar, SafeAreaView, Modal, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Icon from "react-native-feather";
import { themeColors } from '../theme';
import DishRow from '../components/dishRow';
import CartIcon from '../components/cartIcon';
import { useDispatch } from 'react-redux';
import { setEstablishment } from '../slices/establishmentSlice';
import { urlFor } from '../services/sanity/sanity';
import { getFeaturedEstablishmentById } from '../services/sanity/api';
import { useUser } from '../context/UserContext';
import firestore from '@react-native-firebase/firestore';
import messaging from '@react-native-firebase/messaging';


export default function Establishment() {
  const [item, setItem] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { user } = useUser();
  const [estoques, setEstoques] = useState({});


  const requestUserPermission = async () => {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log('Authorization status:', authStatus);
    }
  }

  useEffect(() => {
    if (requestUserPermission()) {
      messaging().getToken().then(token => {
        console.log('ToqueNotifica do User->', token)

        const userId = user.uid; // Garanta que a variável 'user' está acessível neste escopo
        firestore()
          .collection('usuarios')
          .doc(userId)
          .set({ notificationToken: token }, { merge: true })
          .then(() => {
            console.log('Token de notificação atualizado no Firestore');
          })
          .catch((error) => {
            console.error("Erro ao atualizar o token de notificação: ", error);
          });
  
        return token;
      })

      
    } else {
      console.log("Falha ao capturar token", authStatus)
    }

    //
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log(
            'Notificação causada app open from:',
            remoteMessage.notification,
          );
        }
      })

    messaging().onNotificationOpenedApp(remoteMessage => {
      console.log(
        'Notificação teste  background',
        remoteMessage.notification,
      )
    })

    messaging().setBackgroundMessageHandler(async remoteMessage => {
      console.log('Background Menmsahe', remoteMessage)

    })

    const unsubscribe = messaging().onMessage(async remoteMessage => {
      Alert.alert('A New FCM Messagem opa boa', JSON.stringify(remoteMessage))
    })

    return unsubscribe

  }, [])


  useEffect(() => {
    const id = '4d3f01bc-5a6f-4ac4-a190-0f592563b3e8';//id fixo do estabelecimento
    getFeaturedEstablishmentById(id).then(data => {
      const estabelecimento = data.estabelecimento[0];
      setItem(estabelecimento);
      if (estabelecimento && estabelecimento._id) {
        dispatch(setEstablishment(estabelecimento));
        saveToFirestore(estabelecimento);
      }
    });
  }, []);

  useEffect(() => {
    if (item && item.produtos) {
      const carolRef = firestore().collection('admin').doc('carol');
      const gerenciaEstoqueRef = carolRef.collection('GerenciaEstoque');
      item.produtos.forEach(produto => {
        gerenciaEstoqueRef.doc(produto._id).get().then((doc) => {
          if (doc.exists) {
            setEstoques(prevEstoques => ({ ...prevEstoques, [produto._id]: doc.data().qtdEstoque }));
          }
        });
      });
    }
  }, [item]);

  const saveToFirestore = (estabelecimento) => {
    const carolRef = firestore().collection('admin').doc('carol');
    const gerenciaEstoqueRef = carolRef.collection('GerenciaEstoque');

    estabelecimento.produtos.forEach(produto => {
      if (produto._id) {
        const produtoRef = gerenciaEstoqueRef.doc(produto._id);
        produtoRef.get().then((doc) => {
          if (doc.exists) {
          } else {
            produtoRef.set({
              nome: produto.name,
              qtdEstoque: 0,
            });
          }
        });
      } else {
        console.error('Produto sem _id:', produto);
      }
    });
  };

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('admin')
      .doc('carol')
      .collection('GerenciaEstoque')
      .onSnapshot(snapshot => {
        const newEstoques = {};
        snapshot.forEach(doc => {
          newEstoques[doc.id] = doc.data().qtdEstoque;
        });
        setEstoques(newEstoques);
      });
    return () => unsubscribe();
  }, []);

  if (!item) {
    return <Text>Carregando...</Text>;
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      <View style={{ flex: 1 }}>
        <CartIcon />
        <ScrollView>
          <View className="relative">
            {item && item.image && (
              <Image
                className="w-full h-72"
                source={{ uri: urlFor(item.image).url() }}
              />
            )}
            <TouchableOpacity
              onPress={() => navigation.navigate('Profile')}
              style={{ backgroundColor: themeColors.bgColor(0.4) }}
              className="absolute top-14 right-8 p-2 rounded-full shadow"
            >
              {user.photoURL && (
                <Image className="w-14 h-14 rounded-full"

                  source={{ uri: user.photoURL }}

                />
              )}
            </TouchableOpacity>
          </View>

          <View
            className="bg-white -mt-12 pt-6 "
            style={{
              borderTopLeftRadius: 40,
              borderTopRightRadius: 40,
            }}
          >

            <View className="px-5">
              <Text className="text-3xl font-bold">
                {item.name}
              </Text>
              <View className="flex-row space-x-2 my-1">
                <View className="flex-row items-center space-x-1">
                  <Image source={require('../assets/images/fullStar.png')} className="h-4 w-4" />
                  <Text className="text-green-700">
                    {item.avaliacao}
                  </Text>
                  <Text className="text-gray-700">
                    ({item.avaliacoes} Vendas)  -
                  </Text>
                </View>

                <View className="flex-row items-center space-x-1">
                  <Icon.MapPin color="gray" width="15" height="15" />
                  <Text className="text-gray-700 text-xs">Sagres. {item.endereco}</Text>
                </View>
              </View>
              <Text className="text-gray-500 mt-2">
                {item.description}
              </Text>
            </View>
          </View>
          <View className="pb-36 bg-white">
            <Text className="px-4 py-4 text-2xl font-bold">
              Menu
            </Text>

            {/* Sabores */}
            {
              item.produtos.map((produto, index) => (
                <DishRow
                  item={{ ...produto }}
                  key={index}
                  qtdEstoque={estoques[produto._id] || 0}
                />
              ))
            }
          </View>
          <Modal

            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => {
            }}>
            <View className="mt-[51.4%]">
              <View className="bg-gray-600 opacity-50 h-full rounded-t-[40px]">
                <Text className="text-center text-red-600 font-bold">FECAHDO NO MOMENTO</Text>
              </View>
            </View>
          </Modal>
        </ScrollView>
      </View>
    </SafeAreaView>
  )
}