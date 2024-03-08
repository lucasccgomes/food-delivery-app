// src/services/UserService.js
import firestore from '@react-native-firebase/firestore';

export const getUserInfo = async (userId) => {
    const userDoc = await firestore().collection('usuarios').doc(userId).get();
    return userDoc.exists ? userDoc.data() : null;
};

export const updateUserAddress = async (userId, address) => {
    await firestore().collection('usuarios').doc(userId).update({
        EnderecoEntrega: address,
    });
};
