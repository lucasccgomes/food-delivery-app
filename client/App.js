// No arquivo App.js
import React from 'react';
import { View } from 'react-native';
import { Provider as ReduxProvider } from 'react-redux';
import { store } from './store';
import 'expo-dev-client';
import { GoogleSigninButton } from '@react-native-google-signin/google-signin';
import Navigation from './navigation';
import { UserProvider } from './context/UserContext';

export default function App() {
  return (
    <UserProvider>
      <ReduxProvider store={store}>
        <Navigation />
      </ReduxProvider>
    </UserProvider>
  );
}
