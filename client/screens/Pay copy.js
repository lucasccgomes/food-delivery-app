import { View, Text, TouchableOpacity, Image, ScrollView, Modal, TextInput, Dimensions, Button } from 'react-native'
import React, { useEffect, useState } from 'react';
import * as Icon from "react-native-feather";
import { themeColors } from '../theme';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { handleIntegrationMP } from '../services/mercadopago/pagamentoService';
import { WebView } from 'react-native-webview';
import { useUser } from '../context/UserContext';
import firestore from '@react-native-firebase/firestore';
import { emptyCart } from '../slices/cartSlice';
import { useDispatch } from 'react-redux';
import { useRoute } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { Picker } from '@react-native-picker/picker';


const { width, height } = Dimensions.get('window');


export default function Pay() {

    const dispatch = useDispatch();
    const { control, handleSubmit, setValue } = useForm();
    const { user } = useUser();
    const [userInfo, setUserInfo] = useState(null);
    const route = useRoute();
    const deliveryOption = route.params.deliveryOption;
    const [address, setAddress] = useState('');
    const totalOrderValue = useSelector(state => state.cart.totalValue);
    const navigation = useNavigation();
    const [paymentUrl, setPaymentUrl] = useState('');
    const [taxaCartao, setTaxaCartao] = useState(0);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [showWarningModal, setShowWarningModal] = useState(false);
    const [showChangeModal, setShowChangeModal] = useState(false);
    const [showSelectChangeModal, setShowSelectChangeModal] = useState(false);
    const [changeAmount, setChangeAmount] = useState('');
    const [needsChange, setNeedsChange] = useState(false);
    const [changeNeeded, setChangeNeeded] = useState('');
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [newAddress, setNewAddress] = useState({
        Rua: '',
        Numero: '',
        Bairro: '',
        Cidade: '',
        PontoReferencia: '',
    });

  

    console.log('Troco para:', changeAmount)
    console.log('Cliente:', changeNeeded)
    console.log('Meio de pagamento:', selectedPaymentMethod)
    console.log('ID do Usuario (PAY):', user.uid)

   

    useEffect(() => {
        if (user && user.uid) {
            const unsubscribe = firestore()
                .collection('usuarios')
                .doc(user.uid)
                .onSnapshot(documentSnapshot => {
                    if (documentSnapshot.exists) {
                        const userData = documentSnapshot.data();
                        setUserInfo(userData);
                        setValue('cidade', userData.EnderecoEntrega.Cidade);
                        setValue('pontoReferencia', userData.EnderecoEntrega.PontoReferencia);
                        // Define os valores iniciais do endereço
                        setNewAddress({
                            Rua: userData.EnderecoEntrega.Rua,
                            Numero: userData.EnderecoEntrega.Numero,
                            Bairro: userData.EnderecoEntrega.Bairro,
                            Cidade: userData.EnderecoEntrega.Cidade,
                            PontoReferencia: userData.EnderecoEntrega.PontoReferencia,
                        });
                    } else {
                        console.log('Usuário não encontrado no Firestore');
                    }
                });

            return () => unsubscribe();
        }
    }, [user, setValue]);

    useEffect(() => {
        const fetchEnderecoRetirada = async () => {
            if (deliveryOption === 'Retirar no Local') {
                // Busque o endereço de retirada da coleção 'admin'
                const fetchEnderecoRetirada = async () => {
                    const docRef = firestore().collection('admin').doc('carol');
                    const docSnapshot = await docRef.get();
                    if (docSnapshot.exists) {
                        const data = docSnapshot.data();
                        setAddress(
                            <Text>
                                <Text className="font-bold">Retirada:</Text> {data.EnderecoRetirada}
                            </Text>
                        );
                    }
                };

                fetchEnderecoRetirada();
            } else {
                // Carregar o endereço de entrega normal do usuário
                if (userInfo && userInfo.EnderecoEntrega) {
                    const { Rua, Numero, Bairro, Cidade } = userInfo.EnderecoEntrega;
                    setAddress(
                        <Text>
                            <Text className="font-bold">Entrega:</Text> {`${Rua}, ${Numero}, ${Bairro}, ${Cidade}`}
                        </Text>
                    );
                }
            }
        };

        fetchEnderecoRetirada();
    }, [deliveryOption, user, userInfo]);

    useEffect(() => {
        const loadUserInfo = async () => {
            try {
                const userInfoDoc = await firestore().collection('usuarios').doc(user.uid).get();
                if (userInfoDoc.exists) {
                    setUserInfo(userInfoDoc.data());
                } else {
                    console.log('Nenhum usuário encontrado com este UID');
                }
            } catch (error) {
                console.error('Erro ao carregar informações do usuário:', error);
            }
        };

        if (user && user.uid) {
            loadUserInfo();
        }
    }, [user]);

    // Função para salvar o endereço atualizado
    const handleSaveChanges = async () => {
        if (user && user.uid) {
            await firestore().collection('usuarios').doc(user.uid).update({
                EnderecoEntrega: newAddress,
            });
            setEditModalVisible(false);
        }
    };

    const extractPrefIdFromUrl = (url) => {
        try {
            const params = new URLSearchParams(url.split('?')[1]);
            return params.get('pref_id');
        } catch (error) {
            console.error('Erro ao extrair o pref_id da URL:', error);
            return null; // Retorna null em caso de erro
        }
    };

    const saveTotalValueIfPaymentApproved = async (userId, prefId, totalValue) => {
        try {
          // Somente atualiza o ValorTotal se o status do pagamento for 'approved'
          await firestore()
            .collection('usuarios')
            .doc(userId)
            .collection('pedidos')
            .doc(prefId)
            .set({
              ValorTotal: totalValue
            }, { merge: true });
      
          console.log('Valor total salvo com sucesso após aprovação do pagamento.');
        } catch (error) {
          console.error('Erro ao salvar o valor total após aprovação do pagamento:', error);
        }
      };

    const waitAndCheckPaymentStatus = async (userId, prefId, totalOrderValue, taxaCartaoFor, maxWaitTime = 120000, interval = 2000) => {
        const startTime = Date.now();
        while (Date.now() - startTime < maxWaitTime) {
          const status = await checkPaymentStatus(userId, prefId);
          console.log(`Verificando o status do pagamento para o usuário ${userId} com prefId ${prefId}...`);
          console.log(`Status do pagamento: ${status}`);
          if (status === 'approved') {
            // Aqui é onde você deve salvar o valor total se o pagamento for aprovado
            await saveTotalValueIfPaymentApproved(userId, prefId, totalOrderValue + taxaCartaoFor);
            return status;
          }
          await new Promise(resolve => setTimeout(resolve, interval)); // Espera por um intervalo antes de verificar novamente
        }
        return null; // Retorna null se o pagamento não for aprovado dentro do tempo máximo
      };

    const handleConfirm = () => {
        if (selectedPaymentMethod === 'Dinheiro' && changeNeeded === '') {
            setShowSelectChangeModal(true);
        } else {
            navigation.navigate('AguardandoPedido', { changeNeeded, changeAmount });
        }
    };

    useEffect(() => {
        if (selectedPaymentMethod !== 'Dinheiro') {
            setChangeNeeded('');
            setChangeAmount('');
        }
    }, [selectedPaymentMethod]);

    useEffect(() => {
        if (selectedPaymentMethod === 'Cartão de Crédito') {
            setTaxaCartao((5 / 100) * totalOrderValue);
        } else {
            setTaxaCartao(0);
        }
    }, [selectedPaymentMethod, totalOrderValue]);

    const taxaCartaoFor = parseFloat(taxaCartao.toFixed(2));

    const checkPaymentStatus = async (userId, prefId) => {
        try {
            const paymentRef = firestore().collection('usuarios').doc(userId).collection('pedidos').doc(prefId);
            const paymentSnapshot = await paymentRef.get();
            if (paymentSnapshot.exists) {
                const paymentData = paymentSnapshot.data();
                if (paymentData && paymentData.status) {
                    return paymentData.status;
                }
            }
            return null; // Retorna null se o documento não existir ou não tiver status
        } catch (error) {
            console.error('Erro ao verificar o status do pagamento:', error);
            return null; // Retorna null em caso de erro
        }
    };

    const handleBuy = async (selectedPaymentMethod, setPaymentUrl, setIsModalVisible, navigation, userId) => {
        if (!selectedPaymentMethod) {
            setShowWarningModal(true); // Mostra o modal de aviso
        } else {
            const url = await handleIntegrationMP(selectedPaymentMethod);
            if (url) {
                setPaymentUrl(url);
                setIsModalVisible(true);

                // Extrair o pref_id da URL
                const prefId = extractPrefIdFromUrl(url);

                if (prefId) {
                    // Esperar e verificar o status do pagamento
                    const paymentStatus = await waitAndCheckPaymentStatus(userId, prefId);
                    setIsModalVisible(false);
                    console.log('Tentando navegar para PagamentoStatus', paymentStatus);
                    if (paymentStatus === 'approved') {
                        navigation.reset({
                            index: 0,
                            routes: [{ name: 'PagamentoStatus' }],
                        });
                        // Navegar para a tela de pagamento aprovado
                        dispatch(emptyCart());
                    } else {
                        // O pagamento não foi aprovado dentro do tempo máximo ou erro na verificação
                        console.log('Pagamento não aprovado ou erro na verificação.');
                        // Considerar adicionar feedback ao usuário aqui
                    }
                } else {
                    console.log('Não foi possível extrair o pref_id da URL.');
                    // Feedback ao usuário sobre o erro
                }
            } else {
                // Feedback ao usuário sobre o erro na obtenção da URL
            }
        }
    };


    
    const handlePaymentButtonClick = () => {
        if (!selectedPaymentMethod) {
            setShowWarningModal(true); // Mostra o modal de aviso
        } else {
            handleBuy(selectedPaymentMethod, setPaymentUrl, setIsModalVisible, navigation, user.uid);
        }
    };

    return (
        <View className="bg-white flex-1 mt-10 rounded-2xl">

            {/* Botão de Voltar */}
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
                    className="absolute rounded-full p-3  top-5 left-8"
                >
                    <Icon.ArrowLeft strokeWidth={3} stroke="white" />
                </TouchableOpacity>
            </View>

            <View>
                <Text className="text-center font-bold text-xl ml-6 -mt-1">
                    Forma de Pagamento
                </Text>
                <Text className="text-center text-gray-500">

                </Text>
            </View>
            {/* Texto Selecione Meio de Pagamento*/}
            <View style={{ backgroundColor: themeColors.bgColor(0.2) }}
                className="flex-row px-4 items-center"
            >
                <Image
                    source={require('../assets/images/paymet.png')}
                    className="w-20 h-20 rounded-full my-1"
                    style={{ width: width < 400 ? 50 : 70, height: width < 400 ? 50 : 70, }}
                />
                <Text className="flex-1 pl-4">
                    Selecione um meio de pagamento
                </Text>
            </View>
            <View style={{ backgroundColor: themeColors.bgColor(0.2) }}
                className="flex flex-row items-center justify-center py-2 mt-2"
            >
                <Text className="flex-1 pl-4 text-center">
                    {address}
                </Text>
                {deliveryOption === 'Entrega' && (
                    <TouchableOpacity
                        onPress={() => setEditModalVisible(true)}>
                        <Text
                            className="font-bold mr-2"
                            style={{ color: themeColors.text }}>
                            Alterar
                        </Text>
                    </TouchableOpacity>
                )}
            </View>

            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                {/* Modals de mensagens */}
                <Modal
                    animationType="slide"
                    transparent={false}
                    visible={isModalVisible}
                    onRequestClose={() => {
                        setIsModalVisible(!isModalVisible);
                    }}
                >
                    <TouchableOpacity
                        onPress={() => setIsModalVisible(false)}
                        style={{ backgroundColor: themeColors.bgColor(1) }}
                        className="p-3 rounded-full mb-4 mx-3"
                    >
                        <Text className="text-white text-center font-bold text-lg">
                            Sair
                        </Text>
                    </TouchableOpacity>
                    <WebView 
                    source={{ uri: paymentUrl }} 
                    style={{ flex: 1 }} 
                    />

                </Modal>

                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={showWarningModal}
                    onRequestClose={() => setShowWarningModal(false)}
                >
                    <TouchableOpacity className="h-full flex justify-center items-center"
                        onPressOut={() => setShowWarningModal(false)} >
                        <View
                            className=" border w-[85%] -mb-[450px] rounded-xl p-2"
                            style={{
                                backgroundColor: themeColors.bgColor(0.2),
                                borderColor: themeColors.bgColor(0.1),
                            }}
                        >
                            <Text className="text-xs text-center text-red-500">
                                Você precisa selecionar um meio de pagamento!
                            </Text>
                        </View>
                    </TouchableOpacity>
                </Modal>

                <Modal
                    visible={showChangeModal}
                    transparent={true}
                    animationType="slide"
                    onRequestClose={() => setShowChangeModal(false)}
                >
                    <TouchableOpacity
                        className="flex items-center justify-center h-full"
                        activeOpacity={1}
                        onPressOut={() => setShowChangeModal(false)}
                    >
                        <View
                            className="py-2 px-6 -mt-[30%] rounded-xl"
                            style={{
                                backgroundColor: themeColors.btPay,
                                borderColor: themeColors.bgColor(0.1),
                            }}
                        >
                            <Text className="text-lg font-bold">VOCÊ PRECISA DE TROCO ?</Text>
                            <View className="flex flex-row items-center justify-center mt-4">
                                <TouchableOpacity
                                    className="rounded-2xl p-2 mr-3"
                                    style={{
                                        backgroundColor: themeColors.bgColor(1),
                                    }}
                                    onPress={() => { setNeedsChange(true); }}>
                                    <Text className="text-white text-center font-bold text-lg">
                                        SIM
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    className="rounded-2xl p-2"
                                    style={{
                                        backgroundColor: themeColors.bgColor(1),
                                    }}
                                    onPress={() => {
                                        setNeedsChange(false);
                                        setChangeNeeded('NÃO PRECISO DE TROCO');
                                        setChangeAmount('')
                                        setShowChangeModal(false);
                                    }}>
                                    <Text className="text-white text-center font-bold text-lg">
                                        NÃO
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {needsChange && (
                                <>
                                    <TextInput
                                        className="bg-white text-center my-3 text-lg p-2 rounded-lg"
                                        onChangeText={setChangeAmount}
                                        value={changeAmount}
                                        placeholder="TROCO PRA QUANTO ?"
                                        keyboardType="numeric"
                                    />
                                    <TouchableOpacity
                                        className="rounded-2xl p-2"
                                        style={{
                                            backgroundColor: themeColors.bgColor(1),
                                        }}
                                        onPress={() => { setChangeNeeded(`TROCO PARA ${changeAmount}`); setShowChangeModal(false); }}

                                    >
                                        <Text className="text-white text-center font-bold text-lg">
                                            OK
                                        </Text>
                                    </TouchableOpacity>
                                </>
                            )}
                        </View>
                    </TouchableOpacity>
                </Modal>

                <Modal
                    visible={showSelectChangeModal}
                    transparent={true}
                    animationType="slide"
                    onRequestClose={() => setShowSelectChangeModal(false)}
                >
                    <TouchableOpacity
                        className="h-full flex justify-center items-center"
                        activeOpacity={1}
                        onPressOut={() => setShowSelectChangeModal(false)}
                    >
                        <View
                            className=" border w-[85%] -mb-[450px] rounded-xl p-2"
                            style={{
                                backgroundColor: themeColors.bgColor(0.2),
                                borderColor: themeColors.bgColor(0.1),
                            }}
                        >
                            <Text className="text-xs text-center text-red-500">
                                É preciso informar se você precisa de troco!
                            </Text>
                        </View>
                    </TouchableOpacity>
                </Modal>

                {/* Modal para edição de endereço */}

                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={editModalVisible}
                    onRequestClose={() => {
                        setEditModalVisible(!editModalVisible);
                    }}
                >
                    <View className="bg-white p-4 rounded-2xl m-6 mt-28 border-4"
                        style={{
                            borderColor: themeColors.bgColor(0.3),
                        }}
                    >
                        <TouchableOpacity
                            onPress={() => setEditModalVisible(false)}
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
                                        selectedValue={value}
                                        onValueChange={(itemValue) => onChange(itemValue)}
                                    >
                                        <Picker.Item label="Sagres" value="Sagres" />
                                    </Picker>
                                )}
                                name="cidade"
                                rules={{ required: true }}
                            />
                        </View>
                        {/* Inputs para o novo endereço. Exemplo para a rua: */}
                        <Controller
                            control={control}
                            rules={{
                                required: 'Rua é obrigatória',
                                minLength: {
                                    value: 3,
                                    message: 'Rua deve ter no mínimo 3 caracteres'
                                },
                                pattern: {
                                    value: /^[A-Za-z0-9\s]{3,}$/,
                                    message: 'Rua deve conter letras e números'
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
                                        onChangeText={text => setNewAddress({ ...newAddress, Rua: text })}
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
                                        onChangeText={text => setNewAddress({ ...newAddress, Numero: text })}
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
                                        onChangeText={text => setNewAddress({ ...newAddress, Bairro: text })}
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
                                            setNewAddress({ ...newAddress, PontoReferencia: text });
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


                {/* Meios de Pagamento*/}
                <View className="flex justify-center items-center h-[80%]"
                    style={{ marginTop: width < 400 ? 20 : 30, }}
                >
                    <TouchableOpacity
                        onPress={() => setSelectedPaymentMethod('Pix')}
                        className="flex-row items-center w-72 mt-2 space-x-3 py-2 px-4 rounded-3xl mx-2 mb-3 "
                        style={{
                            backgroundColor: selectedPaymentMethod === 'Pix' ? themeColors.btPay : 'white',
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
                        <Image
                            source={require('../assets/images/pix.png')}
                            className="w-24 h-20 my-1"
                        />
                        <Text>
                            Pix
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => setSelectedPaymentMethod('Cartão de Crédito')}
                        className="flex-row items-center w-72 mt-2 space-x-3 py-2 px-4 bg-white rounded-3xl mx-2 mb-3 "
                        style={{
                            backgroundColor: selectedPaymentMethod === 'Cartão de Crédito' ? themeColors.btPay : 'white',
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
                        <Image
                            source={require('../assets/images/cardcredito.png')}
                            className="w-24 h-20  my-1"
                        />
                        <Text>
                            Cartão de Credito
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => { setShowChangeModal(true); setSelectedPaymentMethod('Dinheiro'); }}
                        className="flex-row items-center w-72 mt-2 space-x-3 py-2 px-4 bg-white rounded-3xl mx-2 mb-3 "
                        style={{
                            backgroundColor: selectedPaymentMethod === 'Dinheiro' ? themeColors.btPay : 'white',
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
                        <Image
                            source={require('../assets/images/dinheiro.png')}
                            className="w-24 h-20 my-1"
                        />
                        <Text>
                            Dinheiro
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/*Total*/}
            <View
                style={{ backgroundColor: themeColors.bgColor(0.2) }}
                className="p-6 px-8 rounded-t-3xl space-y-4">

                <View className="flex-row justify-between">
                    <Text className="text-gray-700">Taxa do Cartão</Text>
                    <Text className="text-gray-700">R${taxaCartaoFor}</Text>
                </View>
                <View className="flex-row justify-between">
                    <Text className="text-gray-700 font-extrabold">Total do Pedido</Text>
                    <Text className="text-gray-700 font-extrabold">R${totalOrderValue + taxaCartaoFor}</Text>
                </View>
                <View>
                    <TouchableOpacity
                        onPress={() => {
                            if (selectedPaymentMethod === 'Dinheiro') {
                                handleConfirm();
                            } else {
                                handlePaymentButtonClick();
                            }
                        }} style={{ backgroundColor: themeColors.bgColor(1) }}
                        className="p-3 rounded-full"
                    >
                        <Text className="text-white text-center font-bold text-lg">
                            {selectedPaymentMethod === 'Dinheiro' ? 'CONFIRMAR' : 'PAGAR'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>

    )
}
