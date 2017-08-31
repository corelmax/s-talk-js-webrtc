import * as React from "react";
import * as ReactDOM from 'react-dom';
import { connect } from "react-redux";
import { shallowEqual, compose } from "recompose";
import { withRouter } from "react-router-dom";
import Flexbox from "flexbox-react";
import { MuiThemeProvider, getMuiTheme } from "material-ui/styles";
import { RaisedButton, FontIcon, Slider, Paper, Subheader, FlatButton } from "material-ui";

import { PeerStatus } from "./WithPeerStatus";
import { signalingServer } from "../../Chitchat";
import * as utils from "../../utils/";
import * as chatroom from "../../chitchat/chats/redux/chatroom/";
import * as calling from "../../chitchat/calling/";
import { AbstractPeerConnection, AbstractWEBRTC, AbstractMediaStream, WebRtcFactory } from '../../chitchat/stalk-js-webrtc/index';

interface MyCompProps extends utils.IComponentProps {
    getWebRtc;
    onJoinedRoom: (roomname: string) => void;
}
interface IComponentNameState {
    remoteSrc;
    selfViewSrc;
    isMuteVoice;
    isPauseVideo;
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
class WebRtcComponent extends React.Component<MyCompProps, IComponentNameState> {
    webrtc: AbstractWEBRTC.IWebRTC;
    remotesView;
    selfView;
    selfAudioName: string;
    selfVideoName: string;

    sendMessage(message) {
        this.webrtc.peerManager.sendDirectlyToAll("message", message, {
            _id: this.webrtc.signalingSocket.id,
            stream_id: this.state.selfViewSrc._id,
        });
    }
    changeMediaContraint(media: MediaStreamConstraints) {
        let self = this;

        let peers = this.webrtc.peerManager.getPeers() as Map<string, AbstractPeerConnection.IPC_Handler>;
        self.webrtc.userMedia.stopLocalStream();
        peers.forEach(peer => {
            peer.offer = true;
            peer.removeStream(self.webrtc.userMedia.getLocalStream())
        });

        process.nextTick(() => {
            let requestMedia = {
                video: media.video,
                audio: true
            } as MediaStreamConstraints;
            self.webrtc.userMedia.startLocalStream(requestMedia).then(function (stream) {
                self.onStreamReady(stream);
                peers.forEach(peer => {
                    peer.offer = true;
                    peer.addStream(stream);
                });
            }).catch(err => {
                console.error("LocalStream Fail", err);

                self.setState(prev => ({ ...prev, localStreamStatus: err }));
                self.props.onError("LocalStream Fail: " + err);
            });
        });
    }

    constructor(props) {
        super(props);

        this.state = {
            isMuteVoice: false,
            isPauseVideo: false,
            micVol: 100,
            selfViewSrc: null,
            remoteSrc: null,
            peer: null,
            remoteVolume: 100,
            isHoverPeer: false,
            localStreamStatus: ""
        };

        this.changeMediaContraint = this.changeMediaContraint.bind(this);
        this.sendMessage = this.sendMessage.bind(this);
        this.startWebRtc();
    }

    async startWebRtc() {
        let rtcConfig = {
            signalingUrl: signalingServer,
            socketOptions: { 'force new connection': true },
            debug: true,
        } as AbstractWEBRTC.WebRtcConfig;
        this.webrtc = await WebRtcFactory.getObject(rtcConfig) as AbstractWEBRTC.IWebRTC;

        this.peerAdded = this.peerAdded.bind(this);
        this.removeVideo = this.removeVideo.bind(this);
        this.onStreamReady = this.onStreamReady.bind(this);
        this.connectionReady = this.connectionReady.bind(this);
        this.onPeerCreated = this.onPeerCreated.bind(this);

        this.webrtc.webrtcEvents.on(AbstractWEBRTC.ON_CONNECTION_READY, this.connectionReady);
        this.webrtc.webrtcEvents.on(AbstractWEBRTC.ON_CONNECTION_CLOSE, (data) => { console.log("signalling close", data) });
        this.webrtc.webrtcEvents.on(AbstractWEBRTC.JOINED_ROOM, (roomname: string) =>
            (this.props.onJoinedRoom) ? this.props.onJoinedRoom(roomname) : console.log("joined", roomname));
        this.webrtc.webrtcEvents.on(AbstractWEBRTC.JOIN_ROOM_ERROR, (err) => console.log("joinRoom fail", err));
        this.webrtc.webrtcEvents.on(AbstractPeerConnection.PEER_STREAM_ADDED, this.peerAdded);
        this.webrtc.webrtcEvents.on(AbstractPeerConnection.PEER_STREAM_REMOVED, this.removeVideo);
        this.webrtc.webrtcEvents.on(AbstractPeerConnection.CONNECTIVITY_ERROR, (peer) => {
            console.log(AbstractPeerConnection.CONNECTIVITY_ERROR, peer);
        });
        this.webrtc.webrtcEvents.on(AbstractPeerConnection.CREATED_PEER, this.onPeerCreated);
    }

