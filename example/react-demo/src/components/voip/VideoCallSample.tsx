import * as React from "react";
import * as ReactDOM from "react-dom";
// import { connect } from "react-redux";
// import { withRouter } from "react-router-dom";
import { shallowEqual, compose } from "recompose";
import Flexbox from "flexbox-react";
import * as Colors from "material-ui/styles/colors";
import { RaisedButton, FontIcon, Slider, Paper, Subheader, FlatButton } from "material-ui";
import { WithDialog } from "../toolsbox/DialogBoxEnhancer";
import { MuiThemeProvider, getMuiTheme } from "material-ui/styles";

import { PeerStatus } from "./WithPeerStatus";
// import { signalingServer } from "../../Chitchat";
import { AbstractWEBRTC, AbstractPeerConnection, AbstractMediaStream, WebRtcFactory } from "../../chitchat/stalk-js-webrtc/index";
import { createStreamByText, createDummyStream } from '../../chitchat/stalk-js-webrtc/libs/StreamHelper';

import { IComponentProps } from "../../utils/IComponentProps";

import { SimpleToolbar } from "../../components/SimpleToolbar";

const signalingServer = "https://chitchats.ga:8888";

interface IComponentNameState {
    selfViewSrc;
    remoteSrc;
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

export class VideoCall extends React.Component<IComponentProps, IComponentNameState> {
    webrtc: AbstractWEBRTC.IWebRTC;
    remotesView;
    selfView;
    selfAudioName: string;
    selfVideoName: string;

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
        this.webrtc.webrtcEvents.on(AbstractWEBRTC.JOIN_ROOM_ERROR, (err) => console.log("joinRoom fail", err));
        this.webrtc.webrtcEvents.on(AbstractWEBRTC.JOINED_ROOM, (roomname: string) => console.log("joined", roomname));
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
            video: AbstractMediaStream.vgaConstraints.video,
            audio: true
        } as MediaStreamConstraints;

