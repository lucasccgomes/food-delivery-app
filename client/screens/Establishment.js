import { View, Text, ScrollView, Image, TouchableOpacity, StatusBar } from 'react-native'
import React, { useEffect } from 'react'
import { useNavigation, useRoute } from '@react-navigation/native'
import * as Icon from "react-native-feather";
import { themeColors } from '../theme';
import DishRow from '../components/dishRow';
import CartIcon from '../components/cartIcon';
import { useDispatch } from 'react-redux';
import { setEstablishment } from '../slices/establishmentSlice';
import { urlFor } from '../services/sanity/sanity';

export default function Establishment() {
  const { params } = useRoute();
  const navigation = useNavigation();
  let item = params;
  const dispatch = useDispatch();


//console.log('Restaurant: ', item)

  useEffect(() => {
    if(item && item._id){
      dispatch(setEstablishment({...item}))
    }
  },[])

  return (
    <View>
      <CartIcon />
      <StatusBar style="light" />
      <ScrollView>
        <View className="relative">
          <Image className="w-full h-72" source={{uri: urlFor(item.image).url()}} />
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="absolute top-14 left-8 bg-gray-50 p-3 rounded-full shadow"
          >
            <Icon.ArrowLeft strokeWidth={3} stroke={themeColors.bgColor(1)} />
          </TouchableOpacity>
        </View>
        <View
          className="bg-white -mt-12 pt-6 "
          style={{
            borderTopLeftRadius: 40,
            borderTopRightRadius: 40,
          }}
        >
          <View className="px-5">
            <Text className="text-3xl font-bold">
              {item.name}
            </Text>
            <View className="flex-row space-x-2 my-1">
              <View className="flex-row items-center space-x-1">
                <Image source={require('../assets/images/fullStar.png')} className="h-4 w-4" />
                <Text className="text-green-700">
                  {item.avaliacao}
                </Text>
                <Text className="text-gray-700">
                  ({item.avaliacoes} Vendas) .
                  <Text className="font-semibold text-xs">
                    {item?.tipo?.name}
                  </Text>
                </Text>
              </View>

              <View className="flex-row items-center space-x-1">
                <Icon.MapPin color="gray" width="15" height="15" />
                <Text className="text-gray-700 text-xs">Sagres. {item.endereco}</Text>
              </View>
            </View>
            <Text className="text-gray-500 mt-2">
              {item.description}
            </Text>
          </View>
        </View>
        <View className="pb-36 bg-white">
          <Text className="px-4 py-4 text-2xl font-bold">
            Menu
          </Text>

          {/* Sabores */}
          {
            item.produtos.map((produto, index) => <DishRow item={{ ...produto }} key={index} />)
          }
        </View>
      </ScrollView>
    </View>
  )
}