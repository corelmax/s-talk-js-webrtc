import React from 'react'
import { TouchableOpacity, View } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const CommunicationButton = (props) => (
    <TouchableOpacity
        onPress={ typeof props.onPress === 'function' ? () => props.onPress() :  ()=>{} }
        style={{
            width: 70,
            height: 70,
            borderRadius: 35,
            marginHorizontal: 10,
            backgroundColor: 'rgba(0,0,0,.36)',
            justifyContent: 'center',
            alignItems: 'center',
        }}>
        <View
            style={{
                width: 50,
                height: 50,
                borderRadius: 25,
                backgroundColor: 'rgba(255, 255, 255, 0.5)',
                justifyContent: 'center',
                alignItems: 'center',
            }}>
            <Icon
                name={props.icon || 'block'}
                size={props.size || 25}
                color={props.textColor || 'rgba(0,0,0,.36)'}
            />
        </View>
    </TouchableOpacity>
);

export default CommunicationButton;