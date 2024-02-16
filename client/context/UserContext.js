// No arquivo UserContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import auth from '@react-native-firebase/auth';
import { GoogleSignin, GoogleSigninButton } from '@react-native-google-signin/google-signin';
import { View } from 'react-native';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {


const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState();


  GoogleSignin.configure({
    webClientId: '259606439469-qunge51ehl01u8t3rosvhgh7fdgg3ujl.apps.googleusercontent.com',
  });

   // Handle user state changes
   function onAuthStateChanged(user) {
    if (user) {
        console.log("UserID:", user.uid);
        setUser({ uid: user.uid, ...user });
      } else {
        setUser(null);
      }
  if (initializing) setInitializing(false);
}

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber;
  }, []);

  const onGoogleButtonPress = async () => {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const { idToken } = await GoogleSignin.signIn();
    const googleCredential = auth.GoogleAuthProvider.credential(idToken);
   const user_sign_in = auth().signInWithCredential(googleCredential);
   user_sign_in.then((user) => {

   })
   .catch((error) =>{
    console.log(error)
   })
  }

  if (initializing) return null;

if (!user) {
  return (
    <View classname="flex items-center justify-center">
  <GoogleSigninButton
  onPress={onGoogleButtonPress}
  />
    </View>
  )
}

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};



