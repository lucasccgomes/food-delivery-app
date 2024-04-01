const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios'); // Adicione axios para fazer a requisição HTTP para o Expo

admin.initializeApp();

exports.sendNewOrderNotification = functions.firestore
    .document('usuarios/{userId}/pedidosMoney/{orderId}')
    .onCreate(async (snapshot, context) => {
        // ID do usuário e do pedido a partir do contexto do documento que acionou a função
        const userId = context.params.userId;
        const orderId = context.params.orderId;

        try {
            // Recuperar o documento do usuário para obter o token de notificação do Expo
            const userRef = admin.firestore().collection('usuarios').doc(userId);
            const userDoc = await userRef.get();

            if (!userDoc.exists) {
                console.log('Não foi possível encontrar o documento do usuário.');
                return null;
            }

            // Recuperar o token de notificação do documento do usuário
            const userToken = userDoc.data().notificationToken;
            if (!userToken) {
                console.log('Token de notificação não encontrado para o usuário:', userId);
                return null;
            }

            // Crie a mensagem de notificação para o Expo
            const message = {
                to: userToken,
                sound: 'default',
                title: 'Novo Pedido!',
                body: `Você tem um novo pedido com ID: ${orderId}.`,
                data: { orderId }, // Informações adicionais que podem ser úteis no app cliente
            };

            // Envie a notificação push para o token do dispositivo do usuário via Expo
            const response = await axios.post('https://exp.host/--/api/v2/push/send', message, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            });

            console.log('Notificação enviada com sucesso:', response.data);
        } catch (error) {
            console.error('Erro ao enviar notificação:', error);
        }
    });
