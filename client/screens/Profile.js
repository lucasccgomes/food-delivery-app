import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StatusBar, SafeAreaView, Modal, TextInput, Button } from 'react-native';
import { useUser } from '../context/UserContext';
import firestore from '@react-native-firebase/firestore';
import { themeColors } from '../theme';
import * as Icon from "react-native-feather";
import { useNavigation } from '@react-navigation/native';
import AddressModal from '../components/AddressModal';

export default function Profile() {
    const { signOut } = useUser();
    const { user } = useUser();
    const [userInfo, setUserInfo] = useState(null);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const navigation = useNavigation();

    useEffect(() => {
        const userId = user.uid; 
    
        const unsubscribe = firestore()
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
    
        return () => unsubscribe();
    }, [user.uid]);
    
    const handleUpdateAddress = (newAddress) => {
        setUserInfo((prevState) => ({
            ...prevState,
            EnderecoEntrega: newAddress,
        }));
    };

    if (!userInfo) {
        return   <Text>Carregando...</Text>;
    }

    return (
        <SafeAreaView className="flex-1"
            style={{ backgroundColor: themeColors.bgColor(0.2) }}
        >
            <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
            <View className=" relative py-4"
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
                    className="absolute z-10 rounded-full p-3  top-11 left-8"
                >
                    <Icon.ArrowLeft strokeWidth={3} stroke="white" />
                </TouchableOpacity>
            </View>
            <View className="flex-1 justify-center items-center">
                <View className="relative justify-center items-center">
                    <View className="border-4 rounded-full"
                        style={{ borderColor: themeColors.bgColor(0.8) }}
                    >
                        {user.photoURL && (
                            <Image
                                className="w-28 h-28 rounded-full m-1"
                                source={{ uri: user.photoURL }}
                            />
                        )}
                    </View>
                    <View className="flex justify-center items-center mt-4 ">
                        <Text className="text-2xl font-bold">
                            {userInfo.Nome_2}
                        </Text>
                    </View>
                </View>
                <View className="flex flex-row gap-3 mt-4">
                    <TouchableOpacity
                        onPress={() => setEditModalVisible(true)}
                        style={{ backgroundColor: themeColors.bgColor(1) }}
                        className="p-3 rounded-full"
                    >
                        <Text className="text-white text-center font-bold text-lg">
                            Atualizar Dados
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={signOut}
                        style={{ backgroundColor: themeColors.bgColor(1) }}
                        className="p-3 rounded-full"
                    >
                        <Text className="text-white text-center font-bold text-lg">
                            Sair
                        </Text>
                    </TouchableOpacity>
                </View>
                <View className="bg-white w-[85%] mt-10 p-4 rounded-2xl">
                    <View className="flex flex-row items-center mt-3 mb-3">
                        <Icon.Mail color="gray" width="30" height="30" />
                        <Text className="ml-2">
                            {userInfo.Email}
                        </Text>
                    </View>
                    <View className="flex flex-row items-center mb-3">
                        <Icon.Phone color="gray" width="30" height="30" />
                        <Text className="ml-2">
                            {userInfo.WhatsApp}
                        </Text>
                    </View>
                    <View className="flex flex-row items-center mb-3">
                        <Icon.Home color="gray" width="30" height="30" />
                        <Text className="ml-2">
                            {`${userInfo.EnderecoEntrega.Rua}, ${userInfo.EnderecoEntrega.Numero}, ${userInfo.EnderecoEntrega.Bairro}, ${userInfo.EnderecoEntrega.Cidade}`}
                        </Text>
                    </View>
                    <View className="flex flex-row items-center mb-3">
                        <Icon.Map color="gray" width="30" height="30" />
                        <Text className="ml-2">
                            {userInfo.EnderecoEntrega.PontoReferencia}
                        </Text>
                    </View>
                </View>

                <Text className="mt-3 mb-0">
                    Historico de pedidos
                </Text>
                <View className="bg-white h-[30%] w-[85%] mt-3 rounded-2xl">



                </View>
            </View>

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
