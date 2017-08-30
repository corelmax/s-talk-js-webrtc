/**
 * React-Native webrtc peer implementation...
 * 
 * Copyright 2017 Ahoo Studio.co.th.
 */

import { Platform } from 'react-native';
import * as events from 'events';
import {
    RTCPeerConnection,
    RTCIceCandidate,
    RTCSessionDescription,
} from 'react-native-webrtc';

import { AbstractPeerConnection } from "../index";

const configuration = { "iceServers": [{ "url": "stun:stun.l.google.com:19302" }] };

export class Peer implements AbstractPeerConnection.IPC_Handler {
    debug: boolean;
    type: string;
    parentsEmitter: events.EventEmitter;
    id: string;
    pc: RTCPeerConnection;
    receiveChannel;
    channels = {};
    pcPeers;
    browserPrefix;
    nick;

    send_event: (messageType: string, payload?: any, optional?: { to: string }) => void;
    logError: (error) => void;

    /**
     * reture PeerConnection
     * @param socket 
     * @param stream 
     * @param options 
     */
    constructor(parents: AbstractPeerConnection.PeerConstructor) {
        this.id = parents.peer_id;
        this.pcPeers = parents.pcPeers;
        this.parentsEmitter = parents.emitter;
        this.send_event = parents.sendHandler;
        this.pc = new RTCPeerConnection(configuration);
        this.debug = parents.debug;
        let self = this;
        const isOffer = parents.offer;

        this.pc.onicecandidate = function (event) {
            if (!!event.candidate) {
                self.send_event(AbstractPeerConnection.CANDIDATE, event.candidate, { to: self.id });
            }
        };

        this.pc.onnegotiationneeded = function () {
            if (isOffer) {
                self.createOffer();
            }
        }

        this.pc.oniceconnectionstatechange = function (event) {
            if (self.debug)
                console.log('oniceconnectionstatechange', event.target.iceConnectionState);

            if (event.target.iceConnectionState === 'completed') {
                // setTimeout(() => {
                //     self.getStats();
                // }, 1000);
            }
            if (event.target.iceConnectionState === 'connected') {
                self.createDataChannel();
            }
            else if (event.target.iceConnectionState == "failed") {
                self.parentsEmitter.emit(AbstractPeerConnection.ON_ICE_CONNECTION_FAILED, self.pc);
                self.send_event(AbstractPeerConnection.CONNECTIVITY_ERROR, null, { to: self.id });
            }
        };
        this.pc.onsignalingstatechange = function (event) {
            if (self.debug)
                console.log('onsignalingstatechange', event.target.signalingState);
        };
        this.pc.onaddstream = function (peer) {
            if (self.debug)
                console.log('onaddstream', peer.stream);

            self.parentsEmitter.emit(AbstractPeerConnection.PEER_STREAM_ADDED, peer);
        };
        this.pc.onremovestream = function (peer) {
            if (self.debug)
                console.log('onremovestream');

            self.parentsEmitter.emit(AbstractPeerConnection.PEER_STREAM_REMOVED, peer.stream);
        };

        this.pc.addStream(parents.stream);
    }

    removeStream(stream: MediaStream) {
        this.pc.removeStream(stream);
    }

    addStream(stream: MediaStream) {
        this.pc.addStream(stream);
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

    onSetSessionDescriptionError(error) {
        console.log('Failed to set session description: ' + error.toString());
    }
    onCreateSessionDescriptionError(error) {
        console.log('Failed to create session description: ' + error.toString());
    }

    createOffer() {
        let self = this;

        this.pc.createOffer(function (desc) {
            if (self.debug)
                console.log('createOffer', desc);

            self.pc.setLocalDescription(desc, function () {
                if (self.debug)
                    console.log('setLocalDescription', self.pc.localDescription);

                self.send_event(AbstractPeerConnection.OFFER, self.pc.localDescription, { to: self.id });
            },
                self.onSetSessionDescriptionError);
        },
            self.onCreateSessionDescriptionError);
    }
    createAnswer(message) {
        let self = this;
        self.pc.createAnswer(function (desc) {
            if (self.debug)
                console.log('createAnswer', desc);

            self.pc.setLocalDescription(desc, function () {
                if (self.debug)
                    console.log('setLocalDescription', self.pc.localDescription);

                self.send_event(AbstractPeerConnection.OFFER, self.pc.localDescription, { to: message.from });
            }, self.onSetSessionDescriptionError);
        }, self.onCreateSessionDescriptionError);
    }

    handleMessage(message) {
        let self = this;
        if (self.debug)
            console.log('handleMessage', message.type, message);

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
            if (self.debug)
                console.log('exchange candidate');
            if (!message.candidate) return;

            function onAddIceCandidateSuccess() {
                if (self.debug)
                    console.log('addIceCandidate success');
            }

            function onAddIceCandidateError(error) {
                console.warn('failed to add ICE Candidate: ' + error.toString());
            }
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