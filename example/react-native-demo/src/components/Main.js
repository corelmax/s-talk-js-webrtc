import * as React from 'react';
import { View, Text, ScrollView, TextInput, Button } from 'react-native';
import { 
        StalkWebRtcFactory, AbstractWEBRTC, AbstractPeerConnection 
} from "stalk-js-webrtc/react-native";
import styled from 'styled-components/native';

class Main extends React.Component{
        static navigationOptions = {
                header: null,
        }
        spaceSize = 8;
        roomName = "test";
        
        onEnterRoomPress(){
                this.refs['inputField'].blur();
                this.props.navigation.navigate("VideoCall", {roomName : this.roomName});
        }
        render(){
                const v_space = {marginBottom:this.spaceSize};
                return (
                        <DivCenter>
                                <Content>
                                        <FontText style={v_space}>S-Talk Videocall experiment.</FontText>
                                        <TextInput style={v_space} ref="inputField" 
                                                placeholder="Enter videocall room name" 
                                                onChangeText={text=>{this.roomName= text || 'test'}}
                                        />
                                        <Button title="Create or enter room" onPress={this.onEnterRoomPress.bind(this)}></Button>
                                </Content>
                        </DivCenter>
                );
        }
}

const DivCenter = styled.View`
        width: 100%;
        height: 100%;
        justify-content: center;
        align-items: center;
`;
const Content = styled.View`
        width: 70%;
`;
const FontText = styled.Text`
        font-family: sans-serif;
        font-size: 18px;
        text-align: center;
`;

export default Main;
