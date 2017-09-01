/**
 * S-TAlK React-Native webrtc peer implementation...
 * 
 * Copyright 2017 Ahoo Studio.co.th.
 */

import { Platform } from 'react-native';
import { EventEmitter } from 'events';
import {
    RTCPeerConnection,
    RTCIceCandidate,
    RTCSessionDescription,
} from 'react-native-webrtc';

import { AbstractPeerConnection, IPC_Handler, PeerConstructor } from "../core/AbstractPeerConnection";
import { AbstractPeer } from "../core/AbstractPeer";

const configuration = { "iceServers": [{ "url": "stun:stun.l.google.com:19302" }] };

export class Peer extends AbstractPeer.BasePeer {
    /**
     * reture PeerConnection
     * @param socket 
     * @param stream 
     * @param options 
     */
    constructor(config: PeerConstructor) {
        super(config);

        this.initPeerConnection(config.stream);
    }

    initPeerConnection(stream: MediaStream) {
        let self = this;
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
        }

        this.pc.oniceconnectionstatechange = function (event) {
            let target = event.target as RTCPeerConnection;

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

        this.pc.onicegatheringstatechange = (event) => {
            let target = event.target as RTCPeerConnection;

            if (self.debug)
                console.log("onicegatheringstatechange", target.iceGatheringState);

            self.pcEvent.emit("onicegatheringstatechange", target.iceGatheringState);
        };

        this.pc.onsignalingstatechange = function (event) {
            let target = event.target as RTCPeerConnection;
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
    }

    getStats() {
        let self = this;
        const peer = this.pcPeers[Object.keys(this.pcPeers)[0]];
        const pc = peer.pc;

        if (pc.getRemoteStreams()[0] && pc.getRemoteStreams()[0].getAudioTracks()[0]) {
            const track = pc.getRemoteStreams()[0].getAudioTracks()[0];
            console.log('track', track);
            pc.getStats(track, function (report) {
                console.log('getStats report', report);
            }, self.logError);
        }
    }

    handleMessage(message) {
        let self = this;
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
            if (!message.candidate) return;

            self.pc.addIceCandidate(new RTCIceCandidate(message.candidate));
        }
        else if (message.type === AbstractPeerConnection.CONNECTIVITY_ERROR) {
            this.parentsEmitter.emit(AbstractPeerConnection.CONNECTIVITY_ERROR, self.pc);
        }
    };

    createDataChannel() {
        if (this.pc.textDataChannel) {
            return;
        }
        const dataChannel = this.pc.createDataChannel("text");

        dataChannel.onerror = function (error) {
            console.log("dataChannel.onerror", error);
        };

        dataChannel.onmessage = function (event) {
            console.log("dataChannel.onmessage:", event.data);
            let message = event.data;

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
    }
}