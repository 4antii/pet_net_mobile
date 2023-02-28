import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { Logs } from 'expo'
import Ionicons from '@expo/vector-icons/Ionicons';

import LibraryScreen from './components/Library'
import AddPetScreen from './components/Upload'

Logs.enableExpoCliLogging()
base_api_url = 'http://192.168.31.246:5000'

const Tab = createBottomTabNavigator();

function MainScreenComponent() {
  let [library, setLibrary] = useState([])
  let [needUpdate, setNeedUpdate] = useState(false)
  base_img_uri = base_api_url + "/images"
  useEffect(() => {
    axios.get(base_img_uri).then(response => {
      setLibrary(response.data.lib.reverse())
    }).catch(response => {
      console.log(response);
    })
  },[needUpdate])
  return (
    <NavigationContainer>
      <Tab.Navigator screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Библиотека') {
            iconName = focused
              ? 'ios-albums'
              : 'ios-albums-outline';
          } else if (route.name === 'Добавить фото') {
            iconName = focused ? 'ios-camera' : 'ios-camera-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: 'dodgerblue',
        tabBarInactiveTintColor: 'gray',
      })}>
        <Tab.Screen name="Библиотека" children={() => <LibraryScreen library={library} />} />
        <Tab.Screen name="Добавить фото" children={() => <AddPetScreen setLibrary={setLibrary} setNeedUpdate={setNeedUpdate} library={library} />} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <MainScreenComponent></MainScreenComponent>
  );
}