/*
This is a Tutorial App with a simpleWebRTC React component.
Compatible with Chrome and Firefox.

1. To join a room uncomment the line 76 in readyToCall(){...} and provide a room name in joinRoom('change-this-roomname').
2. The app by default uses the signal server from simplewebrtc.com. To use a custom Signal server such as the one in  https://github.com/andyet/signalmaster, provide your url link in the code (line 38) as shown in the example at https://simplewebrtc.com/notsosimple.html. 
*/

import * as React from "react";
import * as ReactDOM from 'react-dom';
import { connect } from "react-redux";
import { shallowEqual, compose } from "recompose";
import { withRouter } from "react-router-dom";
import Flexbox from "flexbox-react";
import { MuiThemeProvider, getMuiTheme } from "material-ui/styles";
import { RaisedButton, FontIcon, Slider, Paper, Subheader, FlatButton } from "material-ui";
import Avatar from 'material-ui/Avatar';

import { PeerStatus } from "./WithPeerStatus";
import { signalingServer } from "../../Chitchat";
import * as utils from "../../utils/";
import * as chatroom from "../../chitchat/chats/redux/chatroom/";
import * as calling from "../../chitchat/calling/";
import { AbstractPeerConnection, AbstractWEBRTC, AbstractMediaStream, WebRtcFactory } from '../../chitchat/stalk-js-webrtc/index';

interface MyCompProps extends utils.IComponentProps {
    remoteUser;
    user;
    getWebRtc;
    onJoinedRoom: (roomname: string) => void;
}
interface IComponentNameState {
    remoteSrc;
    selfViewSrc;
    isMuteVoice;
    remoteVolume;
    micVol;
    peer;
    isHoverPeer;
    localStreamStatus: string;
}

function getEl(idOrEl) {
    if (typeof idOrEl === 'string') {
        return document.getElementById(idOrEl);
    } else {
        return idOrEl;
    }
};
class WebRtcAudioComponent extends React.Component<MyCompProps, IComponentNameState> {
    webrtc: AbstractWEBRTC.IWebRTC;
    remotesView;
    selfView;
    selfAudioName: string;

    sendMessage(message) {
        this.webrtc.peerManager.sendDirectlyToAll("message", message, {
            _id: this.webrtc.signalingSocket.id,
            stream_id: this.state.selfViewSrc._id,
        });
    }

    constructor(props) {
        super(props);

        this.state = {
            isMuteVoice: false,
            micVol: 100,
            selfViewSrc: null,
            remoteSrc: null,
            peer: null,
            remoteVolume: 100,
            isHoverPeer: false,
            localStreamStatus: ""
        };

        this.sendMessage = this.sendMessage.bind(this);
        this.startWebRtc();
    }

    async startWebRtc() {
        let rtcConfig = {
            signalingUrl: signalingServer,
            socketOptions: { 'force new connection': true },
            debug: false,
        } as AbstractWEBRTC.WebRtcConfig;
        this.webrtc = await WebRtcFactory.getObject(rtcConfig) as AbstractWEBRTC.IWebRTC;

        this.peerAdded = this.peerAdded.bind(this);
        this.removeAudio = this.removeAudio.bind(this);
        this.onStreamReady = this.onStreamReady.bind(this);
        this.connectionReady = this.connectionReady.bind(this);

        this.webrtc.webrtcEvents.on(AbstractWEBRTC.ON_CONNECTION_READY, this.connectionReady);
        this.webrtc.webrtcEvents.on(AbstractWEBRTC.ON_CONNECTION_CLOSE, (data) => { console.log("signalling close", data) });
        this.webrtc.webrtcEvents.on(AbstractWEBRTC.CREATED_PEER, (peer) => console.log("createdPeer", peer.id));
        this.webrtc.webrtcEvents.on(AbstractWEBRTC.JOINED_ROOM, (roomname: string) =>
            (this.props.onJoinedRoom) ? this.props.onJoinedRoom(roomname) : console.log("joined", roomname));
        this.webrtc.webrtcEvents.on(AbstractWEBRTC.JOIN_ROOM_ERROR, (err) => console.log("joinRoom fail", err));
        this.webrtc.webrtcEvents.on(AbstractPeerConnection.PEER_STREAM_ADDED, this.peerAdded);
        this.webrtc.webrtcEvents.on(AbstractPeerConnection.PEER_STREAM_REMOVED, this.removeAudio);
        this.webrtc.webrtcEvents.on(AbstractPeerConnection.CONNECTIVITY_ERROR, (peer) => {
            console.log(AbstractPeerConnection.CONNECTIVITY_ERROR, peer);
        });
    }

