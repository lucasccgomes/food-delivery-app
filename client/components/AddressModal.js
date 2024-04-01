import React, { useEffect, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, TextInput } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import * as Icon from "react-native-feather";
import { themeColors } from '../theme';
import { Picker } from '@react-native-picker/picker';
import { useUser } from '../context/UserContext';
import firestore from '@react-native-firebase/firestore';

const AddressModal = ({ isVisible, onClose, onUpdateAddress, showWhatsAppInput = true }) => {
    const [cidades, setCidades] = useState([]);
    const { control, handleSubmit, setValue, formState: { errors } } = useForm({
        defaultValues: {
            cidade: '',
            rua: '',
            numero: '',
            bairro: '',
            pontoReferencia: '',
            phone: '',
        }
    });
    const { user } = useUser();

    const formatWhatsApp = (value) => {
        const numbers = value.replace(/\D/g, '');
        let formatted = numbers.slice(0, 2);
        if (formatted.length) formatted = `(${formatted}`;
        if (numbers.length >= 3) formatted += `)${numbers.slice(2, 7)}`;
        if (numbers.length >= 8) formatted += `-${numbers.slice(7, 11)}`;

        return formatted;
    };

    const handleSaveChanges = async (data) => {

        const updatedAddress = {
            Rua: data.rua,
            Numero: data.numero,
            Bairro: data.bairro,
            Cidade: data.cidade,
            PontoReferencia: data.pontoReferencia,
        };

        if (user && user.uid) {
            await firestore().collection('usuarios').doc(user.uid).update({
                EnderecoEntrega: updatedAddress,
                WhatsApp: formatWhatsApp(data.phone),
            });
            onUpdateAddress(updatedAddress); // Certifique-se que esta chamada está correta
            onClose();
        }
    };

    useEffect(() => {
        const docRef = firestore().collection('admin').doc('carol');
        const unsubscribe = docRef.onSnapshot(doc => {
            if (doc.exists) {
                const data = doc.data();
                setCidades(data.cidades);
            } else {
                console.log('Documento não encontrado');
            }
        }, error => {
            console.error('Erro ao obter as cidades:', error);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (user && user.uid) {
            const unsubscribe = firestore()
                .collection('usuarios')
                .doc(user.uid)
                .onSnapshot(documentSnapshot => {
                    if (documentSnapshot.exists) {
                        const userData = documentSnapshot.data();
                        // Define os valores iniciais para o formulário
                        setValue('cidade', userData.EnderecoEntrega.Cidade);
                        setValue('rua', userData.EnderecoEntrega.Rua);
                        setValue('numero', userData.EnderecoEntrega.Numero);
                        setValue('bairro', userData.EnderecoEntrega.Bairro);
                        setValue('pontoReferencia', userData.EnderecoEntrega.PontoReferencia);
                        setValue('phone', userData.WhatsApp);
                    } else {
                        console.log('Usuário não encontrado no Firestore');
                    }
                });

            return () => unsubscribe();
        }
    }, [user, setValue]);

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={isVisible}
            onRequestClose={onClose}
        >
            <View className="bg-white p-4 rounded-2xl m-6 mt-28 border-4"
                style={{
                    borderColor: themeColors.bgColor(0.3),
                }}
            >
                <TouchableOpacity
                    onPress={onClose}
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
                    className="absolute z-10 rounded-full p-3  top-2 right-5"// Estilizações adicionais se necessárias
                >
                    <Icon.X strokeWidth={3} stroke="white" width={15} height={15} />
                </TouchableOpacity>

                <Text className="text-center font-bold text-xl">
                    Atualizar Endereço
                </Text>
                <View className="mt-3 rounded-lg border"
                    style={{
                        borderColor: themeColors.bgColor(0.3),
                    }}
                >
                    <Controller
                        control={control}
                        render={({ field: { onChange, value } }) => (
                            <Picker
                                className="bg-white rounded-lg"
                                selectedValue={value}
                                onValueChange={(itemValue, itemIndex) => onChange(itemValue)}
                            >
                                {cidades.map((cidade, index) => (
                                    <Picker.Item key={index} label={cidade} value={cidade} />
                                ))}
                            </Picker>
                        )}
                        name="cidade"
                        rules={{ required: true }}
                    />
                </View>

                <Controller
                    control={control}
                    rules={{
                        required: 'Rua é obrigatória',
                        minLength: {
                            value: 3,
                            message: 'Rua deve ter no mínimo 3 caracteres'
                        },
                        pattern: {
                            value: /^[A-Za-z0-9\sáàâãéèêíïóôõöúçñÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ]+$/,
                            message: 'Rua deve conter letras, números e acentos'
                        }
                    }}

                    render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                        <View>
                            <TextInput
                                className="mt-3 h-12 p-2 rounded-lg border"
                                style={{
                                    borderColor: themeColors.bgColor(0.3),
                                }}
                                onBlur={onBlur}
                                onChangeText={(text) => {
                                    onChange(text);
                                }}
                                value={value}
                                placeholder="Rua"
                            />
                            {error && <Text className="text-red-600 -mt-3 mb-3 bg-white">{error.message}</Text>}
                        </View>
                    )}
                    name="rua"
                />

                <Controller
                    control={control}
                    rules={{
                        required: 'Número é obrigatório',
                        minLength: {
                            value: 1,
                            message: 'Número deve ter no mínimo 1 caractere'
                        },
                        pattern: {
                            value: /^\d+$/,
                            message: 'Número deve conter apenas números'
                        }
                    }}
                    render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                        <View>
                            <TextInput
                                className="mt-3 h-12 p-2 rounded-lg border"
                                style={{
                                    borderColor: themeColors.bgColor(0.3),
                                }}
                                onBlur={onBlur}
                                onChangeText={(text) => {
                                    onChange(text);
                                }}
                                value={value}
                                placeholder="Numero"
                                keyboardType="numeric" // Isso assegura que o teclado numérico seja mostrado
                            />
                            {error && <Text className="text-red-600 -mt-3 mb-3 bg-white">{error.message}</Text>}
                        </View>
                    )}
                    name="numero"
                />

                <Controller
                    control={control}
                    rules={{
                        required: 'Bairro é obrigatório',
                        minLength: {
                            value: 2,
                            message: 'Bairro deve ter no mínimo 2 caracteres'
                        },
                        pattern: {

                        }
                    }}
                    render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                        <View>
                            <TextInput
                                className="mt-3 h-12 p-2 rounded-lg border"
                                style={{
                                    borderColor: themeColors.bgColor(0.3),
                                }}
                                onBlur={onBlur}
                                onChangeText={(text) => {
                                    onChange(text);
                                }}
                                value={value}
                                placeholder="Bairro"
                            />
                            {error && <Text className="text-red-600 -mt-3 mb-3 bg-white">{error.message}</Text>}
                        </View>
                    )}
                    name="bairro"
                />

                <Controller
                    control={control}
                    rules={{
                        maxLength: {
                            value: 25,
                            message: 'Ponto de referência deve ter no máximo 25 caracteres'
                        }
                    }}
                    render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                        <View>
                            <TextInput
                                className="mt-3 h-12 p-2 rounded-lg border"
                                style={{
                                    borderColor: themeColors.bgColor(0.3),
                                }}
                                onBlur={onBlur}
                                onChangeText={(text) => {
                                    onChange(text);
                                }}
                                value={value}
                                placeholder="Ponto de referência (Opcional)"
                            />
                            {error && <Text className="text-red-600 -mt-3 mb-3">{error.message}</Text>}
                        </View>
                    )}
                    name="pontoReferencia"
                />

                {showWhatsAppInput && (
                    <Controller
                        control={control}
                        rules={{
                            required: 'WhatsApp é obrigatório',
                            pattern: {
                                value: /^\(\d{2}\)\d{4,5}-\d{4}$/,
                                message: 'WhatsApp deve estar no formato (XX)XXXXX-XXXX'
                            }
                        }}
                        render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                            <View>
                                <TextInput
                                    className="mt-3 h-12 p-2 rounded-lg border"
                                    style={{
                                        borderColor: themeColors.bgColor(0.3),
                                    }}
                                    onBlur={onBlur}
                                    onChangeText={(text) => {
                                        const formattedText = formatWhatsApp(text);
                                        onChange(formattedText);
                                    }}
                                    value={value}
                                    placeholder="WhatsApp"
                                    keyboardType="phone-pad"
                                />
                                {error && <Text className="text-red-600 -mt-3 mb-3 bg-white">{error.message}</Text>}
                            </View>
                        )}
                        name="phone"
                    />
                )}

                <TouchableOpacity
                    onPress={handleSubmit(handleSaveChanges)}
                    style={{ backgroundColor: themeColors.bgColor(1) }}
                    className="p-3 rounded-full mt-4"
                >
                    <Text className="text-white text-center font-bold text-lg">
                        Salvar
                    </Text>
                </TouchableOpacity>
            </View>
        </Modal>
    );
};

export default AddressModal;
