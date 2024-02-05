import { View, Text, SafeAreaView, TextInput, ScrollView } from 'react-native'
import React from 'react'
import { StatusBar } from 'expo-status-bar'
import * as Icon from "react-native-feather";
import { themeColors } from '../theme';
import Categories from '../components/categories';
import { featured } from '../constants';
import FeaturedRow from '../components/featuredRow';

export default function Home() {
  return (
    <SafeAreaView className="bg-white pt-12 ">
      <StatusBar barStyle="dark-content" />


      {/*Barra de Busca*/}
      <View className="flex-row items-center space-x-2 px-4 pb-2">
        <View className="flex-row flex-1 items-center p-3 rounded-full border border-gray-300">
          <Icon.Search height="25" width="25" stroke="gray" />
          <TextInput placeholder='Faça sua busca' className="ml-2 flex-1" />
          <View className="flex-row items-center space-x-1 border-0 border-l-2 pl-2 border-l-gray-300">
            <Icon.MapPin height="20" width="20" stroke="gray" />
            <Text className="text-gray-600" >Sagres, SP</Text>
          </View>
        </View>
        <View style={{ backgroundColor: themeColors.bgColor(1) }} className="p-3 rounded-full">
          <Icon.Sliders height="20" width="20" strokeWidth={2.5} stroke="white" />
        </View>
      </View>


      {/*Main*/}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 20
        }}
      >


        {/*Area de Categorias */}
        <Categories />


        {/*Recursos*/}
        <View className="mt-5">
          {
            [featured, featured, featured].map((item, index) => {
              return (
                <FeaturedRow
                  key={index}
                  title={item.title}
                  restaurants={item.restaurants}
                  description={item.description}
                />
              )
            })
          }
        </View>

      </ScrollView>
    </SafeAreaView>
  )
}