import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StatusBar, SafeAreaView, Modal, Dimensions, ScrollView } from 'react-native';
import { useUser } from '../context/UserContext';
import firestore from '@react-native-firebase/firestore';
import { themeColors } from '../theme';
import * as Icon from "react-native-feather";
import { useNavigation } from '@react-navigation/native';
import AddressModal from '../components/AddressModal';

const { width, height } = Dimensions.get('window');

export default function Profile() {
    const [showModal, setShowModal] = useState(false);
    const { signOut } = useUser();
    const { user } = useUser();
    const [userInfo, setUserInfo] = useState(null);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const navigation = useNavigation();
    const [pedidosMoney, setPedidosMoney] = useState([]);
    const [pedidosApproved, setPedidosApproved] = useState([]);
    const [allPedidos, setAllPedidos] = useState([]);

    const [expanded, setExpanded] = useState(false);

    const toggleModal = () => {
        setShowModal(!showModal);
    };

    const toggleExpanded = () => {
        setExpanded(!expanded);
    };

    useEffect(() => {
        const userId = user.uid;

        const unsubscribeMoney = firestore()
            .collection('usuarios')
            .doc(userId)
            .onSnapshot(documentSnapshot => {
                if (documentSnapshot.exists) {
                    setUserInfo(documentSnapshot.data());
                } else {
                    console.log('Usuário não encontrado no Firestore');
                }
            }, error => {
                console.error("Erro ao buscar dados do usuário: ", error);
            });

        return () => unsubscribeMoney();
    }, [user.uid]);


    useEffect(() => {
        const userId = user.uid;

        const unsubscribeMoney = firestore()
            .collection('usuarios')
            .doc(userId)
            .collection('pedidosMoney')
            .orderBy('timestamp', 'desc')
            .onSnapshot(querySnapshot => {
                const pedidosData = [];
                querySnapshot.forEach(doc => {
                    pedidosData.push({ id: doc.id, ...doc.data() });
                });
                console.log('PedidosMoney recebidos:', pedidosData);
                setPedidosMoney(pedidosData);
                setAllPedidos(prevPedidos => [...prevPedidos, ...pedidosData]); // Adicione esses pedidos à lista geral
            }, error => {
                console.error("Erro ao buscar pedidosMoney: ", error);
            });

        const unsubscribeApproved = firestore()
            .collection('usuarios')
            .doc(userId)
            .collection('pedidos')
            .where('status', '==', 'approved')
            .onSnapshot(querySnapshot => {
                const pedidosData = [];
                querySnapshot.forEach(doc => {
                    pedidosData.push({ id: doc.id, ...doc.data() });
                });
                console.log('Pedidos aprovados recebidos:', pedidosData);
                setPedidosApproved(pedidosData);
                setAllPedidos(prevPedidos => [...prevPedidos, ...pedidosData]); // Adicione esses pedidos à lista geral
            }, error => {
                console.error("Erro ao buscar pedidos aprovados: ", error);
            });

        return () => {
            unsubscribeMoney();
            unsubscribeApproved();
        };
    }, [user.uid]);

    const handleUpdateAddress = (newAddress) => {
        setUserInfo((prevState) => ({
            ...prevState,
            EnderecoEntrega: newAddress,
        }));
    };

    if (!userInfo) {
        return (
            <View className="flex justify-center items-center h-full">
                <Image source={require('../assets/images/carregando_02.gif')} className="h-40 w-40" />
            </View>
        );
    }
    console.log('pedidos aprovado', allPedidos)
    return (
        <SafeAreaView className="flex-1"
            style={{ backgroundColor: themeColors.bgColor(0.2) }}
        >
            <View className="bg-white flex-1 mt-10 rounded-2xl">

                {/* Botão de Voltar */}
                <View className=" z-40 relative py-4"
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
                        Meus dados
                    </Text>
                    <Text className="text-center text-gray-500">
                    </Text>
                </View>


                <View style={{ backgroundColor: themeColors.bgColor(0.2) }}
                    className="flex-row px-4 py-2 items-center justify-center w-full"
                >
                    <View className="flex-row justify-center items-center "
                        style={{ marginBottom: width <= 380 ? 0 : 13 }}
                    >
                        <View className="flex justify-center items-center w-24 h-24 bg-white rounded-full ">
                            {user.photoURL && (
                                <Image
                                    className="w-20 h-20 rounded-full m-1"
                                    source={{ uri: user.photoURL }}
                                />
                            )}
                        </View>
                        <View className="flex items-center justify-center bg-white -ml-2 pl-1 py-3 pr-2 rounded-r-3xl h-14">
                            <Text
                                className="text-center text-sm"
                            >
                                {userInfo.Nome_2}
                            </Text>
                        </View>
                    </View>
                    <View
                        className="flex items-end"
                    >
                        <TouchableOpacity
                            onPress={signOut}
                            style={{
                                shadowRadius: 7,
                                shadowColor: 'red',
                                shadowOffset: {
                                    width: 0,
                                    height: 0,
                                },
                                shadowOpacity: 0.44,
                                shadowRadius: 10.32,
                                elevation: 13,

                            }}
                            className="ml-3 p-3 bg-red-600 opacity-80 rounded-full justify-self-end"
                        >
                            <Text className="text-white text-center font-bold text-lg">
                                <Icon.LogOut strokeWidth={3} stroke="white" />
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <ScrollView className="mt-1">
                    <View className="flex justify-center items-center w-full"
                        style={{ marginTop: width <= 380 ? 8 : -15 }}
                    >
                        <View className=" bg-white w-full ">
                            <View
                                style={{ backgroundColor: themeColors.bgColor(0.1) }}
                                className="flex flex-row items-center py-1 pt-3 px-4 mt-1">
                                <Icon.Mail color="gray" width="20" height="30" />
                                <Text className="ml-2 text-xs">
                                    {userInfo.Email}
                                </Text>
                            </View>

                            <View
                                style={{ backgroundColor: themeColors.bgColor(0.1) }}
                                className="flex flex-row items-center py-1 px-4 mt-1">
                                <Icon.Phone color="gray" width="20" height="30" />
                                <Text className="ml-2 text-xs">
                                    {userInfo.WhatsApp}
                                </Text>
                            </View>

                            <View
                                style={{ backgroundColor: themeColors.bgColor(0.1) }}
                                className="flex flex-row items-center py-1 px-4 mt-1">
                                <Icon.Home color="gray" width="20" height="30" />
                                <View className="flex flex-col items-center">
                                    <Text className="ml-2 text-xs">
                                        {`${userInfo.EnderecoEntrega.Rua}, ${userInfo.EnderecoEntrega.Numero}`}
                                        {` ${userInfo.EnderecoEntrega.Bairro}, ${userInfo.EnderecoEntrega.Cidade}`}
                                    </Text>
                                </View>
                            </View>

                            <View
                                style={{ backgroundColor: themeColors.bgColor(0.1) }}
                                className="flex flex-row items-center py-1 px-4 mt-1">
                                <Icon.Map color="gray" width="20" height="30" />
                                <Text className="ml-2 text-xs">
                                    {userInfo.EnderecoEntrega.PontoReferencia}
                                </Text>
                            </View>
                        </View>
                        <View className="mt-3 flex flex-col w-full justify-center items-center"

                        >
                            <Text className="text-xl font-bold"
                                style={{ display: width <= 380 ? 'none' : 'flex' }}
                            >
                                Último Pedido
                            </Text>
                            <TouchableOpacity onPress={toggleModal} className="flex items-end ">
                                <Text
                                    style={{ backgroundColor: themeColors.bgColor(0.8), padding: width <= 380 ? 8 : 2 }}
                                    className="text-end rounded-xl px-1 text-white">
                                    {width <= 380 ? "Ver Meus Pedidos" : "Ver Todos"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <View
                            style={{ height: width <= 380 ? 7 : 308, }}
                            className="flex justify-center items-centerbg-white w-full rounded-2xl pb-1">
                            {width >= 380 && allPedidos.length > 0 && (
                                <View
                                    className="mx-3 mt-2 rounded-xl border"
                                    style={{
                                        borderColor: themeColors.bgColor(0.4),
                                        backgroundColor: themeColors.bgColor(0.2),
                                    }}
                                >

                                    <View className="bg-white rounded-b-full rounded-t-3xl -mt-1">
                                        <Text className="font-semibold text-lg text-center mb-1">
                                            {allPedidos[0].numpedido}
                                        </Text>
                                    </View>
                                    <View className="flex flex-row items-center justify-center mt-2">
                                        <Text className="font-semibold mr-1">
                                            Valor Total:
                                        </Text>
                                        <Text >
                                            R${allPedidos[0].ValorTotal}
                                        </Text>
                                    </View>
                                    <View className="flex flex-row items-center justify-center">
                                        <Text className="font-semibold mr-1">
                                            Pagamento:
                                        </Text>
                                        <Text >
                                            {allPedidos[0].status === 'approved' ? 'Aprovado' : allPedidos[0].status}
                                        </Text>
                                    </View>
                                    <View className="flex flex-row items-center justify-center">
                                        <Text className="font-semibold mr-1">
                                            Status:
                                        </Text>
                                        <Text >
                                            {allPedidos[0].StatusEntrega}
                                        </Text>
                                    </View>

                                    <View
                                        className="bg-white rounded-xl mx-3 mb-2"
                                        style={{
                                            marginVertical: 5,
                                            padding: 14,
                                            backgroundColor: themeColors.bgColor(0.1),
                                        }}>
                                        <TouchableOpacity onPress={toggleExpanded}>
                                            <Text className="font-bold">Itens do Pedido</Text>
                                        </TouchableOpacity>

                                        <View style={{ marginTop: 10 }}>
                                            <ScrollView style={{ maxHeight: width < 380 ? 75 : 100 }}>
                                                {allPedidos[0].itemsDoPedido.map((item, index) => (
                                                    <View key={index} className="flex flex-row gap-2">
                                                        <Text>{item.quantity} -</Text>
                                                        <Text>{item.title}</Text>
                                                    </View>
                                                ))}
                                            </ScrollView>
                                        </View>

                                    </View>

                                </View>
                            )}
                        </View>

                    </View>
                </ScrollView>
                <View
                    style={{ backgroundColor: themeColors.bgColor(0.2), marginTop: width < 380 ? 0 : 0 }} // ALTERAÇÃO DE RESPONSI
                    className="p-6 px-8 rounded-t-3xl space-y-4 w-full" >
                    <View className="flex-row justify-center">
                        <Text className="text-gray-700">
                            Mantenha suas informações atualizadas.
                        </Text>
                    </View>


                    <View className="flex flex-col gap-3">
                        <TouchableOpacity
                            onPress={() => setEditModalVisible(true)}
                            style={{ backgroundColor: themeColors.bgColor(1) }}
                            className="p-3 rounded-full"
                        >
                            <Text className="text-white text-center font-bold text-lg">
                                Atualizar Dados
                            </Text>
                        </TouchableOpacity>

                    </View>
                </View >

            </View >
            <Modal visible={showModal} animationType="slide" transparent>
                <View
                    className="rounded-t-3xl pb-2 bg-white mt-56 border-t border-l border-r"
                    style={{ flex: 1, justifyContent: 'center', alignItems: 'center', borderColor: themeColors.bgColor(1), }}>
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
                        }}
                    >
                        <TouchableOpacity
                            onPress={toggleModal}
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
                                top: width < 380 ? 55 : 9,
                            }}
                            className="absolute rounded-full p-3  top-2 left-32"
                        >
                            <Icon.X strokeWidth={3} stroke="white" />
                        </TouchableOpacity>
                    </View>
                    <Text
                        className="mb-7 text-xl font-bold -mt-3"
                    >Todos os Pedidos</Text>
                    <ScrollView className="w-full">
                        {/* Mapeie e exiba todos os pedidosMoney aqui */}
                        {pedidosMoney.map((pedido, index) => (
                            <View key={index} className="mx-3 mt-2 mb-3 rounded-xl border"
                                style={{
                                    borderColor: themeColors.bgColor(0.4),
                                    backgroundColor: themeColors.bgColor(0.2),
                                }}
                            >
                                <View className="bg-white rounded-b-full rounded-t-3xl -mt-1">
                                    <Text className="font-semibold text-lg text-center mb-1">
                                        {pedido.numpedido}
                                    </Text>
                                </View>
                                <View className="flex flex-row items-center justify-center mt-2">
                                    <Text className="font-semibold mr-1">
                                        Valor Total:
                                    </Text>
                                    <Text >
                                        R${pedido.ValorTotal}
                                    </Text>
                                </View>
                                <View className="flex flex-row items-center justify-center">
                                    <Text className="font-semibold mr-1">
                                        Pagamento:
                                    </Text>
                                    <Text >
                                        {pedido.status === 'approved' ? 'Aprovado' : pedido.status}
                                    </Text>
                                </View>
                                <View className="flex flex-row items-center justify-center">
                                    <Text className="font-semibold mr-1">
                                        Status:
                                    </Text>
                                    <Text >
                                        {pedido.StatusEntrega}
                                    </Text>
                                </View>
                                <View
                                    className="bg-white rounded-xl mx-3 mb-2"
                                    style={{
                                        marginVertical: 5,
                                        padding: 14,
                                        backgroundColor: themeColors.bgColor(0.1),
                                    }}>
                                    <TouchableOpacity onPress={toggleExpanded}>
                                        <Text className="font-bold">Itens do Pedido</Text>
                                    </TouchableOpacity>

                                    <View style={{ marginTop: 10 }}>
                                        <ScrollView style={{ maxHeight: width < 380 ? 75 : 100 }}>
                                            {pedido.itemsDoPedido.map((item, index) => (
                                                <View key={index} className="flex flex-row gap-2">
                                                    <Text>{item.quantity} -</Text>
                                                    <Text>{item.title}</Text>
                                                </View>
                                            ))}
                                        </ScrollView>
                                    </View>
                                </View>
                            </View>
                        ))}

                        {pedidosApproved.map((pedido, index) => (
                            <View key={index} className="mx-3 mt-2 mb-3 rounded-xl border"
                                style={{
                                    borderColor: themeColors.bgColor(0.4),
                                    backgroundColor: themeColors.bgColor(0.2),
                                }}
                            >
                                <View className="bg-white rounded-b-full rounded-t-3xl -mt-1">
                                    <Text className="font-semibold text-lg text-center mb-1">
                                        {pedido.numpedido}
                                    </Text>
                                </View>
                                <View className="flex flex-row items-center justify-center mt-2">
                                    <Text className="font-semibold mr-1">
                                        Valor Total:
                                    </Text>
                                    <Text >
                                        R${pedido.ValorTotal}
                                    </Text>
                                </View>
                                <View className="flex flex-row items-center justify-center">
                                    <Text className="font-semibold mr-1">
                                        Pagamento:
                                    </Text>
                                    <Text >
                                        {pedido.status}
                                    </Text>
                                </View>
                                <View className="flex flex-row items-center justify-center">
                                    <Text className="font-semibold mr-1">
                                        Status:
                                    </Text>
                                    <Text >
                                        {pedido.StatusEntrega}
                                    </Text>
                                </View>
                                <View
                                    className="bg-white rounded-xl mx-3 mb-2"
                                    style={{
                                        marginVertical: 5,
                                        padding: 14,
                                        backgroundColor: themeColors.bgColor(0.1),
                                    }}>
                                    <TouchableOpacity onPress={toggleExpanded}>
                                        <Text className="font-bold">Itens do Pedido</Text>
                                    </TouchableOpacity>

                                    <View style={{ marginTop: 10 }}>
                                        <ScrollView style={{ maxHeight: width < 380 ? 75 : 100 }}>
                                            {pedido.itemsDoPedido.map((item, index) => (
                                                <View key={index} className="flex flex-row gap-2">
                                                    <Text>{item.quantity} -</Text>
                                                    <Text>{item.title}</Text>
                                                </View>
                                            ))}
                                        </ScrollView>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </ScrollView>

                </View>
            </Modal>
            {/* Modal para edição de endereço */}
            <AddressModal
                isVisible={editModalVisible}
                onClose={() => setEditModalVisible(false)}
                onUpdateAddress={handleUpdateAddress}
                showWhatsAppInput={true}
            />

        </SafeAreaView >


    );
}