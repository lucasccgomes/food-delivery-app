const functions = require('@google-cloud/functions-framework');
const axios = require('axios');
// Importando as funções necessárias do Firebase e Firestore
const { initializeApp } = require("firebase/app");
const { getFirestore, collection, addDoc, doc, updateDoc } = require("firebase/firestore");


// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyA6gSBFodUm8DWkE7m1MVYQ95WCvPXLRxM",
    authDomain: "food-delivery-app-671e2.firebaseapp.com",
    projectId: "food-delivery-app-671e2",
    storageBucket: "food-delivery-app-671e2.appspot.com",
    messagingSenderId: "259606439469",
    appId: "1:259606439469:web:651498bf5f20ade0b3faa4"
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

        // Confirma rapidamente o recebimento da notificação ao Mercado Pago
        res.status(200).send('Notificação IPN recebida com sucesso');

        if (topic === 'merchant_order') {
            try {
                const response = await axios.get(`${MERCADO_PAGO_API_URL}/merchant_orders/${id}?access_token=${ACCESS_TOKEN}`);
                const merchantOrderInfo = response.data;
                console.log('Informações da ordem do comerciante:', merchantOrderInfo);

                // Extraindo a external_reference
                const externalReference = merchantOrderInfo.external_reference;

                if (merchantOrderInfo.payments.length > 0) {
                    const payment = merchantOrderInfo.payments[0]; // assumindo que queremos o primeiro pagamento
                    console.log(`Pagamento ID: ${payment.id}, Status: ${payment.status}, External Reference: ${externalReference}`);
                    // Prepara os dados do pagamento para salvar no Firestore
                    const pagamentoData = {
                        paymentId: payment.id,
                        status: payment.status
                        // adicione aqui outros campos que você queira salvar
                    };
                    // Atualiza os detalhes do pagamento no documento do pedido no Firestore
                    try {
                        const pedidoRef = doc(db, "pedidos", externalReference);
                        await updateDoc(pedidoRef, { pagamentos: pagamentoData }); // Aqui, estamos supondo que o campo no documento se chama 'pagamentos'
                        console.log('Detalhes do pagamento atualizados no documento do pedido com sucesso');
                    } catch (error) {
                        console.error('Erro ao atualizar detalhes do pagamento no documento do pedido:', error);
                    }
                } else {
                    console.log('Nenhum pagamento encontrado para esta ordem do comerciante.');
                }
            } catch (error) {
                console.error('Erro ao obter informações da ordem do comerciante:', error);
            }
        } else if (topic === 'payment') {
            // Processamento para notificações de tipo 'payment'
        } else {
            console.log('Tipo de notificação recebido não é processado por esta função:', topic);
        }
    } else {
        res.status(405).send('Método não permitido');
    }
});