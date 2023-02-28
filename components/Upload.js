import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native-ui-lib';
import { Image, StyleSheet, SafeAreaView, FlatList, Button, TextInput } from 'react-native';

import * as FS from "expo-file-system";
import * as ImagePicker from 'expo-image-picker';

function ImagePickerComponent({ image, setImage }) {
    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
            base64: true,
        });

        if (!result.canceled) {
            setImage(result.assets[0]);
        }

    };

    return (
        <View>
            <Button title="Выбрать изображение из галереи" onPress={pickImage} />
            {image && <Image source={{ uri: image }} style={{ width: 280, height: 280 }} />}
        </View>
    );
}

function uploadToLibrary(desc, author, image, library, setLibrary, setNeedUpdate) {
    url = base_api_url + '/upload'
    image_name = ''
    FS.uploadAsync(url, image.uri, {
        headers: {
            "content-type": "image/jpeg",
        },
        httpMethod: "POST",
        parameters: { desc, author },
        uploadType: FS.FileSystemUploadType.BINARY_CONTENT,
    }).then(response => {
        image_name = response.body
        axios.post(base_api_url + '/add', {
            desc, author, image_name
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(response => {
            //library.push({desc, author, image_name})
            //setLibrary(library)
            setNeedUpdate(true)
            setNeedUpdate(false)
        })
    })
}

export default function AddPetScreen({ library, setLibrary, setNeedUpdate}) {
    const [desc, onChangeDesc] = React.useState('');
    const [author, onChangeAuthor] = React.useState('');
    const [image, setImage] = useState({ uri: null });

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <TextInput
                style={upload_styles.input}
                onChangeText={onChangeDesc}
                value={desc}
                placeholder="Введите описание"
            />
            <TextInput
                style={upload_styles.input}
                onChangeText={onChangeAuthor}
                value={author}
                placeholder="Введите имя автора"
            />
            <ImagePickerComponent image={image.uri} setImage={setImage}></ImagePickerComponent>
            <Button title='Добавить фото' onPress={() => uploadToLibrary(desc, author, image, library, setLibrary, setNeedUpdate)}></Button>
        </View>
    );
}


const upload_styles = StyleSheet.create({
    input: {
        height: 40,
        margin: 12,
        borderWidth: 1,
        padding: 10,
        width: 220
    }
});