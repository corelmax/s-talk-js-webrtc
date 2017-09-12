import React, { Component } from 'react';
import { View, WebView } from 'react-native';


const WebViewComponent = (props) => {
    const { navigate } = props;
    return (
        <WebView
            source={{ uri: 'https://ooca-webrtc.firebaseapp.com' }} //http://localhost:8080 'https://ooca-webrtc.firebaseapp.com'
            javaScriptEnabled={true}
            startInLoadingState={true}
            onMessage={(event) => {
                console.log("OnMessage", event);
                // navigate('VideoCall', { roomName: event.nativeEvent.data })
                navigate('VideoCall', { roomName: 'mzget' })
            }}
        />
    )
};

export default WebViewComponent;