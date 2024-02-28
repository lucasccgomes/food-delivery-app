// NÃO ESTA SENDO UTILIZADO POIS HOME AGORA É ESTABLISHMENT





import { View, Text, SafeAreaView, TextInput, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react'
import { StatusBar } from 'expo-status-bar'
import * as Icon from "react-native-feather";
import { themeColors } from '../theme';
import Categories from '../components/categories';
import FeaturedRow from '../components/featuredRow';
import { getFeaturedEstablishment } from '../services/sanity/api';
import Establishment from './Establishment';

export default function Home() {

  const [featuredEstablishment, setFeaturedEstablishment] = useState([])

  useEffect(() => {
    getFeaturedEstablishment().then(data => {
      setFeaturedEstablishment(data)
    })
  }, [])

  return (
    <SafeAreaView className="bg-white pt-12 ">
      <StatusBar barStyle="dark-content" />
     <Establishment/>
    </SafeAreaView>
  )
}