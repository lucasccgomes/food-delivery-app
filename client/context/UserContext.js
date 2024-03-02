// No arquivo UserContext.js
import React, { createContext, useState, useContext, useEffect, Modal } from 'react';
import auth from '@react-native-firebase/auth';
import { GoogleSignin, GoogleSigninButton } from '@react-native-google-signin/google-signin';
import { View } from 'react-native';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);

  GoogleSignin.configure({
    webClientId: '259606439469-qunge51ehl01u8t3rosvhgh7fdgg3ujl.apps.googleusercontent.com',
  });

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
    <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
      <GoogleSigninButton onPress={onGoogleButtonPress} />
    </View>
  ) : (
    <UserContext.Provider value={{ user, setUser, signOut }}>
      {children}
    </UserContext.Provider>
  );
};