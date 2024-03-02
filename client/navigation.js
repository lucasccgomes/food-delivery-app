import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useUser } from './context/UserContext'; // Importe o hook useUser do seu contexto de usuário
import firestore from '@react-native-firebase/firestore'; // Importe o firestore
import { LogIn } from 'react-native-feather';
import Establishment from './screens/Establishment';
import Cart from './screens/Cart';
import MakeWish from './screens/MakeWish';
import Delivery from './screens/Delivery';
import Pay from './screens/Pay';
import AddInfo from './screens/AddInfo';
import Profile from './screens/Profile';
import PagamentoStatus from './screens/PagamentoStatus';

const Stack = createNativeStackNavigator();

export default function Navigation() {
  const { user } = useUser(); // Obtenha o estado do usuário do contexto

  const [isLoading, setIsLoading] = useState(true);
  const [userExists, setUserExists] = useState(false);
  const [enderecoEntregaExists, setEnderecoEntregaExists] = useState(false);

  // Verifica se o usuário existe no Firestore
  useEffect(() => {
    console.log("Verificando usuário no Firestore...");
    if (user && user.uid) {
      const userRef = firestore().collection('usuarios').doc(user.uid);
      const unsubscribe = userRef.onSnapshot(doc => {
        console.log("Documento do usuário encontrado:", doc.exists);
        if (doc.exists) {
          setUserExists(true);
          const enderecoEntrega = doc.data().EnderecoEntrega;
          console.log("Endereço de entrega no documento:", !!enderecoEntrega);
          setEnderecoEntregaExists(!!enderecoEntrega);
          setIsLoading(false);
        } else {
          // Documento do usuário não existe, então crie um com campos vazios
          console.log(`Criando documento para o usuário: ${user.uid}`);
          userRef.set({
            Email: '',
            EnderecoEntrega: {},
            NomeDoUsuario: '',
            RetiradaEntrega: '',
            TaxadeEntrega: '',
            ValorTotal: '',
            WhatsApp: '',
          }).then(() => {
            setUserExists(true);
            setEnderecoEntregaExists(false); // Endereço de entrega está vazio
            setIsLoading(false);
          }).catch(error => {
            console.error("Erro ao criar o documento do usuário:", error);
            setIsLoading(false);
          });
        }
      }, error => {
        console.error("Erro ao verificar o usuário no Firestore:", error);
        setIsLoading(false);
      });
  
      return () => unsubscribe(); // Limpeza do listener
    } else {
      console.log("Nenhum usuário logado.");
      setIsLoading(false);
    }
  }, [user]);

  console.log("isLoading:", isLoading);
  console.log("userExists:", userExists);
  console.log("enderecoEntregaExists:", enderecoEntregaExists);

  if (isLoading) {
    return null; // Renderizar um indicador de carregamento enquanto verifica o usuário
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {userExists ? (
          enderecoEntregaExists ? (
            <>
              <Stack.Screen name="Home" component={Establishment} />
              <Stack.Screen name="Cart" options={{presentation: 'modal'}} component={Cart} />
              <Stack.Screen name="MakeWish" component={MakeWish} />
              <Stack.Screen name="Delivery" options={{presentation: 'fullScreenModal'}} component={Delivery} />
              <Stack.Screen name="Pay" options={{presentation: 'fullScreenModal'}} component={Pay} />
              <Stack.Screen name="PagamentoStatus" options={{presentation: 'fullScreenModal'}} component={PagamentoStatus} />
              <Stack.Screen name="Profile" options={{presentation: 'fullScreenModal'}} component={Profile} />
            </>
          ) : (
            <Stack.Screen name="AddInfo" component={AddInfo} />
          )
        ) : (
          <Stack.Screen name="Login" component={LogIn} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