    connectionReady(socker_id) {
        let self = this;

        let requestMedia = {
            audio: true
        } as MediaStreamConstraints;

        this.webrtc.userMedia.startLocalStream(requestMedia).then(function (stream) {
            self.onStreamReady(stream);

            let { match } = self.props;
            self.webrtc.join(match.params.id);
        }).catch(err => {
            console.error("LocalStream Fail", err);

            self.setState(prev => ({ ...prev, localStreamStatus: err }));
            self.props.onError("LocalStream Fail: " + err);
        });
    }

    onStreamReady(stream: MediaStream) {
        if (!stream) return;

        this.selfAudioName = this.webrtc.userMedia.getAudioTrack().label;
        this.setState({ selfViewSrc: stream, localStreamStatus: "ready" });
    }

    peerAdded(peer) {
        let remoteAudio = getEl("remoteAudio");
        if (!!remoteAudio && peer.stream.getAudioTracks().length > 0) {
            remoteAudio.srcObject = peer.stream;
        }
        else {
            console.error("peer doesn't have audio")
        }

        this.setState({ remoteSrc: peer.stream, remoteVolume: 100, peer: peer });
    }

    removeAudio() {
        let remoteAudio = getEl("remoteAudio");
        if (!remoteAudio) return;
        // remoteAudio.src = "";
        delete remoteAudio.srcObject;

        this.setState({ remoteSrc: null });
    }

    componentWillUnmount() {
        if (!!this.webrtc) {
            this.webrtc.leaveRoom();
            this.webrtc.disconnect();
        }
    }

