//@ts-check

import React, { Component } from 'react';
import { RTCView } from 'react-native-webrtc';
import CommunicationButton from '../components/CommunicationButton';
import styled from 'styled-components/native';
import {
    Text,
    View,
} from 'react-native';
import Communication from '../hoc/Communication'
import VideoCallHeader from '../components/VideoCallHeader'
var Spinner = require('react-native-spinkit');

const VideoCall = (props) => {
    let { communication } = props
    let { goBack } = props.navigate
    let roomName = props.navigate.state.params.roomName;
    //console.log(props);
    return (
        <Container>
            <View style={{ flex: 1 }}>
                <ContainerRemote>
                    {
                        (!!communication.state.remote) ?
                            <RemoteView streamURL={communication.state.remote} /> : null
                    }
                </ContainerRemote>
                {
                    !communication.state.remote || (communication.state.remote && communication.state.showSelfView) ?
                        <SelfView streamURL={communication.state.selfViewSrc} connect={communication.state.remote ? true : false} />
                        : null
                }
                <ContainerButton>
                    <CommunicationButton icon='camera-party-mode' onPress={() => communication.switchVideoType()} />
                    <CommunicationButton icon='close' onPress={() => goBack()} />
                    <CommunicationButton icon={communication.state.mute ? 'microphone-off' : 'microphone'} onPress={() => communication.toggleLoudspeaker()} />
                </ContainerButton>
                <VideoCallHeader detail={{
                    camera: {
                        showSelfView: communication.state.showSelfView,
                        toggleSelfCamera: communication.toggleSelfCamera
                    },
                    time: communication.state.time
                }} />
            </View>
            <Loading roomName = {roomName} loading={!communication.state.ready ? true : false} />
        </Container>
    )
}

export default Communication(VideoCall);

const Loading = (props) => (
    props.loading ?
        <ContainerLoading>
            <Text style={{ color: 'white', fontSize: 18 }}>
                {/* Wait for Initializing... */}
                Connecting to room {props.roomName}...
            </Text>
            <Spinner
                style={{ marginTop: 10 }}
                isVisible={props.loading}
                size={100}
                type='ChasingDots'
                color='white' />
        </ContainerLoading>
        :
        null
);

const Container = styled.View`
    flex: 1;
    background-color: #F5FCFF;
    justify-content: center;
`;

const ContainerRemote = styled.View`
    background-color: black; 
    flex: 1;
`;

const RemoteView = styled(RTCView) `
    flex: 1
`;

const SelfView = styled(RTCView) `
    position: absolute;
    ${props => !props.connect && `
        top: 0; 
        left: 0; 
        right: 0; 
        bottom: 0; 
    `}
    ${props => props.connect && `
        bottom: 20; 
        right: 0; 
        width: 100; 
        height: 150;
    `}
`;

const ContainerButton = styled.View`
    position: absolute; 
    bottom: 30;
    left: 0;
    right: 0; 
    height: 65;
    flex-direction: row; 
    justify-content: center;
    align-items: center
`

const ContainerLoading = styled.View`
    position: absolute; 
    top: 0; 
    left: 0; 
    bottom: 0; 
    right: 0; 
    background-color: black; 
    justify-content: center; 
    align-items: center;
`


