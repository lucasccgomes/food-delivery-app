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
import * as Notifications from 'expo-notifications';
import firestore from '@react-native-firebase/firestore';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  })
})

export default function Establishment() {
  const [item, setItem] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { user } = useUser();
  const [estoques, setEstoques] = useState({});
  const [totalVendas, setTotalVendas] = useState(0);
  const [modalMessage, setModalMessage] = useState('');
  const [isModalMsgVisible, setIsModalMsgVisible] = useState(false);
  const [imagemUrl, setImagemUrl] = useState('');

  const requestUserPermission = async () => {
    let { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') {
      // A função requestPermissionsAsync solicita a permissão do usuário
      const { status: newStatus } = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
          allowAnnouncements: true,
        },
      });
      status = newStatus;
    }
  
    if (status === 'granted') {
      // Se a permissão for concedida, obtenha o token de notificação
      const token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log('Notification Token:', token);
      const userId = user.uid;
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
    } else {
      // Trate o caso em que o usuário não concede permissão
      console.log('Permissão de notificação não concedida');
      // Você pode, por exemplo, alertar o usuário sobre a importância das notificações aqui
      Alert.alert(
        "Permissão de Notificação",
        "A permissão para receber notificações foi negada. Por favor, habilite-a nas configurações do aplicativo para receber as notificações."
      );
      return null;
    }
  };
  

  useEffect(() => {
    requestUserPermission();
  }, []);

  useEffect(() => {
    requestUserPermission().then(token => {
      if (token) {
        scheduleNotifications();
      }
    });
  }, []);
  
  const scheduleNotifications = async () => {
    // Defina os horários de notificação
    const notificationTimes = [
      { hour: 13, minute: 30 }, // 13:30
      { hour: 18, minute: 0 },  // 18:00
    ];
  
    // Dias da semana (1 = segunda, 2 = terça, ..., 5 = sexta)
    const daysOfWeek = [1, 2, 3, 4, 5];
  
    notificationTimes.forEach(time => {
      daysOfWeek.forEach(dayOfWeek => {
        Notifications.scheduleNotificationAsync({
          content: {
            title: "Doce Sabor",
            body: "Ta na hora de um docinho!",
          },
          trigger: {
            hour: time.hour,
            minute: time.minute,
            weekday: dayOfWeek,
            repeats: true,
          },
        });
      });
    });
  };
  

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
    const fetchAndCountOrders = async () => {
      let total = 514;

      const usersSnapshot = await firestore().collection('usuarios').get();
      for (const userDoc of usersSnapshot.docs) {
        const userId = userDoc.id;

        // Pegar pedidos de 'pedidosMoney' com status 'pago'
        const pedidosMoneySnapshot = await firestore()
          .collection('usuarios')
          .doc(userId)
          .collection('pedidosMoney')
          .where('status', '==', 'Pago')
          .get();

        pedidosMoneySnapshot.forEach((doc) => {
          const pedidoData = doc.data();
          pedidoData.itemsDoPedido.forEach((item) => {
            total += item.quantity;
          });
        });

        // Pegar pedidos de 'pedidos' com status 'approved'
        const pedidosSnapshot = await firestore()
          .collection('usuarios')
          .doc(userId)
          .collection('pedidos')
          .where('status', '==', 'approved')
          .get();

        pedidosSnapshot.forEach((doc) => {
          const pedidoData = doc.data();
          pedidoData.itemsDoPedido.forEach((item) => {
            total += item.quantity;
          });
        });
      }

      setTotalVendas(total);
    };

    fetchAndCountOrders().catch(console.error);
  }, []);


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

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('admin')
      .doc('carol')
      .onSnapshot(documentSnapshot => {
        const data = documentSnapshot.data();
        if (data && data.AberFech === 'fechado') {
          setModalVisible(true);
        } else {
          setModalVisible(false);
        }
      });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('admin')
      .doc('carol')
      .onSnapshot(documentSnapshot => {
        console.log('Snapshot data:', documentSnapshot.data());
        const data = documentSnapshot.data();
        if (data && data.ModalMsg) {
          setIsModalMsgVisible(data.ModalMsg.Status === 'ativo');
          setModalMessage(data.ModalMsg.Mensagem);
          setImagemUrl(data.ModalMsg.imagem);

        }
      });

    return () => unsubscribe();
  }, []);
  console.log(imagemUrl)

  if (!item) {
    return (
      <View className="flex justify-center items-center h-full">
        <Image source={require('../assets/images/carregando_02.gif')} className="h-40 w-40" />
      </View>
    );
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
            {/* <Button title='ChamarNotification' onPress={handleCallNotification} /> */}
            <View className="px-4">
              <Text className="text-3xl font-bold">
                {item.name}
              </Text>
              <View className="flex-row space-x-2 my-1">
                <View className="flex-row items-center">
                  <Image source={require('../assets/images/fogueteVendas.png')} className="h-4 w-4 mr-1" />
                  <Text className="text-gray-700">
                    {totalVendas} Vendas -
                  </Text>
                </View>

                <View className="flex-row items-center space-x-1">
                  <Icon.MapPin color="gray" width="15" height="15" />
                  <Text className="text-gray-700 text-xs">{item.endereco}</Text>
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
            <View className="">
              <View className="bg-gray-900 opacity-60 h-full flex justify-center">
                <Text className="text-center text-3xl rotate-90 text-white font-bold">FECHADO NO MOMENTO</Text>
              </View>
            </View>
          </Modal>

          <Modal
            animationType="slide"
            transparent={true}
            visible={isModalMsgVisible}
            onRequestClose={() => setIsModalMsgVisible(false)} // Isto permite que o modal seja fechado
          >
            <View className="justify-center items-center flex-1">
              <View className=""
              >
                <TouchableOpacity
                  onPress={() => setIsModalMsgVisible(false)}
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
                  className="absolute z-10 rounded-full p-3  top-3 right-3"// Estilizações adicionais se necessárias
                >
                  <Icon.X strokeWidth={3} stroke="white" width={15} height={15} />
                </TouchableOpacity>

                <View className=" shadow-black h-96 w-80 rounded-xl p-1"
                  style={{ elevation: 5 }}
                >

                  {!imagemUrl ? (
                    <Text></Text>
                  ) : (
                    <Image className="h-full w-full border rounded-xl"

                      source={{ uri: imagemUrl }}
                    />
                  )
                  }
                </View>

              </View>
            </View>
          </Modal>


        </ScrollView>
      </View>
    </SafeAreaView>
  )
}