    render(): JSX.Element {
        let disabledAudioOption = true;
        if (!!this.state.selfViewSrc) {
            if (this.state.selfViewSrc.getAudioTracks().length > 0 &&
                !!this.webrtc.userMedia.audioController &&
                this.webrtc.userMedia.audioController.support) {
                disabledAudioOption = false;
            }
        }

        return (
            <Flexbox flexDirection="row" height="100%" justifyContent={"flex-start"}>
                <div ref="localContainer" style={{ position: 'relative', width: '200px', height: '100%' }}>
                    {
                        this.props.user ?
                            <Paper circle
                                style={{
                                    width: "125px",
                                    height: "125px",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center"
                                }}>
                                {

                                    this.props.user.avatar ?
                                        <Avatar src={this.props.user.avatar} size={120} />
                                        :
                                        <Avatar size={120}>{this.props.user.username[0]}</Avatar>
                                }
                            </Paper>
                            :
                            <div>User Avatar</div>
                    }
                    <Slider min={0} max={100} step={1}
                        disabled={disabledAudioOption}
                        defaultValue={100}
                        sliderStyle={{
                            margin: 0,
                        }}
                        onChange={(e, newValue) => {
                            this.setState({ micVol: newValue, isMuteVoice: newValue == 0 });
                            this.webrtc.userMedia.audioController.setVolume(newValue / 100);
                        }} />
                    <div>{`Mic volume (${this.state.micVol}%)`}</div>
                    {
                        this.state.isMuteVoice ?
                            <RaisedButton secondary
                                disabled={disabledAudioOption}
                                icon={<FontIcon className="material-icons">mic_off</FontIcon>}
                                onClick={() => {
                                    this.webrtc.userMedia.audioController.setVolume(this.state.micVol / 100);
                                    this.setState({ isMuteVoice: false });
                                }} />
                            :
                            <RaisedButton
                                disabled={disabledAudioOption}
                                icon={<FontIcon className="material-icons">mic</FontIcon>}
                                onClick={() => {
                                    this.webrtc.userMedia.audioController.setVolume(0);
                                    this.setState({ isMuteVoice: true });
                                }} />
                    }

                    <p style={{ fontSize: 12 }}>UserMedia: {this.state.localStreamStatus}</p>
                    <p style={{ fontSize: 12 }}>AudioTrack: {this.selfAudioName}</p>
                </div>
                <div style={{ width: "100%", height: "300px", textAlign: "center" }}>
                    <div
                        onMouseOver={() => { this.setState({ isHoverPeer: true }) }}
                        onMouseLeave={() => { this.setState({ isHoverPeer: false }) }}
                        style={{ display: "inline-block", height: "300px", position: "relative" }}>
                        {
                            this.props.remoteUser ?
                                <Paper
                                    style={{
                                        width: "300px",
                                        height: "300px",
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center"
                                    }}>
                                    {

                                        this.props.remoteUser.avatar ?
                                            <Avatar src={this.props.remoteUser.avatar} size={300} style={{ borderRadius: 0 }} />
                                            :
                                            <Avatar size={300} style={{ borderRadius: 0 }}>{this.props.remoteUser.username[0]}</Avatar>
                                    }
                                </Paper>
                                :
                                <div>User Avatar</div>
                        }
                        <audio id="remoteAudio" style={{ display: "none" }} autoPlay={true} />
                        {
                            this.state.isHoverPeer ?
                                [
                                    <div key="0"
                                        style={{
                                            position: "absolute",
                                            bottom: 0,
                                            width: "100%",
                                            height: "30%",
                                            backgroundPosition: "bottom",
                                            backgroundImage: "url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAADGCAYAAAAT+OqFAAAAdklEQVQoz42QQQ7AIAgEF/T/D+kbq/RWAlnQyyazA4aoAB4FsBSA/bFjuF1EOL7VbrIrBuusmrt4ZZORfb6ehbWdnRHEIiITaEUKa5EJqUakRSaEYBJSCY2dEstQY7AuxahwXFrvZmWl2rh4JZ07z9dLtesfNj5q0FU3A5ObbwAAAABJRU5ErkJggg==)",
                                            "filter": "progid:DXImageTransform.Microsoft.gradient( startColorstr='#000000', endColorstr='#3d3d3d', GradientType=0 )"
                                        }}>
                                    </div>,
                                    <div id="remoteController" key="1"
                                        style={{
                                            position: "absolute",
                                            width: "100%",
                                            height: "15%",
                                            bottom: 0,
                                            display: this.state.remoteSrc ? "flex" : "none",
                                            alignItems: "center",
                                            padding: "0 5px",
                                        }}>
                                        <div style={{ color: "#fff", width: "41px" }}>
                                            {`${this.state.remoteVolume}%`}
                                        </div>
                                        <MuiThemeProvider muiTheme={getMuiTheme({
                                            slider: {
                                                trackColor: 'rgba(255,255,255,0.5)',
                                                selectionColor: '#fff',
                                                rippleColor: 'rgba(255,255,255,0.5)'
                                            }
                                        })}>
                                            <Slider min={0} max={100} step={1}
                                                value={this.state.remoteVolume}
                                                onChange={(e, newValue) => {
                                                    this.setState({ remoteVolume: newValue });
                                                    getEl('remoteAudio').volume = newValue / 100;
                                                }}
                                                sliderStyle={{
                                                    margin: 0,
                                                }}
                                                style={{
                                                    width: "30%",
                                                    margin: "0 5px",
                                                }} />
                                        </MuiThemeProvider>
                                    </div>
                                ]
                                :
                                null
                        }
                    </div>
                    <PeerStatus peer={this.state.peer} />
                </div>
            </Flexbox>
        );
    }
}

const enhance = compose(withRouter, connect());
export const WebRtcAudio = enhance(WebRtcAudioComponent) as React.ComponentClass<{ remoteUser, user, onJoinedRoom, onError }>;