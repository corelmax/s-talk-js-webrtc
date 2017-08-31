"use strict";
/*
This is a Tutorial App with a simpleWebRTC React component.
Compatible with Chrome and Firefox.

1. To join a room uncomment the line 76 in readyToCall(){...} and provide a room name in joinRoom('change-this-roomname').
2. The app by default uses the signal server from simplewebrtc.com. To use a custom Signal server such as the one in  https://github.com/andyet/signalmaster, provide your url link in the code (line 38) as shown in the example at https://simplewebrtc.com/notsosimple.html.
*/
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const react_redux_1 = require("react-redux");
const recompose_1 = require("recompose");
const react_router_dom_1 = require("react-router-dom");
const flexbox_react_1 = require("flexbox-react");
const styles_1 = require("material-ui/styles");
const material_ui_1 = require("material-ui");
const Avatar_1 = require("material-ui/Avatar");
const WithPeerStatus_1 = require("./WithPeerStatus");
const Chitchat_1 = require("../../Chitchat");
const index_1 = require("../../chitchat/stalk-js-webrtc/index");
function getEl(idOrEl) {
    if (typeof idOrEl === 'string') {
        return document.getElementById(idOrEl);
    }
    else {
        return idOrEl;
    }
}
;
class WebRtcAudioComponent extends React.Component {
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
    startWebRtc() {
        return __awaiter(this, void 0, void 0, function* () {
            let rtcConfig = {
                signalingUrl: Chitchat_1.signalingServer,
                socketOptions: { 'force new connection': true },
                debug: false,
            };
            this.webrtc = (yield index_1.WebRtcFactory.getObject(rtcConfig));
            this.peerAdded = this.peerAdded.bind(this);
            this.removeAudio = this.removeAudio.bind(this);
            this.onStreamReady = this.onStreamReady.bind(this);
            this.connectionReady = this.connectionReady.bind(this);
            this.webrtc.webrtcEvents.on(index_1.AbstractWEBRTC.ON_CONNECTION_READY, this.connectionReady);
            this.webrtc.webrtcEvents.on(index_1.AbstractWEBRTC.ON_CONNECTION_CLOSE, (data) => { console.log("signalling close", data); });
            this.webrtc.webrtcEvents.on(index_1.AbstractWEBRTC.CREATED_PEER, (peer) => console.log("createdPeer", peer.id));
            this.webrtc.webrtcEvents.on(index_1.AbstractWEBRTC.JOINED_ROOM, (roomname) => (this.props.onJoinedRoom) ? this.props.onJoinedRoom(roomname) : console.log("joined", roomname));
            this.webrtc.webrtcEvents.on(index_1.AbstractWEBRTC.JOIN_ROOM_ERROR, (err) => console.log("joinRoom fail", err));
            this.webrtc.webrtcEvents.on(index_1.AbstractPeerConnection.PEER_STREAM_ADDED, this.peerAdded);
            this.webrtc.webrtcEvents.on(index_1.AbstractPeerConnection.PEER_STREAM_REMOVED, this.removeAudio);
            this.webrtc.webrtcEvents.on(index_1.AbstractPeerConnection.CONNECTIVITY_ERROR, (peer) => {
                console.log(index_1.AbstractPeerConnection.CONNECTIVITY_ERROR, peer);
            });
        });
    }
    connectionReady(socker_id) {
        let self = this;
        let requestMedia = {
            audio: true
        };
        this.webrtc.userMedia.startLocalStream(requestMedia).then(function (stream) {
            self.onStreamReady(stream);
            let { match } = self.props;
            self.webrtc.join(match.params.id);
        }).catch(err => {
            console.error("LocalStream Fail", err);
            self.setState(prev => (Object.assign({}, prev, { localStreamStatus: err })));
            self.props.onError("LocalStream Fail: " + err);
        });
    }
    onStreamReady(stream) {
        if (!stream)
            return;
        this.selfAudioName = this.webrtc.userMedia.getAudioTrack().label;
        this.setState({ selfViewSrc: stream, localStreamStatus: "ready" });
    }
    peerAdded(peer) {
        let remoteAudio = getEl("remoteAudio");
        if (!!remoteAudio && peer.stream.getAudioTracks().length > 0) {
            remoteAudio.srcObject = peer.stream;
        }
        else {
            console.error("peer doesn't have audio");
        }
        this.setState({ remoteSrc: peer.stream, remoteVolume: 100, peer: peer });
    }
    removeAudio() {
        let remoteAudio = getEl("remoteAudio");
        if (!remoteAudio)
            return;
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
    render() {
        let disabledAudioOption = true;
        if (!!this.state.selfViewSrc) {
            if (this.state.selfViewSrc.getAudioTracks().length > 0 &&
                !!this.webrtc.userMedia.audioController &&
                this.webrtc.userMedia.audioController.support) {
                disabledAudioOption = false;
            }
        }
        return (React.createElement(flexbox_react_1.default, { flexDirection: "row", height: "100%", justifyContent: "flex-start" },
            React.createElement("div", { ref: "localContainer", style: { position: 'relative', width: '200px', height: '100%' } },
                this.props.user ?
                    React.createElement(material_ui_1.Paper, { circle: true, style: {
                            width: "125px",
                            height: "125px",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center"
                        } }, this.props.user.avatar ?
                        React.createElement(Avatar_1.default, { src: this.props.user.avatar, size: 120 })
                        :
                            React.createElement(Avatar_1.default, { size: 120 }, this.props.user.username[0]))
                    :
                        React.createElement("div", null, "User Avatar"),
                React.createElement(material_ui_1.Slider, { min: 0, max: 100, step: 1, disabled: disabledAudioOption, defaultValue: 100, sliderStyle: {
                        margin: 0,
                    }, onChange: (e, newValue) => {
                        this.setState({ micVol: newValue, isMuteVoice: newValue == 0 });
                        this.webrtc.userMedia.audioController.setVolume(newValue / 100);
                    } }),
                React.createElement("div", null, `Mic volume (${this.state.micVol}%)`),
                this.state.isMuteVoice ?
                    React.createElement(material_ui_1.RaisedButton, { secondary: true, disabled: disabledAudioOption, icon: React.createElement(material_ui_1.FontIcon, { className: "material-icons" }, "mic_off"), onClick: () => {
                            this.webrtc.userMedia.audioController.setVolume(this.state.micVol / 100);
                            this.setState({ isMuteVoice: false });
                        } })
                    :
                        React.createElement(material_ui_1.RaisedButton, { disabled: disabledAudioOption, icon: React.createElement(material_ui_1.FontIcon, { className: "material-icons" }, "mic"), onClick: () => {
                                this.webrtc.userMedia.audioController.setVolume(0);
                                this.setState({ isMuteVoice: true });
                            } }),
                React.createElement("p", { style: { fontSize: 12 } },
                    "UserMedia: ",
                    this.state.localStreamStatus),
                React.createElement("p", { style: { fontSize: 12 } },
                    "AudioTrack: ",
                    this.selfAudioName)),
            React.createElement("div", { style: { width: "100%", height: "300px", textAlign: "center" } },
                React.createElement("div", { onMouseOver: () => { this.setState({ isHoverPeer: true }); }, onMouseLeave: () => { this.setState({ isHoverPeer: false }); }, style: { display: "inline-block", height: "300px", position: "relative" } },
                    this.props.remoteUser ?
                        React.createElement(material_ui_1.Paper, { style: {
                                width: "300px",
                                height: "300px",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center"
                            } }, this.props.remoteUser.avatar ?
                            React.createElement(Avatar_1.default, { src: this.props.remoteUser.avatar, size: 300, style: { borderRadius: 0 } })
                            :
                                React.createElement(Avatar_1.default, { size: 300, style: { borderRadius: 0 } }, this.props.remoteUser.username[0]))
                        :
                            React.createElement("div", null, "User Avatar"),
                    React.createElement("audio", { id: "remoteAudio", style: { display: "none" }, autoPlay: true }),
                    this.state.isHoverPeer ?
                        [
                            React.createElement("div", { key: "0", style: {
                                    position: "absolute",
                                    bottom: 0,
                                    width: "100%",
                                    height: "30%",
                                    backgroundPosition: "bottom",
                                    backgroundImage: "url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAADGCAYAAAAT+OqFAAAAdklEQVQoz42QQQ7AIAgEF/T/D+kbq/RWAlnQyyazA4aoAB4FsBSA/bFjuF1EOL7VbrIrBuusmrt4ZZORfb6ehbWdnRHEIiITaEUKa5EJqUakRSaEYBJSCY2dEstQY7AuxahwXFrvZmWl2rh4JZ07z9dLtesfNj5q0FU3A5ObbwAAAABJRU5ErkJggg==)",
                                    "filter": "progid:DXImageTransform.Microsoft.gradient( startColorstr='#000000', endColorstr='#3d3d3d', GradientType=0 )"
                                } }),
                            React.createElement("div", { id: "remoteController", key: "1", style: {
                                    position: "absolute",
                                    width: "100%",
                                    height: "15%",
                                    bottom: 0,
                                    display: this.state.remoteSrc ? "flex" : "none",
                                    alignItems: "center",
                                    padding: "0 5px",
                                } },
                                React.createElement("div", { style: { color: "#fff", width: "41px" } }, `${this.state.remoteVolume}%`),
                                React.createElement(styles_1.MuiThemeProvider, { muiTheme: styles_1.getMuiTheme({
                                        slider: {
                                            trackColor: 'rgba(255,255,255,0.5)',
                                            selectionColor: '#fff',
                                            rippleColor: 'rgba(255,255,255,0.5)'
                                        }
                                    }) },
                                    React.createElement(material_ui_1.Slider, { min: 0, max: 100, step: 1, value: this.state.remoteVolume, onChange: (e, newValue) => {
                                            this.setState({ remoteVolume: newValue });
                                            getEl('remoteAudio').volume = newValue / 100;
                                        }, sliderStyle: {
                                            margin: 0,
                                        }, style: {
                                            width: "30%",
                                            margin: "0 5px",
                                        } })))
                        ]
                        :
                            null),
                React.createElement(WithPeerStatus_1.PeerStatus, { peer: this.state.peer }))));
    }
}
const enhance = recompose_1.compose(react_router_dom_1.withRouter, react_redux_1.connect());
exports.WebRtcAudio = enhance(WebRtcAudioComponent);
