// No arquivo UserContext.js
import React, { createContext, useState, useContext, useEffect, Modal } from 'react';
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { Image, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { themeColors } from '../theme';
import firestore from '@react-native-firebase/firestore';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);
  const [logoUrl, setLogoUrl] = useState('');
  const [fraseLogin, setFraseLogin] = useState('');
  const [boasVindas, setBoasVindas] = useState('');

  GoogleSignin.configure({
    webClientId: '216264872510-sd38c2d73hlkdus13591s1ql05vpigoe.apps.googleusercontent.com',
  });

  useEffect(() => {
    const docRef = firestore()
      .collection('admin')
      .doc('carol');
    const unsubscribe = docRef.onSnapshot(doc => {
      if (doc.exists) {
        const data = doc.data();
        setLogoUrl(data.urlLogo);
        setFraseLogin(data.fraseLogin);
        setBoasVindas(data.boasVindas);
      } else {
        console.log('Documento não encontrado');
      }
    }, error => {
      console.error('Erro ao obter as cidades:', error);
    });

    return () => unsubscribe();
  }, []);


  // Handle user state changes
  function onAuthStateChanged(user) {
    if (user) {
      setUser({
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
      });
      const photoURL = user.photoURL;

      if (photoURL) {
        // Aqui você tem a URL da foto de perfil
        console.log("Foto de Perfil:", photoURL);
      }
    } else {
      setUser(null);
    }
    if (initializing) setInitializing(false);

    console.log("Dados do usuário:", user?.uid, user?.displayName);
  }


  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber; // Desinscreve-se ao desmontar
  }, []);


  const onGoogleButtonPress = async () => {
    const { idToken } = await GoogleSignin.signIn();
    const googleCredential = auth.GoogleAuthProvider.credential(idToken);
    return auth().signInWithCredential(googleCredential);
  };

  const signOut = async () => {
    try {
      await auth().signOut();
      console.log('Usuário deslogado com sucesso');
    } catch (error) {
      console.error('Erro ao deslogar:', error);
    }
  };

  if (initializing) return null;

  return !user ? (
    <View
      className="h-full flex-1 items-center justify-center"
      style={{ backgroundColor: themeColors.bgColor(0.5) }}>
         <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      <View className=""
      >

        {!logoUrl ? (
          <Text></Text>
        ) : (
          <Image className="h-[400px] w-[400px]"
            source={{ uri: logoUrl }}
          />
        )
        }
      </View>
      <View className="mb-11">
        <Text className="text-white text-center">
          {fraseLogin}
        </Text>
        <Text className="text-center text-white">
        {boasVindas}
        </Text>
      </View>
      <View className="border-t-2 border-white px-11 pt-5">
        <Text className="text-white mb-4">
          Faça login com sua conta Google!
        </Text>
      </View>
      <TouchableOpacity
        onPress={onGoogleButtonPress}
        style={{ backgroundColor: themeColors.bgColor(1) }}
        className="p-3 rounded-full flex flex-row justify-center items-center"
      >
        <Image
          source={require('../assets/images/logoGoogle.png')}
          className="h-10 w-10 mr-2" />
        <Text className="text-white text-center font-bold text-lg"

        >
          Fazer login
        </Text>
      </TouchableOpacity>
    </View>
  ) : (
    <UserContext.Provider value={{ user, setUser, signOut }}>
      {children}
    </UserContext.Provider>
  );
};