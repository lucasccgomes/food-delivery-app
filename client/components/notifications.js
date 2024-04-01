import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';
import { Alert, Button, View } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function Notifica() {

    useEffect(() => {
        const requestPermissions = async () => {
          let { status } = await Notifications.getPermissionsAsync();
          if (status !== 'granted') {
            const { status: newStatus } = await Notifications.requestPermissionsAsync();
            status = newStatus;
          }
    
          if (status !== 'granted') {
            Alert.alert('Permissão necessária', 'Você não deixou as notificações ativas. Por favor, habilite as notificações nas configurações do seu dispositivo.');
          } else {
            // Opcional: Agendar uma notificação ou realizar outras ações depois que a permissão for concedida
            console.log('Permissão para notificações concedida.');
          }
        };
    
        requestPermissions();
      }, []);

  const handleCallNotification = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Você não deixou as notificações ativas.');
      return;
    }
const token = await Notifications.getExpoPushTokenAsync();
  };

  return (
  
    <View className="flex h-full justify-center items-center">
      <Button title="Ativar Notificação" onPress={handleCallNotification} />
      </View>
  );
}

