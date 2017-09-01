"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
var events_1 = require("events");
var index_1 = require("../index");
var VideoToBlurImage_1 = require("../libs/VideoToBlurImage");
var StreamHelper_1 = require("../libs/StreamHelper");
// const twilioIceServers = [
//     { url: 'stun:global.stun.twilio.com:3478?transport=udp' }
// ];
// configuration.iceServers = twilioIceServers;
var configuration = { "iceServers": [{ "urls": "stun:stun.l.google.com:19302" }] };
var Peer = (function (_super) {
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
        self.pcEvent = new events_1.EventEmitter();
        this.pc = new RTCPeerConnection(configuration);
        this.pc.onicecandidate = function (event) {
            if (event.candidate) {
                self.send_event(index_1.AbstractPeerConnection.CANDIDATE, event.candidate, { to: self.id });
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
            self.pcEvent.emit("oniceconnectionstatechange", target.iceConnectionState);
            if (target.iceConnectionState === 'completed') {
                // setTimeout(() => {
                //     self.getStats();
                // }, 1000);
            }
            else if (target.iceConnectionState === 'connected') {
                self.createDataChannel("message");
                self.pc.ondatachannel = self.receiveChannelCallback.bind(self);
            }
            else if (target.iceConnectionState == "failed") {
                self.parentsEmitter.emit(index_1.AbstractPeerConnection.ON_ICE_CONNECTION_FAILED, self.pc);
                self.send_event(index_1.AbstractPeerConnection.CONNECTIVITY_ERROR, null, { to: self.id });
            }
            else if (target.iceConnectionState == "closed") {
                self.parentsEmitter.emit(index_1.AbstractPeerConnection.ON_ICE_CONNECTION_CLOSED);
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
            self.parentsEmitter.emit(index_1.AbstractPeerConnection.PEER_STREAM_ADDED, peer);
        };
        this.pc.onremovestream = function (peer) {
            if (self.debug)
                console.log('onremovestream');
            self.parentsEmitter.emit(index_1.AbstractPeerConnection.PEER_STREAM_REMOVED, peer.stream);
        };
        this.pc.addStream(stream);
        self.parentsEmitter.emit(index_1.AbstractPeerConnection.CREATED_PEER, self);
    };
    Peer.prototype.getStats = function () {
        var self = this;
        var peer = this.pcPeers[Object.keys(this.pcPeers)[0]];
        var pc = peer.pc;
        if (pc.getRemoteStreams()[0] && pc.getRemoteStreams()[0].getAudioTracks()[0]) {
            var track = pc.getRemoteStreams()[0].getAudioTracks()[0];
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
        if (message.type === index_1.AbstractPeerConnection.OFFER) {
            if (!this.nick)
                this.nick = message.payload.nick;
            delete message.payload.nick;
            self.pc.setRemoteDescription(new RTCSessionDescription(message.payload), function () {
                if (self.debug)
                    console.log("setRemoteDescription complete");
                if (self.pc.remoteDescription.type == index_1.AbstractPeerConnection.OFFER) {
                    self.createAnswer(message);
                }
            }, self.onSetSessionDescriptionError);
        }
        else if (message.type === index_1.AbstractPeerConnection.ANSWER) {
            // @ No need this.
        }
        else if (message.type === index_1.AbstractPeerConnection.CANDIDATE) {
            if (!message.candidate)
                return;
            function onAddIceCandidateSuccess() {
                if (self.debug)
                    console.log('addIceCandidate success');
            }
            function onAddIceCandidateError(error) {
                console.warn('failed to add ICE Candidate: ' + error.toString());
            }
            self.pc.addIceCandidate(new RTCIceCandidate(message.candidate), onAddIceCandidateSuccess, onAddIceCandidateError);
        }
        else if (message.type === index_1.AbstractPeerConnection.CONNECTIVITY_ERROR) {
            this.parentsEmitter.emit(index_1.AbstractPeerConnection.CONNECTIVITY_ERROR, self.pc);
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
        if (data.type === index_1.AbstractPeerConnection.UNPAUSE) {
            remoteVideoElement.srcObject = this.pc.getRemoteStreams()[0];
        }
        else if (data.type === index_1.AbstractPeerConnection.PAUSE) {
            remoteAudioElement.srcObject = this.pc.getRemoteStreams()[0];
            VideoToBlurImage_1.getImage(remoteVideoElement).then(function (res) {
                console.warn('getImage', res);
                remoteVideoElement.srcObject = res;
            });
        }
        else if (data.type === index_1.AbstractPeerConnection.DUMMY_VIDEO) {
            var canvasStream = StreamHelper_1.createStreamByText("NO CAMERA");
            if (!!canvasStream)
                remoteVideoElement.srcObject = canvasStream;
        }
    };
    return Peer;
}(index_1.AbstractPeer.BasePeer));
exports.Peer = Peer;
