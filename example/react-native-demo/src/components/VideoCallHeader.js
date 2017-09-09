import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';
import Avatar from './Avatar'

const VideoCallHeader = (props) => {
    let { camera, time } = props.detail
    return (
        <Container>
            <ContainerAvatar>
                <Avatar />
            </ContainerAvatar>
            <ContainerInfo>
                <Info>
                    <TextInfo regular color="rgb(19,181,172)" size={24}>
                        Dr. Nirada
                </TextInfo>
                    <ToggleCamera {...camera} />
                </Info>
                <Info>
                    <TextInfo regular color='rgb(208,2,27)' size={16} decoration='underline'>
                        End the call
                    </TextInfo>
                    {   
                        time != 0 ?
                        <TextInfo light color="rgb(155,155,155)" size={15} lineHeight={25}>
                            { 'Time: ' + calculateTime(time) }
                        </TextInfo> : null
                    }
                </Info>
            </ContainerInfo>
        </Container>
    )
};

export default VideoCallHeader;

const calculateTime = (time)=> {
    let minute = 0
    let second = 0
    if(time < 60){
        second = time
    }else{
        do{
            time -= 60
            minute += 1
            second = time
        }while(time > 60)
    }
    if(minute.toString().length == 1)
        minute = '0'+minute
    if(second.toString().length == 1)
        second = '0'+second
    
    let newTime = minute+':'+second
    return newTime;
}

const ToggleCamera = (props) => {
    let { showSelfView, toggleSelfCamera } = props
    return (
        <TouchableOpacity style={{ flexDirection: 'row' }} onPress={ ()=> toggleSelfCamera() }>
            <TextInfo light color={ showSelfView ? "rgb(80,227,194)" : "rgb(155,155,155)" } size={12} lineHeight={38}>
                Camera
        </TextInfo>
            <ButtonToggleCamera enable={showSelfView}>
                <TextInfo light color="white" size={12}>
                    { showSelfView ? `On` : `Off` }
                </TextInfo>
            </ButtonToggleCamera>
        </TouchableOpacity>
    )
};

const Container = styled.View`
    position: absolute;
    left: 0; 
    right: 0; 
    top: 20; 
    flex-direction: row;
`;
const ContainerAvatar = styled.View`
    margin-left: 20; 
    justify-content: center
`;
const ContainerInfo = styled.View`
    flex: 1; 
    margin-left: 20; 
    margin-right: 20;
    background-color: transparent;
`;
const Info = styled.View`
    flex: 1; 
    flex-direction: row; 
    justify-content: space-between
`;

const TextInfo = styled.Text`
    ${props => props.regular && `
        font-family: "Prompt-Regular";
    `}
    ${props => props.light && `
        font-family: "Prompt-Light";
    `}
    color: ${props => props.color || 'black'};
    font-size: ${props => props.size || 12};
    line-height: ${props => props.lineHeight || 0};
    text-decoration-line: ${props => props.decoration || 'none'}
`;

const ButtonToggleCamera = styled.View`
    background-color: ${props => props.enable ? 'rgb(80,227,194)' : 'rgb(155,155,155)' }; 
    width: 30; 
    height: 30;
    margin-left: 5;
    border-radius: 15;
    justify-content: center;
    align-items: center
`;