    connectionReady(socker_id) {
        let self = this;

        let requestMedia = {
            video: AbstractMediaStream.hdConstraints.video,
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
        let selfView = getEl(ReactDOM.findDOMNode(this.refs.localVideo));

        if (!selfView) return;
        selfView.srcObject = stream;

        let video = this.webrtc.userMedia.getVideoTrack() as MediaStreamTrack;
        let audio = this.webrtc.userMedia.getAudioTrack() as MediaStreamTrack;
        this.selfAudioName = audio.label;
        this.selfVideoName = video.label;
        this.setState({ selfViewSrc: stream, localStreamStatus: "ready" });
    }

    peerAdded(peer: MediaStreamEvent) {
        let self = this;
        let remotesView = getEl(ReactDOM.findDOMNode(this.refs.remotes));
        if (!!remotesView) {
            remotesView.srcObject = peer.stream;
            remotesView.volume = 1;
        }

        this.setState({ remoteSrc: peer.stream, remoteVolume: 100 });
    }

    removeVideo() {
        let remotesView = getEl(ReactDOM.findDOMNode(this.refs.remotes));
        remotesView.disable = true;

        this.setState({ remoteSrc: null });
    }

    onPeerCreated(peer: AbstractPeerConnection.IPC_Handler) {
        console.log("onPeerCreated", peer);
        this.setState(prev => ({ ...prev, peer: peer }));
    }

    showVolume(el, volume) {
        if (!el) return;
        if (volume < -45) volume = -45; // -45 to -20 is
        if (volume > -20) volume = -20; // a good range
        el.value = volume;
    }

    componentWillUnmount() {
        if (!!this.webrtc) {
            this.webrtc.leaveRoom();
            this.webrtc.disconnect();
        }
    }

    render(): JSX.Element {
        let disabledAudioOption = true;
        let disabledVideoOption = true;
        if (!!this.state.selfViewSrc) {
            if (this.state.selfViewSrc.getAudioTracks().length > 0 &&
                !!this.webrtc.userMedia.audioController &&
                this.webrtc.userMedia.audioController.support) {
                disabledAudioOption = false;
            }
            if (this.state.selfViewSrc.getVideoTracks().length > 0) {
                disabledVideoOption = false;
            }
        }

        return (
            <Flexbox flexDirection="row" height="100%" justifyContent={"flex-start"}>
                <div ref="localContainer" style={{ position: 'relative', width: '300px', height: '100%' }}>
                    <video
                        style={{ height: "150px", width: '100%' }}
                        className="local"
                        id="localVideo"
                        ref="localVideo"
                        autoPlay={true}
                        muted={true} >
                    </video>
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
                    {
                        this.state.isPauseVideo ?
                            <RaisedButton secondary
                                disabled={disabledVideoOption}
                                icon={<FontIcon className="material-icons">videocam_off</FontIcon>}
                                onClick={() => {
                                    // send to peer
                                    this.sendMessage(AbstractPeerConnection.UNPAUSE);

                                    this.webrtc.userMedia.videoController.setVideoEnabled(true);
                                    this.setState({ isPauseVideo: false });
                                }} />
                            :
                            <RaisedButton
                                disabled={disabledVideoOption}
                                icon={<FontIcon className="material-icons">videocam</FontIcon>}
                                onClick={() => {
                                    // send to peer
                                    this.sendMessage(AbstractPeerConnection.PAUSE);

                                    this.webrtc.userMedia.videoController.setVideoEnabled(false);
                                    this.setState({ isPauseVideo: true });
                                }} />
                    }
                    <FlatButton label="HD" primary={true} onClick={() => this.changeMediaContraint(AbstractMediaStream.hdConstraints)} />
                    <FlatButton label="VGA" primary={true} onClick={() => this.changeMediaContraint(AbstractMediaStream.vgaConstraints)} />
                    <FlatButton label="QVGA" primary={true} onClick={() => this.changeMediaContraint(AbstractMediaStream.qvgaConstraints)} />

                    <p style={{ fontSize: 11 }}>UserMedia: {this.state.localStreamStatus}</p>
                    <p style={{ fontSize: 11 }}>AudioTrack: {this.selfAudioName}</p>
                    <p style={{ fontSize: 11 }}>VideoTrack: {this.selfVideoName}</p>
                </div>
                <div style={{ width: "100%", height: "100%", textAlign: "center" }}>
                    <div
                        onMouseOver={() => { this.setState({ isHoverPeer: true }) }}
                        onMouseLeave={() => { this.setState({ isHoverPeer: false }) }}
                        style={{ display: "inline-block", height: "300px", position: "relative" }}>
                        <video
                            style={{ height: "100%", display: this.state.remoteSrc ? "initial" : "none" }}
                            className="remotes"
                            id="remoteVideos"
                            ref="remotes"
                            autoPlay={true} />
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
                                                    getEl(ReactDOM.findDOMNode(this.refs.remotes)).volume = newValue / 100;
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
export const WebRtcPage = enhance(WebRtcComponent) as React.ComponentClass<{ onJoinedRoom, onError }>;