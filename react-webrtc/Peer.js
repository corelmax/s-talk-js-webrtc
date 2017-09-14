/**
 * S-TAlK webrtc peer implementation for web browser.
 *
 * Copyright 2017 Ahoo Studio.co.th.
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { EventEmitter } from "events";
import { AbstractPeer, AbstractPeerConnection } from "../index";
import { getImage } from '../libs/VideoToBlurImage';
import { createStreamByText } from '../libs/StreamHelper';
import * as DetectRTC from 'detectrtc';
var getStats = window["getStats"];
var Peer = /** @class */ (function (_super) {
    __extends(Peer, _super);
    /**
     * reture PeerConnection
     * @param socket
     * @param stream
     * @param options
     */
    function Peer(config) {
        var _this = _super.call(this, config) || this;
        _this.getRemoteStreamTracks = _this.getRemoteStreamTracks.bind(_this);
        _this.initPeerConnection(config.stream, config.iceConfig);
        return _this;
    }
    Peer.prototype.initPeerConnection = function (stream, iceConfig) {
        var self = this;
        self.channels = {};
        self.pcEvent = new EventEmitter();
        self.startTime = window.performance.now();
        var iceServers;
        if (!!iceConfig)
            iceServers = iceConfig;
        else
            iceServers = this.configuration;
        this.pc = new RTCPeerConnection(iceServers);
        this.pc.getPeerStats = getStats;
        if (self.debug) {
            console.log(JSON.stringify(iceServers));
            console.log("connection: " + this.pc.iceConnectionState + ", Gathering: " + this.pc.iceGatheringState + ", signaling: " + this.pc.signalingState);
        }
        this.pc.onnegotiationneeded = function () {
            if (self.debug)
                console.log("onnegotiationneeded");
            self.pcEvent.emit(AbstractPeerConnection.PeerEvent, "onnegotiationneeded");
            if (self.offer) {
                self.createOffer();
            }
        };
        this.pc.onicecandidate = function (event) {
            self.send_event(AbstractPeerConnection.CANDIDATE, event.candidate, { to: self.id });
        };
        this.pc.oniceconnectionstatechange = function (event) {
            var target = event.target;
            if (self.debug)
                console.log('oniceconnectionstatechange', target.iceConnectionState);
            self.pcEvent.emit("oniceconnectionstatechange", target.iceConnectionState);
            if (target.iceConnectionState === 'completed') {
                self.getRemoteStreamTracks();
                self.parentsEmitter.emit(AbstractPeerConnection.ON_ICE_COMPLETED, self.pcPeers);
            }
            else if (target.iceConnectionState === 'connected') {
                self.createDataChannel("message");
                self.pc.ondatachannel = self.receiveChannelCallback.bind(self);
                self.parentsEmitter.emit(AbstractPeerConnection.ON_ICE_CONNECTED, self.pcPeers);
            }
            else if (target.iceConnectionState == "failed") {
                self.parentsEmitter.emit(AbstractPeerConnection.ON_ICE_CONNECTION_FAILED, self.pcPeers);
                self.send_event(AbstractPeerConnection.CONNECTIVITY_ERROR, null, { to: self.id });
            }
            else if (target.iceConnectionState == "closed") {
                self.parentsEmitter.emit(AbstractPeerConnection.ON_ICE_CONNECTION_CLOSED, self.pcPeers);
            }
        };
        this.pc.onicegatheringstatechange = function (event) {
            var target = event.target;
            if (self.debug)
                console.log("onicegatheringstatechange", target.iceGatheringState);
            // When iceGatheringState == complete it fire onicecandidate with null.
            if (target.iceGatheringState == "complete") {
                self.sendOffer();
            }
            self.pcEvent.emit("onicegatheringstatechange", target.iceGatheringState);
        };
        this.pc.onsignalingstatechange = function (event) {
            var target = event.target;
            if (self.debug)
                console.log('onsignalingstatechange', target.signalingState);
            self.pcEvent.emit("onsignalingstatechange", target.signalingState);
        };
        this.pc.onaddstream = function (peer) {
            if (self.debug)
                console.log('onaddstream');
            self.pcEvent.emit(AbstractPeerConnection.PeerEvent, "onaddstream");
            self.parentsEmitter.emit(AbstractPeerConnection.PEER_STREAM_ADDED, peer);
        };
        this.pc.onremovestream = function (peer) {
            if (self.debug)
                console.log('onremovestream');
            self.pcEvent.emit(AbstractPeerConnection.PeerEvent, "onremovestream");
            self.parentsEmitter.emit(AbstractPeerConnection.PEER_STREAM_REMOVED, peer.stream);
        };
        this.pc.addStream(stream);
        DetectRTC.load(function () {
            if (self.debug)
                console.log("DetectRTC", DetectRTC);
        });
        self.parentsEmitter.emit(AbstractPeerConnection.CREATED_PEER, self);
    };
    Peer.prototype.getRemoteStreamTracks = function () {
        var self = this;
        var mediaStreams = self.pc.getRemoteStreams();
        self.audioTracks = new Array();
        self.videoTracks = new Array();
        mediaStreams.map(function (stream) { return self.audioTracks.concat(stream.getAudioTracks()); });
        mediaStreams.map(function (stream) { return self.videoTracks.concat(stream.getVideoTracks()); });
        process.nextTick(function () {
            self.parentsEmitter.emit(AbstractPeerConnection.PEER_STATS_READY);
        });
    };
    Peer.prototype.getStats = function (mediaTrack, secInterval) {
        var self = this;
        self.pc.getPeerStats(mediaTrack, function (result) {
            if (self.debug) {
                console.log("getStats: ", result);
            }
            self.parentsEmitter.emit(AbstractPeerConnection.PEER_STAT, result);
        }, secInterval);
        // const peer = this.pcPeers[Object.keys(this.pcPeers)[0]];
        // const pc = peer.pc as RTCPeerConnection;
        // if (pc.getRemoteStreams()[0] && pc.getRemoteStreams()[0].getAudioTracks()[0]) {
        //     const track = pc.getRemoteStreams()[0].getAudioTracks()[0];
        //     pc.getStats(track, (report) => {
        //         console.log('getStats report', report);
        //     }, self.logError);
        // }
    };
    Peer.prototype.handleMessage = function (message) {
        var self = this;
        if (message.prefix)
            this.browserPrefix = message.prefix;
        if (message.type === AbstractPeerConnection.OFFER) {
            if (!this.nick)
                this.nick = message.payload.nick;
            delete message.payload.nick;
            self.pc.setRemoteDescription(new RTCSessionDescription(message.payload))
                .then(function () {
                if (self.debug)
                    console.log("setRemoteDescription complete");
                if (self.pc.remoteDescription.type == AbstractPeerConnection.OFFER) {
                    self.createAnswer(message);
                }
            }).catch(self.onSetSessionDescriptionError);
        }
        else if (message.type === AbstractPeerConnection.ANSWER) {
            self.pc.setRemoteDescription(new RTCSessionDescription(message.payload))
                .catch(self.onSetSessionDescriptionError);
        }
        else if (message.type === AbstractPeerConnection.CANDIDATE) {
            if (!message.payload)
                return;
            var onAddIceCandidateSuccess = function () {
                // if (self.debug)
                //     console.log('addIceCandidate success');
            };
            var onAddIceCandidateError = function (error) {
                if (self.debug)
                    console.warn('failed to add ICE Candidate: ' + error.toString());
            };
            self.pc.addIceCandidate(new RTCIceCandidate(message.payload), onAddIceCandidateSuccess, onAddIceCandidateError);
        }
        else if (message.type === AbstractPeerConnection.CONNECTIVITY_ERROR) {
            this.parentsEmitter.emit(AbstractPeerConnection.CONNECTIVITY_ERROR, self.pc);
        }
        else if (message.type === 'endOfCandidates') {
            // Edge requires an end-of-candidates. Since only Edge will have mLines or tracks on the
            // shim this will only be called in Edge.
            console.log(message.type);
            var mLines = this.pc.pc.transceivers || [];
            mLines.forEach(function (mLine) {
                if (mLine.iceTransport) {
                    mLine.iceTransport.addRemoteCandidate({});
                }
            });
        }
    };
    ;
    // send via data channel
    // returns true when message was sent and false if channel is not open
    Peer.prototype.sendDirectly = function (channel, messageType, payload) {
        var message = {
            type: messageType,
            payload: payload
        };
        console.log('sending via datachannel', channel, messageType, message);
        var dc = this.getDataChannel(channel);
        if (dc.readyState != 'open')
            return false;
        dc.send(JSON.stringify(message));
        return true;
    };
    ;
    Peer.prototype.getDataChannel = function (name) {
        // if (!webrtcSupport.supportDataChannel)
        //     return this.emit('error', new Error('createDataChannel not supported'));
        var channel = this.channels[name];
        if (channel)
            return channel;
        // if we don't have one by this label, create it
        return this.createDataChannel(name);
    };
    Peer.prototype.createDataChannel = function (name) {
        var self = this;
        var dataConstraint = null;
        if (this.channels[name]) {
            return;
        }
        var channel = this.channels[name] = this.pc.createDataChannel(name, dataConstraint);
        channel.onerror = function (error) {
            console.log("dataChannel.onerror", error);
        };
        channel.onmessage = function (event) {
            console.log("dataChannel.onmessage:", event.data);
        };
        channel.onopen = function () {
            console.log('dataChannel.onopen');
        };
        channel.onclose = function () {
            console.log("dataChannel.onclose");
        };
        return channel;
    };
    Peer.prototype.receiveChannelCallback = function (event) {
        console.log('Receive Channel', event.channel.label);
        this.receiveChannel = event.channel;
        this.receiveChannel.onmessage = this.onReceiveMessageCallback.bind(this);
        this.receiveChannel.onopen = this.onReceiveChannelStateChange.bind(this);
        this.receiveChannel.onclose = this.onReceiveChannelStateChange.bind(this);
    };
    Peer.prototype.onReceiveChannelStateChange = function () {
        var readyState = this.receiveChannel.readyState;
        console.log('Receive channel state is: ' + readyState);
    };
    Peer.prototype.onReceiveMessageCallback = function (event) {
        console.log('Receive Message', event.data);
        var data = JSON.parse(event.data);
        var remoteVideoElement = document.getElementById('remoteVideos');
        var remoteAudioElement = document.getElementById('remoteAudio');
        if (data.type === AbstractPeerConnection.UNPAUSE) {
            remoteVideoElement.srcObject = this.pc.getRemoteStreams()[0];
        }
        else if (data.type === AbstractPeerConnection.PAUSE) {
            remoteAudioElement.srcObject = this.pc.getRemoteStreams()[0];
            getImage(remoteVideoElement).then(function (res) {
                console.warn('getImage', res);
                remoteVideoElement.srcObject = res;
            });
        }
        else if (data.type === AbstractPeerConnection.DUMMY_VIDEO) {
            var canvasStream = createStreamByText("NO CAMERA");
            if (!!canvasStream)
                remoteVideoElement.srcObject = canvasStream;
        }
    };
    return Peer;
}(AbstractPeer.BasePeer));
export { Peer };