        // have both video and audio
        this.webrtc.userMedia.startLocalStream(requestMedia).then(stream => {
            self.onStreamReady(stream);

            let { match } = self.props;
            self.webrtc.join(match.params.id);
        }).catch(err => {
            console.error("LocalStream Fail", err);

            // only mic
            if (err == "getUserMedia error: DevicesNotFoundError") {
                self.webrtc.userMedia.startLocalStream({ ...requestMedia, video: false }).then(stream => {
                    self.onStreamReady(stream);

                    let { match } = self.props;
                    self.webrtc.join(match.params.id);
                }).catch(err => {
                    console.error("LocalStream Fail", err);

                    // only video
                    if (err == "getUserMedia error: DevicesNotFoundError") {
                        self.webrtc.userMedia.startLocalStream({ ...requestMedia, audio: false }).then(stream => {
                            self.onStreamReady(stream);

                            let { match } = self.props;
                            self.webrtc.join(match.params.id);
                        }).catch(err => {
                            console.error("LocalStream Fail", err);

                            if (err == "getUserMedia error: DevicesNotFoundError") {
                                // join room without media
                                let dummyStream = createDummyStream();
                                self.webrtc.userMedia.setLocalStream(dummyStream);

                                self.onStreamReady(null);

                                let { match } = self.props;
                                self.webrtc.join(match.params.id);
                            }
                            else {
                                self.setState(prev => ({ ...prev, localStreamStatus: err }));
                                self.props.onError("LocalStream Fail: " + err);
                            }
                        });
                    }
                    else {
                        self.setState(prev => ({ ...prev, localStreamStatus: err }));
                        self.props.onError("LocalStream Fail: " + err);
                    }
                });
            }
            else {
                self.setState(prev => ({ ...prev, localStreamStatus: err }));
                self.props.onError("LocalStream Fail: " + err);
            }
        });
    }

    peerAdded(peer) {
        console.log("peerAdded", peer);

        let remotesView = getEl(ReactDOM.findDOMNode(this.refs.remotes));
        let remotesAudio = getEl('remoteAudio');
        if (!remotesView) return;

        if (!!peer.stream) {
            let videoTracks = peer.stream.getVideoTracks();
            if (videoTracks.length > 0) {
                remotesView.srcObject = peer.stream;
            }
            else {
                let canvasStream = createStreamByText("NO CAMERA");
                if (!!canvasStream) remotesView.srcObject = canvasStream;
                remotesAudio.srcObject = peer.stream;
            }
        }

        if (this.state.selfViewSrc == null) {
            const self = this;
            setTimeout(function () {
                self.sendMessage(AbstractPeerConnection.DUMMY_VIDEO);
            }, 350);
        }

        remotesView.volume = 1;

        this.setState({ remoteSrc: peer.stream, remoteVolume: 100 });
    }

    removeVideo() {
        let remotesView = getEl(ReactDOM.findDOMNode(this.refs.remotes));
        if (!!remotesView) remotesView.disable = true;

        this.setState({ remoteSrc: null });
    }

    onStreamReady(stream: MediaStream | null) {
        let selfView = getEl(ReactDOM.findDOMNode(this.refs.localVideo));
        if (!selfView) return;
        if (!!stream && stream.getVideoTracks().length > 0) {
            selfView.srcObject = stream;
        }
        else if (!stream || stream.getVideoTracks().length == 0) {
            let canvasStream = createStreamByText("NO CAMERA");
            if (!!selfView && !!canvasStream) selfView.srcObject = canvasStream;
        }

        let video = this.webrtc.userMedia.getVideoTrack() as MediaStreamTrack;
        let audio = this.webrtc.userMedia.getAudioTrack() as MediaStreamTrack;
        this.selfAudioName = audio.label;
        this.selfVideoName = video.label;

        this.setState({ selfViewSrc: stream, localStreamStatus: "ready" });
    }

    onPeerCreated(peer: AbstractPeerConnection.IPC_Handler) {
        console.log("onPeerCreated", peer);
        this.setState(prev => ({ ...prev, peer: peer }));
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

    componentWillReceiveProps(nextProps: IComponentProps) {
        let prevInline = this.props.stalkReducer.get("inline");
        let nextInline = nextProps.stalkReducer.get("inline");
        if (!nextInline && !shallowEqual(nextInline, prevInline)) {
            this.onBackPressed();
        }
    }

    /**
     * Set volume to html elements
     * @param elements array of element which are <video>, <audio> only
     * @param volume must be 0-1
     */
    setElementsVolume(elements: Array<HTMLVideoElement | HTMLAudioElement>, volume: number) {
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

    render(): JSX.Element {
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

        return (
            <Flexbox flexDirection="column" style={{ backgroundColor: Colors.blueGrey50 }}>
                <div style={{ position: "relative", height: "56px" }}>
                    <div style={{ position: "fixed", width: "100%", zIndex: 1 }} >
                        <SimpleToolbar
                            title={(!!team) ? team.name.toUpperCase() : ""}
                            onBackPressed={this.onBackPressed}
                            onPressTitle={this.onTitlePressed} />
                    </div>
                </div>
                <Flexbox flexDirection="row" height="100%" justifyContent={"flex-start"}>
                    <div ref="localContainer" style={{ position: 'relative', width: '200px', height: '100%' }}>
                        <video
                            style={{ background: "#000", height: "150px", width: '100%' }}
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

                        <p style={{ fontSize: 12 }}>UserMedia: {this.state.localStreamStatus}</p>
                        <p style={{ fontSize: 12 }}>AudioTrack: {this.selfAudioName}</p>
                        <p style={{ fontSize: 12 }}>VideoTrack: {this.selfVideoName}</p>
                    </div>
                    <div style={{ width: "100%", height: "300px", textAlign: "center" }}>
                        <div
                            onMouseOver={() => { this.setState({ isHoverPeer: true }) }}
                            onMouseLeave={() => { this.setState({ isHoverPeer: false }) }}
                            style={{ display: "inline-block", height: "300px", position: "relative" }}>
                            <video
                                style={{ background: "#000", height: "300px", display: this.state.remoteSrc ? "initial" : "none" }}
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
                                            <MuiThemeProvider
                                                muiTheme={getMuiTheme({
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
                                                        this.setElementsVolume([
                                                            getEl('remoteAudio'),
                                                            getEl(ReactDOM.findDOMNode(this.refs.remotes))
                                                        ], newValue / 100);
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
            </Flexbox >
        );
    }
}

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
