import { View, Text, TouchableOpacity, Image, ScrollView, Modal, Alert, Dimensions, StatusBar } from 'react-native'
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
import AddressModal from '../components/AddressModal';


const { width, height } = Dimensions.get('window');


export default function Pay() {
    const dispatch = useDispatch();
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
    const [changeAmount, setChangeAmount] = useState('');
    const [changeNeeded, setChangeNeeded] = useState('');
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [userAddress, setUserAddress] = useState('');
    const [enderecoRetirada, setEnderecoRetirada] = useState('');
    const [orderItems, setOrderItems] = useState([]);
    const [paymentDetails, setPaymentDetails] = useState({ title: '', description: '', categoria: '' });
    const [nameUid, setNameUid] = useState('');
    const [nameUsuario, setNameUsuario] = useState('');
    const [retiradaEntrega, setRetiradaEntrega] = useState('');

    console.log('Troco para:', changeAmount)
    console.log('Cliente:', changeNeeded)
    console.log('Meio de pagamento:', selectedPaymentMethod)
    console.log('ID do Usuario (PAY):', user.uid)
    console.log('Valor total do pedido (totalOrderValue):', totalOrderValue);

    useEffect(() => {
        const fetchPaymentDetails = async () => {
            try {
                const docRef = firestore().collection('admin').doc('carol');
                const docSnapshot = await docRef.get();
                if (docSnapshot.exists) {
                    const { title, descricao, categoria } = docSnapshot.data();
                    // Certifique-se de incluir a categoria ao definir o estado.
                    setPaymentDetails({ title, description: descricao, categoria });
                } else {
                    console.log("Documento não encontrado no Firestore");
                }
            } catch (error) {
                console.error("Erro ao buscar dados no Firestore:", error);
            }
        };

        fetchPaymentDetails();
    }, []);

    useEffect(() => {
        if (user && user.uid) {
            const unsubscribe = firestore()
                .collection('usuarios')
                .doc(user.uid)
                .onSnapshot(docSnapshot => {
                    if (docSnapshot.exists) {
                        const data = docSnapshot.data();
                        setNameUid(data.NomeDoUsuario);
                        setNameUsuario(data.Nome_2);
                        setRetiradaEntrega(data.RetiradaEntrega)
                        const items = data.itemsDoPedido.map(item => ({
                            quantity: item.quantity,
                            title: item.title,
                            _id: item._id,
                            unit_price: item.unit_price
                        }));
                        setOrderItems(items);
                    } else {
                        console.log('Documento do usuário não encontrado');
                    }
                }, err => {
                    console.error('Erro ao buscar itens do pedido:', err);
                });

            return () => unsubscribe();
        }
    }, [user]);

    useEffect(() => {
        const fetchEnderecoRetirada = async () => {
            const docRef = firestore().collection('admin').doc('carol');
            const docSnapshot = await docRef.get();
            if (docSnapshot.exists) {
                const data = docSnapshot.data();
                setEnderecoRetirada(data.EnderecoRetirada);
            } else {
                console.log("Documento não encontrado");
            }
        };

        fetchEnderecoRetirada();
    }, []);

    useEffect(() => {
        if (userInfo && userInfo.EnderecoEntrega) {
            const { Rua, Numero, Bairro, Cidade } = userInfo.EnderecoEntrega;
            const address = `${Rua}, ${Numero}, ${Bairro}, ${Cidade}`;
            setUserAddress(address);
        }
    }, [userInfo]);

    useEffect(() => {
        const fetchEnderecoRetirada = async () => {
            if (deliveryOption === 'Retirar no Local') {
                const docRef = firestore().collection('admin').doc('carol');
                const docSnapshot = await docRef.get();
                if (docSnapshot.exists) {
                    const data = docSnapshot.data();
                    setAddress(
                        <View className="flex justify-center items-center ">
                            <Text className="font-bold">
                                Retirada
                            </Text>
                            <Text className="text-center">
                                {data.EnderecoRetirada}
                            </Text>
                        </View>
                    );
                }
            } else {
                if (userInfo && userInfo.EnderecoEntrega) {
                    const { Rua, Numero, Bairro, Cidade } = userInfo.EnderecoEntrega;
                    setAddress(
                        <View className="flex justify-center items-center ">
                            <Text className="font-bold text-center">
                                Entrega
                            </Text>
                            <Text className="text-center">
                                {userInfo && userInfo.EnderecoEntrega ? `${userInfo.EnderecoEntrega.Rua}, ${userInfo.EnderecoEntrega.Numero}, ${userInfo.EnderecoEntrega.Bairro}, ${userInfo.EnderecoEntrega.Cidade}` : 'Carregando endereço...'}
                            </Text>
                        </View>
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

    const extractPrefIdFromUrl = (url) => {
        try {
            const params = new URLSearchParams(url.split('?')[1]);
            return params.get('pref_id');
        } catch (error) {
            console.error('Erro ao extrair o pref_id da URL:', error);
            return null; // Retorna null em caso de erro
        }
    };

    const waitAndCheckPaymentStatus = async (userId, prefId, totalOrderValue, taxaCartaoFor, maxWaitTime = 600000, interval = 4000) => {
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

    useEffect(() => {
        if (selectedPaymentMethod !== 'Dinheiro') {
            setChangeNeeded('');
            setChangeAmount('');
        }
    }, [selectedPaymentMethod]);

    useEffect(() => {
        const fetchTaxaCartao = async () => {
            try {
                const docRef = firestore().collection('admin').doc('carol');
                const docSnapshot = await docRef.get();
                if (docSnapshot.exists) {
                    const data = docSnapshot.data();
                    setTaxaCartao((data.porcentagemCartao / 100) * totalOrderValue);
                } else {
                    console.log("Documento não encontrado no Firestore");
                }
            } catch (error) {
                console.error("Erro ao buscar a taxa do cartão no Firestore:", error);
            }
        };
    
        if (selectedPaymentMethod === 'Cartão de Crédito') {
            fetchTaxaCartao();
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
        } else {
            const url = await handleIntegrationMP(selectedPaymentMethod, valorTotalComTaxa, paymentDetails.title, paymentDetails.description, paymentDetails.categoria, userId);
            if (url) {
                setPaymentUrl(url);
                setIsModalVisible(true);

                const prefId = extractPrefIdFromUrl(url);

                if (prefId) {
                    const paymentStatus = await waitAndCheckPaymentStatus(userId, prefId);
                    setIsModalVisible(false);
                    console.log('Tentando navegar para PagamentoStatus', paymentStatus);
                    if (paymentStatus === 'approved') {
                        await updateStock(orderItems);
                        navigation.reset({
                            index: 0,
                            routes: [{ name: 'PagamentoStatus', params: { prefId } }],
                        });
                        dispatch(emptyCart());
                    } else {
                        console.log('Pagamento não aprovado ou erro na verificação.');
                    }
                } else {
                    console.log('Não foi possível extrair o pref_id da URL.');
                }
            } else {
            }
        }
    };

    const updateStock = async (orderItems) => {
        const batch = firestore().batch();

        orderItems.forEach((item) => {
            const itemRef = firestore()
                .collection('admin')
                .doc('carol')
                .collection('GerenciaEstoque')
                .doc(item._id); // Aqui usamos o _id que vem dos orderItems

            // Este comando decrementará a quantidade em estoque
            batch.update(itemRef, {
                qtdEstoque: firestore.FieldValue.increment(-item.quantity)
            });
        });

        try {
            await batch.commit();
            console.log('Estoque atualizado com sucesso.');
        } catch (error) {
            console.error('Erro ao atualizar o estoque:', error);
        }
    };

    const handlePaymentButtonClick = () => {
        if (!selectedPaymentMethod) {
            Alert.alert(
                "Aviso", // Título do alerta
                "Você precisa selecionar um meio de pagamento!", // Mensagem do alerta
                [
                    { text: "OK" } // Botão para fechar o alerta
                ]
            );
        } else {
            handleBuy(selectedPaymentMethod, setPaymentUrl, setIsModalVisible, navigation, user.uid);
        }
    };

    const handleUpdateAddress = (newAddress) => {
        setUserInfo((prevState) => ({
            ...prevState,
            EnderecoEntrega: newAddress,
        }));
    };

    const valorTotalComTaxa = totalOrderValue + taxaCartaoFor;

    const saveTotalValueIfPaymentApproved = async (userId, prefId) => {
        try {
            let dataToSave = {
                ValorTotal: valorTotalComTaxa,
                itemsDoPedido: orderItems,
                NomeDoUsuario: nameUid,
                Nome_2: nameUsuario,
                RetiradaEntrega: retiradaEntrega,
                StatusEntrega: 'Aguardando',
                TipoPagamento: selectedPaymentMethod,
                userId: userId,
                collection: 'pedidos',
                timestamp: firestore.FieldValue.serverTimestamp(),

            };
            if (deliveryOption === 'Retirar no Local') {
                dataToSave.EnderecoRetirada = enderecoRetirada;
            } else {
                dataToSave.EnderecoEntrega = userAddress;
            }
            await firestore()
                .collection('usuarios')
                .doc(userId)
                .collection('pedidos')
                .doc(prefId)
                .set(dataToSave, { merge: true });
        } catch (error) {
            console.error('Erro ao salvar os detalhes do pedido:', error);
        }
    };

    async function generateUniqueNumeroPedido() {
        const ref = firestore().collection('metadata').doc('pedidoCounter');
        // Usar uma transação para garantir atomicidade
        const newCount = await firestore().runTransaction(async (transaction) => {
            const doc = await transaction.get(ref);
            // Se o documento existe e tem um campo 'count', incremente-o. Caso contrário, comece de 10000
            const nextCount = doc.exists && doc.data().count ? doc.data().count + 1 : 10000;
            // Atualize o contador no documento
            transaction.set(ref, { count: nextCount });
            // Retorne o novo valor para ser usado como parte do número do pedido
            return nextCount;
        });
        // Retorne o número do pedido formatado
        return `PM${newCount}`;
    }

    const handleConfirm = async (userId) => {
        try {
            const numeroPedido = await generateUniqueNumeroPedido();
            let dataToSave = {
                ValorTotal: valorTotalComTaxa,
                numpedido: numeroPedido,
                itemsDoPedido: orderItems,
                NomeDoUsuario: nameUid,
                Nome_2: nameUsuario,
                status: 'Na entrega',
                RetiradaEntrega: retiradaEntrega,
                StatusEntrega: 'Aguardando',
                TipoPagamento: selectedPaymentMethod,
                userId: userId,
                collection: 'pedidosMoney',
                timestamp: firestore.FieldValue.serverTimestamp(),
            };

            if (retiradaEntrega === 'Retirar no Local') {
                dataToSave.EnderecoRetirada = enderecoRetirada;
            } else {
                dataToSave.EnderecoEntrega = userAddress;
            }
            const docRef = await firestore()
                .collection('usuarios')
                .doc(userId)
                .collection('pedidosMoney')
                .add(dataToSave);

            console.log('Pedido salvo com sucesso! ID do documento:', docRef.id);
            let prefId = docRef.id;

            navigation.navigate('PayTroco', { prefId, orderItems, valorTotalComTaxa });

        } catch (error) {
            console.error('Erro ao salvar os detalhes do pedido:', error);
        }
    };
    console.log('itens do pedido', orderItems)

    return (
        <View className="bg-white flex-1 mt-10 rounded-2xl">
            <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
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
                    style={{ width: width < 380 ? 50 : 70, height: width < 380 ? 50 : 70, }}
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
                            className="font-bold mr-3 pr-1"
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
                  onPress={() => setIsModalVisible(false)}
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
            <View className="-mt-2">
                <Text className="text-center font-bold text-xl">
                    Pagar
                </Text>
                <Text className="text-center text-gray-500">
                  
                </Text>
            </View>
                    <WebView
                        source={{ uri: paymentUrl }}
                        style={{ flex: 1 }}
                    />

                </Modal>

                {/* Modal para edição de endereço */}
                <AddressModal
                    isVisible={editModalVisible}
                    onClose={() => setEditModalVisible(false)} // Certifique-se de que isso está sendo passado corretamente
                    onUpdateAddress={handleUpdateAddress}
                    showWhatsAppInput={false}
                />

                {/* Meios de Pagamento*/}
                <View className="flex justify-center items-center h-[80%]"
                    style={{ marginTop: width < 380 ? 20 : 30, }}
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
                        onPress={() => { setSelectedPaymentMethod('Dinheiro'); }}
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
                    <Text className="text-gray-700 font-extrabold">R${valorTotalComTaxa}</Text>
                </View>
                <View>
                    <TouchableOpacity
                        onPress={() => {
                            if (selectedPaymentMethod === 'Dinheiro') {
                                handleConfirm(user.uid);
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
