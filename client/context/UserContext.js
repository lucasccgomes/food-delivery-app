// No arquivo UserContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
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
    setUser(user ? user.uid : null);
    if (initializing) setInitializing(false);

    console.log("ID do Usuario-(UserContext):", user.uid);
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

  if (initializing) return null;

  return !user ? (
    <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
      <GoogleSigninButton onPress={onGoogleButtonPress} />
    </View>
  ) : (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};