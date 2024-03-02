import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StatusBar, SafeAreaView, Modal, TextInput, Button } from 'react-native';
import { useUser } from '../context/UserContext';
import firestore from '@react-native-firebase/firestore';
import { themeColors } from '../theme';
import * as Icon from "react-native-feather";
import { Picker } from '@react-native-picker/picker';
import { useForm, Controller } from 'react-hook-form';
import { useNavigation } from '@react-navigation/native';

export default function Profile() {
    const { signOut } = useUser();
    const { user } = useUser();
    const [userInfo, setUserInfo] = useState(null);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const navigation = useNavigation();
    const [newAddress, setNewAddress] = useState({
        Rua: '',
        Numero: '',
        Bairro: '',
        Cidade: '', // Inicializa a cidade no estado do endereço
    });

    const { control, handleSubmit, setValue } = useForm();

    useEffect(() => {
        if (user && user.uid) {
            const unsubscribe = firestore()
                .collection('usuarios')
                .doc(user.uid)
                .onSnapshot(documentSnapshot => {
                    if (documentSnapshot.exists) {
                        const userData = documentSnapshot.data();
                        setUserInfo(userData);
                        setValue('cidade', userData.EnderecoEntrega.Cidade); // Define o valor inicial para o campo cidade
                        // Define os valores iniciais do endereço
                        setNewAddress({
                            Rua: userData.EnderecoEntrega.Rua,
                            Numero: userData.EnderecoEntrega.Numero,
                            Bairro: userData.EnderecoEntrega.Bairro,
                            Cidade: userData.EnderecoEntrega.Cidade,
                        });
                    } else {
                        console.log('Usuário não encontrado no Firestore');
                    }
                });

            return () => unsubscribe();
        }
    }, [user, setValue]);

    const handleSaveChanges = async () => {
        if (user && user.uid) {
            await firestore().collection('usuarios').doc(user.uid).update({
                EnderecoEntrega: newAddress,
            });
            setEditModalVisible(false);
        }
    };

    if (!userInfo) {
        return <Text></Text>;
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
                            Alterar Endereço
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
                </View>

                <Text className="mt-3 mb-0">
                    Historico de pedidos
                </Text>
                <View className="bg-white h-[30%] w-[85%] mt-3 rounded-2xl">

                </View>
            </View>


            {/* Modal para edição de endereço */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={editModalVisible}
                onRequestClose={() => {
                    setEditModalVisible(!editModalVisible);
                }}
            >
                <View style={{ marginTop: 50, backgroundColor: 'white', padding: 20 }}>
                    <Text>Novo Endereço:</Text>
                    <View className="bg-white mb-3 rounded-lg">
                        <Controller
                            control={control}
                            render={({ field: { onChange, value } }) => (
                                <Picker
                                    selectedValue={value}
                                    onValueChange={(itemValue) => onChange(itemValue)}
                                >
                                    {/* Aqui você listaria todas as cidades disponíveis */}
                                    {/* Exemplo: */}
                                    <Picker.Item label="Sagres" value="Sagres" />
                                    {/* Adicione aqui outras cidades */}
                                </Picker>
                            )}
                            name="cidade"
                            rules={{ required: true }}
                        />
                    </View>
                    {/* Inputs para o novo endereço. Exemplo para a rua: */}
                    <TextInput
                        placeholder="Rua"
                        value={newAddress.Rua}
                        onChangeText={text => setNewAddress({ ...newAddress, Rua: text })}
                    />
                    <TextInput
                        placeholder="Numero"
                        value={newAddress.Numero}
                        onChangeText={text => setNewAddress({ ...newAddress, Numero: text })}
                    />
                    <TextInput
                        placeholder="Bairro"
                        value={newAddress.Bairro}
                        onChangeText={text => setNewAddress({ ...newAddress, Bairro: text })}
                    />
                    {/* Repita os TextInput para outros campos do endereço */}
                    <Button onPress={handleSubmit(handleSaveChanges)} title="Salvar" />
                </View>
            </Modal>
        </SafeAreaView >
    );
}
