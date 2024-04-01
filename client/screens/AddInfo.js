import React, { useState, useEffect } from 'react';
import { TextInput, View, Image, Text, TouchableOpacity, StatusBar, SafeAreaView, Dimensions} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { useUser } from '../context/UserContext';
import { themeColors } from '../theme';
import { useForm, Controller } from 'react-hook-form';
import { Picker } from '@react-native-picker/picker';

const { width, height } = Dimensions.get('window');

const AddInfo = ({ navigation }) => {
  const { user } = useUser();
  const [logoUrl, setLogoUrl] = useState('');
  const [cidades, setCidades] = useState([]);


  const { control, handleSubmit, formState: { errors }, setValue } = useForm();

  useEffect(() => {
    const docRef = firestore()
    .collection('admin')
    .doc('carol');
    const unsubscribe = docRef.onSnapshot(doc => {
      if (doc.exists) {
        const data = doc.data();
        setLogoUrl(data.urlLogo);
        setCidades(data.cidades);
      } else {
        console.log('Documento não encontrado');
      }
    }, error => {
      console.error('Erro ao obter as cidades:', error);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (cidades.length > 0) {
      setValue("cidade", cidades[0], { shouldValidate: true });
    }
  }, [cidades, setValue]);

  useEffect(() => {
    if (!user || !user.uid) {
      Alert.alert('Erro', 'Não foi possível identificar o usuário. Por favor, faça login novamente.');
      navigation.navigate('Login');
    }
  }, [user, navigation]);

  const onSubmit = async (data) => {
    if (!user || !user.uid) {
      console.error("userUid não está disponível.");
      return;
    }

    const pontoReferencia = data.pontoReferencia || 'Sem Ponto de Referencia';

    try {
      const userRef = firestore().collection('usuarios').doc(user.uid);
      await userRef.set({
        EnderecoEntrega: {
          Cidade: data.cidade,
          Rua: data.rua,
          Numero: data.numero,
          Bairro: data.bairro,
          PontoReferencia: pontoReferencia,
        },
        WhatsApp: data.phone,
        Nome_2: data.nome,
      }, { merge: true });

      console.log(`Endereço adicionado ao documento do usuário: ${user.uid}`);
      navigation.navigate('Home');
    } catch (error) {
      console.error("Erro ao adicionar endereço:", error);
      Alert.alert('Erro', 'Erro ao adicionar endereço. Tente novamente.');
    }
  };

  const formatWhatsApp = (value) => {
    const numbers = value.replace(/\D/g, '');
    let formatted = numbers.slice(0, 2);
    if (formatted.length) formatted = `(${formatted}`;
    if (numbers.length >= 3) formatted += `)${numbers.slice(2, 7)}`;
    if (numbers.length >= 8) formatted += `-${numbers.slice(7, 11)}`;

    return formatted;
  };


  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      <View
        className="h-full w-full flex justify-center items-center"
        style={{ backgroundColor: themeColors.bgColor(0.5) }}
      >
        <View className=""
          style={{ marginTop: width < 400 ? -140 : -50, }}
        >

          {!logoUrl ? (
            <Text></Text>
          ) : (
            <Image className="h-48"
              style={{ width: width < 400 ? 300 : 400, }}
              source={{ uri: logoUrl }}
            />
          )
          }
        </View>

        <Text className="text-2xl text-white font-bold"
          style={{ marginBottom: width < 400 ? 10 : 30, marginTop: width < 400 ? -55 : -5, fontSize: width < 400 ? 20 : 25, }}
        >
          Preencha as Informações
        </Text>
        <View className="w-[75%]"
          style={{ height: width < 400 ? 300 : 500, }}
        >
            {/* Campo Nome */}
            <Controller
              control={control}
              rules={{
                required: 'Nome é obrigatório',
                minLength: {
                  value: 3,
                  message: 'Nome deve ter no mínimo 3 caracteres'
                },
                pattern: {
                  value: /^[A-Za-z\s]+$/,
                  message: 'Nome deve conter apenas letras'
                }
              }}
              render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                <View>
                  <TextInput
                    className="bg-white p-2 rounded-lg"
                    style={{ height: width < 400 ? 40 : 50,  marginBottom: width < 400 ? 5 : 10}}
                    onBlur={onBlur}
                    onChangeText={(text) => {
                      // Remove tudo que não é letra ou espaço antes de atualizar
                      const onlyLetters = text.replace(/[^A-Za-z\s]/g, '');
                      onChange(onlyLetters);
                    }}
                    value={value}
                    placeholder="Nome Completo"
                  />
                  {error && <Text className="text-red-600 -mt-3 mb-3">{error.message}</Text>}
                </View>
              )}
              name="nome"
            />


            {/* Campo Cidade */}
            <Controller
              control={control}
              rules={{
                required: 'Cidade é obrigatória',
              }}
              render={({ field: { onChange, value }, fieldState: { error } }) => (
                <View className="bg-white flex justify-center rounded-lg"
                style={{marginBottom: width < 400 ? 5 : 10}}
                >
                  <Picker
                    style={{ height: width < 400 ? 35 : 50, }}
                    className="bg-white rounded-lg"
                    selectedValue={value}
                    onValueChange={(itemValue, itemIndex) => onChange(itemValue)}
                  >
                   {cidades.map((cidade, index) => (
    <Picker.Item key={index} label={cidade} value={cidade} />
  ))}
                  </Picker>
                  {error && <Text className="text-red-600 -mt-3 mb-3">{error.message}</Text>}
                </View>
              )}
              name="cidade"
            />

            {/* Campo Rua */}
            <Controller
              control={control}
              rules={{
                required: 'Rua é obrigatória',
                minLength: {
                  value: 3,
                  message: 'Rua deve ter no mínimo 3 caracteres'
                },
                pattern: {
                  value: /^[A-Za-z0-9\sáàâãéèêíïóôõöúçñÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ]+$/,
                  message: 'Rua deve conter letras, números e acentos'
                }
              }}

              render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                <View>
                  <TextInput
                    className="bg-white p-2 mb-3 rounded-lg"
                    style={{ height: width < 400 ? 40 : 50, marginBottom: width < 400 ? 5 : 10}}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    placeholder="Rua"
                  />
                  {error && <Text className="text-red-600 -mt-3 mb-3">{error.message}</Text>}
                </View>
              )}
              name="rua"
            />

            {/* Campo Bairro */}
            <Controller
              control={control}
              rules={{
                required: 'Bairro é obrigatório',
                minLength: {
                  value: 2,
                  message: 'Bairro deve ter no mínimo 2 caracteres'
                },
                pattern: {

                }
              }}

              render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                <View>
                  <TextInput
                    style={{ height: width < 400 ? 40 : 50, marginBottom: width < 400 ? 5 : 10}}
                    className="bg-white p-2 mb-3 rounded-lg"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    placeholder="Bairro"
                  />
                  {error && <Text className="text-red-600 -mt-3 mb-3">{error.message}</Text>}
                </View>
              )}
              name="bairro"
            />
            {/* Campo Numero */}
            <Controller
              control={control}
              rules={{
                required: 'Número é obrigatório',
                minLength: {
                  value: 1,
                  message: 'Número deve ter no mínimo 1 caractere'
                },
                pattern: {
                  value: /^\d+$/,
                  message: 'Número deve conter apenas números'
                }
              }}
              render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                <View>
                  <TextInput
                    style={{ height: width < 400 ? 40 : 50, marginBottom: width < 400 ? 5 : 10}}
                    className="bg-white p-2 mb-3 rounded-lg"
                    onBlur={onBlur}
                    onChangeText={(text) => {
                      // Remove tudo que não é número antes de atualizar
                      const onlyNums = text.replace(/[^0-9]/g, '');
                      onChange(onlyNums);
                    }}
                    value={value}
                    placeholder="Numero"
                    keyboardType="numeric" // Isso assegura que o teclado numérico seja mostrado
                  />
                  {error && <Text className="text-red-600 -mt-3 mb-3">{error.message}</Text>}
                </View>
              )}
              name="numero"
            />


            {/* Campo PtRefrencia */}
            <Controller
              control={control}
              rules={{
                maxLength: {
                  value: 25,
                  message: 'Ponto de referência deve ter no máximo 25 caracteres'
                }
              }}
              render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                <View>
                  <TextInput
                    style={{ height: width < 400 ? 40 : 50, marginBottom: width < 400 ? 5 : 10}}
                    className="bg-white p-2 mb-3 rounded-lg"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    placeholder="Ponto de referência (Opcional)"
                  />
                  {error && <Text className="text-red-600 -mt-3 mb-3">{error.message}</Text>}
                </View>
              )}
              name="pontoReferencia"
            />

            {/* Campo WahtsApp */}
            <Controller
              control={control}
              rules={{
                required: 'WhatsApp é obrigatório',
                pattern: {
                  value: /^\(\d{2}\)\d{4,5}-\d{4}$/,
                  message: 'WhatsApp deve estar no formato (XX)XXXXX-XXXX'
                }
              }}
              render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                <View>
                  <TextInput
                    style={{ height: width < 400 ? 40 : 50,}}
                    className="bg-white p-2 mb-3 rounded-lg"
                    onBlur={onBlur}
                    onChangeText={(text) => {
                      // Aplica a formatação e atualiza o valor
                      const formattedText = formatWhatsApp(text);
                      onChange(formattedText);
                    }}
                    value={value}
                    placeholder="WhatsApp"
                    keyboardType="phone-pad"
                  />
                  {error && <Text className="text-red-600 -mt-3 mb-3">{error.message}</Text>}
                </View>
              )}
              name="phone"
            />

            <View className="mt-5 mb-5"
              style={{ marginTop: width < 400 ? 3 : 20, }}
            >
              <TouchableOpacity
                onPress={handleSubmit(onSubmit)}
                style={{ backgroundColor: themeColors.bgColor(1) }}
                className="p-3 rounded-full"
              >
                <Text className="text-white text-center font-bold text-lg"

                >
                  Confirmar
                </Text>
              </TouchableOpacity>
            </View>
        </View>
      </View>
   
    </SafeAreaView >
  );
};


export default AddInfo;


