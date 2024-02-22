import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react'
import Home from './screens/Home';
import Establishment from './screens/Establishment';
import Cart from './screens/Cart';
import MakeWish from './screens/MakeWish';
import Delivery from './screens/Delivery';
import Pay from './screens/Pay';

const Stack = createNativeStackNavigator();

export default function Navigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{
        headerShown: false,
      }}>
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Establishment" component={Establishment} />
        <Stack.Screen name="Cart" options={{ presentation: 'transparentModal' }} component={Cart} />
        <Stack.Screen name="MakeWish" options={{ presentation: 'fullScreenModal' }} component={MakeWish} />
        <Stack.Screen name="Delivery" options={{ presentation: 'fullScreenModal' }} component={Delivery} />
        <Stack.Screen name="Pay" options={{ presentation: 'fullScreenModal' }} component={Pay} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

