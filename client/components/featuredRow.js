// ESTE COMPONENTE É UTILIZADO APENAS SE A HOME FOR PARA VARIOS ESTABELECIMENTO








import { View, Text, TouchableOpacity, ScrollView } from 'react-native'
import React from 'react'
import { themeColors } from '../theme'
import RestaurantCard from './restaurantCard'

export default function FeaturedRow({ title, description, restaurants }) {
  return (
    <View>
      <View className="flex-row justify-between items-center px-4">

        <View className=" ">
          <Text className="font-bold text-lg">
            {title}
          </Text>
          <Text className="text-gray-500 text-xs">
            {description}
          </Text>
        </View>

        <TouchableOpacity>
          <Text style={{ color: themeColors.text }} className="font-semibold">
            Ver Tudo
          </Text>
        </TouchableOpacity>

      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 15,
        }}
        className="overflow-visible py-5"
        >
          {
            restaurants.map((restaurant, index) =>{
              return (
                <RestaurantCard
                item={restaurant}
                key={index}
                />
              )
            })
          }
        </ScrollView>
    </View>
  )
}