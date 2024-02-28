import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react'
import Home from './screens/Home';
import Establishment from './screens/Establishment';
import Cart from './screens/Cart';
import MakeWish from './screens/MakeWish';
import Delivery from './screens/Delivery';
import Pay from './screens/Pay';
import PagamentoStatus from './screens/PagamentoStatus';
import AddInfo from './screens/AddInfo';

const Stack = createNativeStackNavigator();

export default function Navigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{
        headerShown: false,
      }}>
        <Stack.Screen name="Home" component={Establishment} />
        <Stack.Screen name="Cart"  component={Cart} />
        <Stack.Screen name="MakeWish"  component={MakeWish} />
        <Stack.Screen name="Delivery"  component={Delivery} />
        <Stack.Screen name="Pay" component={Pay} />
        <Stack.Screen name="PagamentoStatus" component={PagamentoStatus} />
        <Stack.Screen name="AddInfo" component={AddInfo} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

