"use strict";
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
const ReactDOM = require("react-dom");
// import { connect } from "react-redux";
// import { withRouter } from "react-router-dom";
const recompose_1 = require("recompose");
const flexbox_react_1 = require("flexbox-react");
const Colors = require("material-ui/styles/colors");
const material_ui_1 = require("material-ui");
const styles_1 = require("material-ui/styles");
const WithPeerStatus_1 = require("./WithPeerStatus");
// import { signalingServer } from "../../Chitchat";
const index_1 = require("../../chitchat/stalk-js-webrtc/index");
const StreamHelper_1 = require("../../chitchat/stalk-js-webrtc/libs/StreamHelper");
const SimpleToolbar_1 = require("../../components/SimpleToolbar");
const signalingServer = "https://chitchats.ga:8888";
function getEl(idOrEl) {
    if (typeof idOrEl === 'string') {
        return document.getElementById(idOrEl);
    }
    else {
        return idOrEl;
    }
}
;
class VideoCall extends React.Component {
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
        this.onBackPressed = this.onBackPressed.bind(this);
        this.onTitlePressed = this.onTitlePressed.bind(this);
        this.changeMediaContraint = this.changeMediaContraint.bind(this);
        this.sendMessage = this.sendMessage.bind(this);
        this.startWebRtc();
    }
    onBackPressed() {
        // Jump to main menu.
        this.props.history.goBack();
    }
    onTitlePressed() {
        let { history, teamReducer } = this.props;
        history.replace(`/team/${teamReducer.team._id}`);
    }
    changeMediaContraint(media) {
        let self = this;
        let peers = this.webrtc.peerManager.getPeers();
        self.webrtc.userMedia.stopLocalStream();
        peers.forEach(peer => {
            peer.offer = true;
            peer.removeStream(self.webrtc.userMedia.getLocalStream());
        });
        process.nextTick(() => {
            let requestMedia = {
                video: media.video,
                audio: true
            };
            self.webrtc.userMedia.startLocalStream(requestMedia).then(function (stream) {
                self.onStreamReady(stream);
                peers.forEach(peer => {
                    peer.offer = true;
                    peer.addStream(stream);
                });
            }).catch(err => {
                console.error("LocalStream Fail", err);
                self.setState(prev => (Object.assign({}, prev, { localStreamStatus: err })));
                self.props.onError("LocalStream Fail: " + err);
            });
        });
    }
    startWebRtc() {
        return __awaiter(this, void 0, void 0, function* () {
            let rtcConfig = {
                signalingUrl: signalingServer,
                socketOptions: { 'force new connection': true },
                debug: true,
            };
            this.webrtc = (yield index_1.WebRtcFactory.getObject(rtcConfig));
            this.peerAdded = this.peerAdded.bind(this);
            this.removeVideo = this.removeVideo.bind(this);
            this.onStreamReady = this.onStreamReady.bind(this);
            this.connectionReady = this.connectionReady.bind(this);
            this.onPeerCreated = this.onPeerCreated.bind(this);
            this.webrtc.webrtcEvents.on(index_1.AbstractWEBRTC.ON_CONNECTION_READY, this.connectionReady);
            this.webrtc.webrtcEvents.on(index_1.AbstractWEBRTC.ON_CONNECTION_CLOSE, (data) => { console.log("signalling close", data); });
            this.webrtc.webrtcEvents.on(index_1.AbstractWEBRTC.JOIN_ROOM_ERROR, (err) => console.log("joinRoom fail", err));
            this.webrtc.webrtcEvents.on(index_1.AbstractWEBRTC.JOINED_ROOM, (roomname) => console.log("joined", roomname));
            this.webrtc.webrtcEvents.on(index_1.AbstractPeerConnection.PEER_STREAM_ADDED, this.peerAdded);
            this.webrtc.webrtcEvents.on(index_1.AbstractPeerConnection.PEER_STREAM_REMOVED, this.removeVideo);
            this.webrtc.webrtcEvents.on(index_1.AbstractPeerConnection.CONNECTIVITY_ERROR, (peer) => {
                console.log(index_1.AbstractPeerConnection.CONNECTIVITY_ERROR, peer);
            });
            this.webrtc.webrtcEvents.on(index_1.AbstractPeerConnection.CREATED_PEER, this.onPeerCreated);
        });
    }
    connectionReady(socker_id) {
        let self = this;
        let requestMedia = {
            video: index_1.AbstractMediaStream.vgaConstraints.video,
            audio: true
        };
        // have both video and audio
        this.webrtc.userMedia.startLocalStream(requestMedia).then(stream => {
            self.onStreamReady(stream);
            let { match } = self.props;
            self.webrtc.join(match.params.id);
        }).catch(err => {
            console.error("LocalStream Fail", err);
            // only mic
            if (err == "getUserMedia error: DevicesNotFoundError") {
                self.webrtc.userMedia.startLocalStream(Object.assign({}, requestMedia, { video: false })).then(stream => {
                    self.onStreamReady(stream);
                    let { match } = self.props;
                    self.webrtc.join(match.params.id);
                }).catch(err => {
                    console.error("LocalStream Fail", err);
                    // only video
                    if (err == "getUserMedia error: DevicesNotFoundError") {
                        self.webrtc.userMedia.startLocalStream(Object.assign({}, requestMedia, { audio: false })).then(stream => {
                            self.onStreamReady(stream);
                            let { match } = self.props;
                            self.webrtc.join(match.params.id);
                        }).catch(err => {
                            console.error("LocalStream Fail", err);
                            if (err == "getUserMedia error: DevicesNotFoundError") {
                                // join room without media
                                let dummyStream = StreamHelper_1.createDummyStream();
                                self.webrtc.userMedia.setLocalStream(dummyStream);
                                self.onStreamReady(null);
                                let { match } = self.props;
                                self.webrtc.join(match.params.id);
                            }
                            else {
                                self.setState(prev => (Object.assign({}, prev, { localStreamStatus: err })));
                                self.props.onError("LocalStream Fail: " + err);
                            }
                        });
                    }
                    else {
                        self.setState(prev => (Object.assign({}, prev, { localStreamStatus: err })));
                        self.props.onError("LocalStream Fail: " + err);
                    }
                });
            }
            else {
                self.setState(prev => (Object.assign({}, prev, { localStreamStatus: err })));
                self.props.onError("LocalStream Fail: " + err);
            }
        });
    }
    peerAdded(peer) {
        console.log("peerAdded", peer);
        let remotesView = getEl(ReactDOM.findDOMNode(this.refs.remotes));
        let remotesAudio = getEl('remoteAudio');
        if (!remotesView)
            return;
        if (!!peer.stream) {
            let videoTracks = peer.stream.getVideoTracks();
            if (videoTracks.length > 0) {
                remotesView.srcObject = peer.stream;
            }
            else {
                let canvasStream = StreamHelper_1.createStreamByText("NO CAMERA");
                if (!!canvasStream)
                    remotesView.srcObject = canvasStream;
                remotesAudio.srcObject = peer.stream;
            }
        }
        if (this.state.selfViewSrc == null) {
            const self = this;
            setTimeout(function () {
                self.sendMessage(index_1.AbstractPeerConnection.DUMMY_VIDEO);
            }, 350);
        }
        remotesView.volume = 1;
        this.setState({ remoteSrc: peer.stream, remoteVolume: 100 });
    }
    removeVideo() {
        let remotesView = getEl(ReactDOM.findDOMNode(this.refs.remotes));
        if (!!remotesView)
            remotesView.disable = true;
        this.setState({ remoteSrc: null });
    }
    onStreamReady(stream) {
        let selfView = getEl(ReactDOM.findDOMNode(this.refs.localVideo));
        if (!selfView)
            return;
        if (!!stream && stream.getVideoTracks().length > 0) {
            selfView.srcObject = stream;
        }
        else if (!stream || stream.getVideoTracks().length == 0) {
            let canvasStream = StreamHelper_1.createStreamByText("NO CAMERA");
            if (!!selfView && !!canvasStream)
                selfView.srcObject = canvasStream;
        }
        let video = this.webrtc.userMedia.getVideoTrack();
        let audio = this.webrtc.userMedia.getAudioTrack();
        this.selfAudioName = audio.label;
        this.selfVideoName = video.label;
        this.setState({ selfViewSrc: stream, localStreamStatus: "ready" });
    }
    onPeerCreated(peer) {
        console.log("onPeerCreated", peer);
        this.setState(prev => (Object.assign({}, prev, { peer: peer })));
    }
    componentWillMount() {
        if (!this.props.teamReducer.team) {
            this.props.history.replace("/");
        }
    }
    componentWillUnmount() {
        if (!!this.webrtc) {
            this.webrtc.leaveRoom();
            this.webrtc.disconnect();
        }
        // this.webrtc.stopLocalVideo();
        // this.props.dispatch(calling.onVideoCallEnded());
    }
    componentWillReceiveProps(nextProps) {
        let prevInline = this.props.stalkReducer.get("inline");
        let nextInline = nextProps.stalkReducer.get("inline");
        if (!nextInline && !recompose_1.shallowEqual(nextInline, prevInline)) {
            this.onBackPressed();
        }
    }
    /**
     * Set volume to html elements
     * @param elements array of element which are <video>, <audio> only
     * @param volume must be 0-1
     */
    setElementsVolume(elements, volume) {
        if (Array.isArray(elements) && elements.length > 0) {
            elements.forEach(each => {
                each.volume = volume;
            });
        }
    }
    sendMessage(message) {
        this.webrtc.peerManager.sendDirectlyToAll("message", message, {
            _id: this.webrtc.signalingSocket.id,
            stream_id: !!this.state.selfViewSrc ? this.state.selfViewSrc._id : null,
        });
    }
    render() {
        let { team } = this.props.teamReducer;
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
        return (React.createElement(flexbox_react_1.default, { flexDirection: "column", style: { backgroundColor: Colors.blueGrey50 } },
            React.createElement("div", { style: { position: "relative", height: "56px" } },
                React.createElement("div", { style: { position: "fixed", width: "100%", zIndex: 1 } },
                    React.createElement(SimpleToolbar_1.SimpleToolbar, { title: (!!team) ? team.name.toUpperCase() : "", onBackPressed: this.onBackPressed, onPressTitle: this.onTitlePressed }))),
            React.createElement(flexbox_react_1.default, { flexDirection: "row", height: "100%", justifyContent: "flex-start" },
                React.createElement("div", { ref: "localContainer", style: { position: 'relative', width: '200px', height: '100%' } },
                    React.createElement("video", { style: { background: "#000", height: "150px", width: '100%' }, className: "local", id: "localVideo", ref: "localVideo", autoPlay: true, muted: true }),
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
                    this.state.isPauseVideo ?
                        React.createElement(material_ui_1.RaisedButton, { secondary: true, disabled: disabledVideoOption, icon: React.createElement(material_ui_1.FontIcon, { className: "material-icons" }, "videocam_off"), onClick: () => {
                                // send to peer
                                this.sendMessage(index_1.AbstractPeerConnection.UNPAUSE);
                                this.webrtc.userMedia.videoController.setVideoEnabled(true);
                                this.setState({ isPauseVideo: false });
                            } })
                        :
                            React.createElement(material_ui_1.RaisedButton, { disabled: disabledVideoOption, icon: React.createElement(material_ui_1.FontIcon, { className: "material-icons" }, "videocam"), onClick: () => {
                                    // send to peer
                                    this.sendMessage(index_1.AbstractPeerConnection.PAUSE);
                                    this.webrtc.userMedia.videoController.setVideoEnabled(false);
                                    this.setState({ isPauseVideo: true });
                                } }),
                    React.createElement(material_ui_1.FlatButton, { label: "HD", primary: true, onClick: () => this.changeMediaContraint(index_1.AbstractMediaStream.hdConstraints) }),
                    React.createElement(material_ui_1.FlatButton, { label: "VGA", primary: true, onClick: () => this.changeMediaContraint(index_1.AbstractMediaStream.vgaConstraints) }),
                    React.createElement(material_ui_1.FlatButton, { label: "QVGA", primary: true, onClick: () => this.changeMediaContraint(index_1.AbstractMediaStream.qvgaConstraints) }),
                    React.createElement("p", { style: { fontSize: 12 } },
                        "UserMedia: ",
                        this.state.localStreamStatus),
                    React.createElement("p", { style: { fontSize: 12 } },
                        "AudioTrack: ",
                        this.selfAudioName),
                    React.createElement("p", { style: { fontSize: 12 } },
                        "VideoTrack: ",
                        this.selfVideoName)),
                React.createElement("div", { style: { width: "100%", height: "300px", textAlign: "center" } },
                    React.createElement("div", { onMouseOver: () => { this.setState({ isHoverPeer: true }); }, onMouseLeave: () => { this.setState({ isHoverPeer: false }); }, style: { display: "inline-block", height: "300px", position: "relative" } },
                        React.createElement("video", { style: { background: "#000", height: "300px", display: this.state.remoteSrc ? "initial" : "none" }, className: "remotes", id: "remoteVideos", ref: "remotes", autoPlay: true }),
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
                                                this.setElementsVolume([
                                                    getEl('remoteAudio'),
                                                    getEl(ReactDOM.findDOMNode(this.refs.remotes))
                                                ], newValue / 100);
                                            }, sliderStyle: {
                                                margin: 0,
                                            }, style: {
                                                width: "30%",
                                                margin: "0 5px",
                                            } })))
                            ]
                            :
                                null),
                    React.createElement(WithPeerStatus_1.PeerStatus, { peer: this.state.peer })))));
    }
}
exports.VideoCall = VideoCall;
// const mapStateToProps = (state) => ({
//     userReducer: state.userReducer,
//     alertReducer: state.alertReducer,
//     teamReducer: state.teamReducer,
//     stalkReducer: state.stalkReducer
// });
// const enhance = compose(
//     WithDialog,
//     withRouter,
//     connect(mapStateToProps)
// );
// export const VideoCallSample = enhance(VideoCall);
