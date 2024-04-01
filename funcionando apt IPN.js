const functions = require('@google-cloud/functions-framework');
const axios = require('axios');
// Importando as funções necessárias do Firebase e Firestore
const { initializeApp } = require("firebase/app");
const { getFirestore, collection, addDoc, doc, updateDoc, setDoc } = require("firebase/firestore");


// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyA6gSBFodUm8DWkE7m1MVYQ95WCvPXLRxM",
    authDomain: "food-delivery-app-671e2.firebaseapp.com",
    projectId: "food-delivery-app-671e2",
    storageBucket: "food-delivery-app-671e2.appspot.com",
    messagingSenderId: "259606439469",
    appId: "1:259606439469:web:651498bf5f20ade0b3faa4",
    measurementId: "G-DGT32DC586"
};
// Inicialização do Firebase
const app = initializeApp(firebaseConfig);
// Inicialização do Firestore
const db = getFirestore(app);

const ACCESS_TOKEN = 'APP_USR-7537499248883940-022010-8782c08d31a1f0a7692549b66891d836-72504158';
const MERCADO_PAGO_API_URL = 'https://api.mercadopago.com';

functions.http('mercadoPagoIPN', async (req, res) => {
    if (req.method === 'POST') {
        const { topic, id } = req.query;

        console.log(`Recebido tópico: ${topic}, com ID: ${id}`);
        res.status(200).send('Notificação IPN recebida com sucesso');

        if (topic === 'merchant_order') {
            try {
                const response = await axios.get(`${MERCADO_PAGO_API_URL}/merchant_orders/${id}?access_token=${ACCESS_TOKEN}`);
                const merchantOrderInfo = response.data;

                const externalReference = merchantOrderInfo.external_reference;
                const preferenceId = merchantOrderInfo.preference_id;

                if (merchantOrderInfo.payments.length > 0) {
                    const payment = merchantOrderInfo.payments[0];

                    // Estrutura de pagamentos com uma subcoleção 'Preference ID'
                    const pagamentosRef = collection(db, "usuarios", externalReference, "pedidos");
                    const preferenceDocRef = doc(pagamentosRef, preferenceId);

                    // Informações do pagamento a serem salvas
                    const paymentInfo = {
                        status: payment.status, // Pode incluir mais informações do pagamento se necessário
                        numpedido: id
                    };

                    // Atualiza ou cria o documento com o ID da preferência com as informações do pagamento
                    await setDoc(preferenceDocRef, paymentInfo, { merge: true });

                    console.log('Detalhes do pagamento atualizados com sucesso');
                } else {
                    console.log('Nenhum pagamento encontrado para esta ordem do comerciante.');
                }
            } catch (error) {
                console.error('Erro ao obter informações da ordem do comerciante:', error);
            }
        } else if (topic === 'payment') {
            // Processamento para notificações de tipo 'payment'
            // ...
        } else {
            console.log('Tipo de notificação recebido não é processado por esta função:', topic);
        }
    } else {
        res.status(405).send('Método não permitido');
    }
});