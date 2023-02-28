
import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native-ui-lib';
import { Image, StyleSheet, SafeAreaView, FlatList, Button, TextInput } from 'react-native';

import { StatusBar } from 'expo-status-bar';

base_api_url = 'http://192.168.31.246:5000'
base_image_uri = base_api_url + "/image/"

export default function LibraryScreen(props) {
    return (
        <View style={library_styles.container}>
            <SafeAreaView style={library_styles.container}>
                <FlatList
                    data={props.library}
                    renderItem={({ item }) => <View>
                        <View style={library_styles.shadow}>
                            <Image resizeMode={'cover'} style={library_styles.pet_image} source={{ uri: base_image_uri + item.img_name }}></Image>
                        </View>
                        <Text style={library_styles.author}>Автор: {item.author}</Text>
                        <Text style={library_styles.breed}>{item.breed}</Text>
                        <Text style={library_styles.prob}>Уверенность:{Math.round((item.prob + Number.EPSILON)*100)/100}%</Text>
                        <Text style={library_styles.desc_text}>{item.desc}</Text>
                    </View>}
                    keyExtractor={item => item.img_name}
                />
                <StatusBar style="auto" />
            </SafeAreaView>
        </View>
    );
}

const library_styles = StyleSheet.create({
    author: {
      fontSize: 16,
      marginRight: 20,
      marginLeft: 20,
      marginTop: 10,
    },
    breed:{
      fontSize: 16,
      marginRight: 20,
      marginLeft: 20,
      marginTop: 3,
    },
    prob:{
      fontSize: 16,
      marginRight: 20,
      marginLeft: 20,
      marginTop: 3,
    },
    desc_text: {
      fontSize: 20,
      marginRight: 20,
      marginLeft: 20,
      marginBottom: 10
    },
    shadow: {
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.23,
      shadowRadius: 2.62,
  
      elevation: 4,
    },
    pet_image: {
      borderRadius: 10,
      width: 340,
      height: 250,
      marginRight: 20,
      marginLeft: 20,
      marginTop: 20,
    },
    container: {
      flex: 1,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
    },
  });

