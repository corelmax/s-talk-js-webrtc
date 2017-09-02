/**
 * S-TAlK React-Native webrtc peer implementation...
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
import { EventEmitter } from 'events';
import { RTCPeerConnection, RTCIceCandidate, RTCSessionDescription, } from 'react-native-webrtc';
import { AbstractPeerConnection } from "../core/AbstractPeerConnection";
import { AbstractPeer } from "../core/AbstractPeer";
var configuration = { "iceServers": [{ "url": "stun:stun.l.google.com:19302" }] };
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
        _this.initPeerConnection(config.stream);
        return _this;
    }
    Peer.prototype.initPeerConnection = function (stream) {
        var self = this;
        self.channels = {};
        self.pcEvent = new EventEmitter();
        this.pc = new RTCPeerConnection(configuration);
        this.pc.onicecandidate = function (event) {
            if (!!event.candidate) {
                self.send_event(AbstractPeerConnection.CANDIDATE, event.candidate, { to: self.id });
            }
        };
        this.pc.onnegotiationneeded = function () {
            if (self.offer) {
                self.createOffer();
                self.offer = false;
            }
        };
        this.pc.oniceconnectionstatechange = function (event) {
            var target = event.target;
            if (self.debug)
                console.log('oniceconnectionstatechange', target.iceConnectionState);
            if (target.iceConnectionState === 'completed') {
                // setTimeout(() => {
                //     self.getStats();
                // }, 1000);
            }
            if (target.iceConnectionState === 'connected') {
                self.createDataChannel();
            }
            else if (target.iceConnectionState == "failed") {
                self.parentsEmitter.emit(AbstractPeerConnection.ON_ICE_CONNECTION_FAILED, self.pc);
                self.send_event(AbstractPeerConnection.CONNECTIVITY_ERROR, null, { to: self.id });
            }
            else if (target.iceConnectionState == "closed") {
                self.parentsEmitter.emit(AbstractPeerConnection.ON_ICE_CONNECTION_CLOSED);
            }
        };
        this.pc.onicegatheringstatechange = function (event) {
            var target = event.target;
            if (self.debug)
                console.log("onicegatheringstatechange", target.iceGatheringState);
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
            self.parentsEmitter.emit(AbstractPeerConnection.PEER_STREAM_ADDED, peer);
        };
        this.pc.onremovestream = function (peer) {
            if (self.debug)
                console.log('onremovestream');
            self.parentsEmitter.emit(AbstractPeerConnection.PEER_STREAM_REMOVED, peer.stream);
        };
        this.pc.addStream(stream);
        self.parentsEmitter.emit(AbstractPeerConnection.CREATED_PEER, self);
    };
    Peer.prototype.getStats = function () {
        var self = this;
        var peer = this.pcPeers[Object.keys(this.pcPeers)[0]];
        var pc = peer.pc;
        if (pc.getRemoteStreams()[0] && pc.getRemoteStreams()[0].getAudioTracks()[0]) {
            var track = pc.getRemoteStreams()[0].getAudioTracks()[0];
            console.log('track', track);
            pc.getStats(track, function (report) {
                console.log('getStats report', report);
            }, self.logError);
        }
    };
    Peer.prototype.handleMessage = function (message) {
        var self = this;
        if (self.debug)
            console.log('handleMessage', message.type);
        if (message.prefix)
            this.browserPrefix = message.prefix;
        if (message.type === AbstractPeerConnection.OFFER) {
            if (!this.nick)
                this.nick = message.payload.nick;
            delete message.payload.nick;
            self.pc.setRemoteDescription(new RTCSessionDescription(message.payload), function () {
                if (self.debug)
                    console.log("setRemoteDescription complete");
                if (self.pc.remoteDescription.type == AbstractPeerConnection.OFFER) {
                    self.createAnswer(message);
                }
            }, self.onSetSessionDescriptionError);
        }
        else if (message.type === AbstractPeerConnection.CANDIDATE) {
            if (!message.candidate)
                return;
            self.pc.addIceCandidate(new RTCIceCandidate(message.candidate));
        }
        else if (message.type === AbstractPeerConnection.CONNECTIVITY_ERROR) {
            this.parentsEmitter.emit(AbstractPeerConnection.CONNECTIVITY_ERROR, self.pc);
        }
    };
    ;
    Peer.prototype.createDataChannel = function () {
        if (this.pc.textDataChannel) {
            return;
        }
        var dataChannel = this.pc.createDataChannel("text");
        dataChannel.onerror = function (error) {
            console.log("dataChannel.onerror", error);
        };
        dataChannel.onmessage = function (event) {
            console.log("dataChannel.onmessage:", event.data);
            var message = event.data;
            if (message.type === 'connectivityError') {
                this.parentsEmitter.emit(AbstractPeerConnection.CONNECTIVITY_ERROR, self);
            }
            else if (message.type === 'endOfCandidates') {
                // Edge requires an end-of-candidates. Since only Edge will have mLines or tracks on the
                // shim this will only be called in Edge.
                var mLines = this.pc.pc.transceivers || [];
                mLines.forEach(function (mLine) {
                    if (mLine.iceTransport) {
                        mLine.iceTransport.addRemoteCandidate({});
                    }
                });
            }
        };
        dataChannel.onopen = function () {
            console.log('dataChannel.onopen');
        };
        dataChannel.onclose = function () {
            console.log("dataChannel.onclose");
        };
        this.pc.textDataChannel = dataChannel;
    };
    return Peer;
}(AbstractPeer.BasePeer));
export { Peer };
