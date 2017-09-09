import React from 'react';
import { View, Image } from 'react-native';

const Avatar = () => (
    <View style={{
        width: 60, 
        height: 60, 
        borderRadius: 30,
        backgroundColor: 'white',
        shadowColor: '#000000',
        shadowOffset: {
          width: 0,
          height: 1
        },
        shadowRadius: 3,
        shadowOpacity: 1.0
        }}>
        <Image
            style={{width: 60, height: 60, borderRadius: 30}}
            source={{uri: 'https://facebook.github.io/react/img/logo_og.png'}}
        />
    </View>
);

export default Avatar;