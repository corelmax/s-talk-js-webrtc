/**
 * React-Native webrtc interface.
 *
 * Copyright 2017 Ahoo Studio.co.th.
 */

import * as events from 'events';
import * as io from 'socket.io-client';
import {
    RTCPeerConnection,
    RTCMediaStream,
    RTCIceCandidate,
    RTCSessionDescription,
    RTCView,
    MediaStreamTrack,
    getUserMedia,
} from 'react-native-webrtc';

import { AbstractWEBRTC, IWebRTC, WebRtcConfig } from "../index";
import { withExchange, withSendMessage } from "../core/WebrtcSignaling";
import * as Peer from "./Peer";
import { PeerManager } from "./PeerManager";
import { UserMedia } from "./UserMedia";

export function logError(error) {
    console.log("logError", error);
}

export class WebRTC implements IWebRTC {
    signalingSocket: SocketIOClient.Socket; //{ transports: ['websocket'] }
    webrtcEvents: events.EventEmitter;
    roomName: string;
    peerManager: PeerManager;
    userMedia: UserMedia;
    debug: boolean = false;

    constructor(configs: WebRtcConfig) {
        let self = this;
        self.debug = configs.debug;

        this.signalingSocket = io.connect(configs.signalingUrl, configs.socketOptions);
        // this.signalingSocket = io.connect('https://chitchats.ga:8888', { transports: ['websocket'], 'force new connection': true });

        this.webrtcEvents = new events.EventEmitter();
        this.send = this.send.bind(this);
        this.onDisconnect = this.onDisconnect.bind(this);

        this.peerManager = new PeerManager({ debug: self.debug });
        this.userMedia = new UserMedia({ debug: self.debug });

        self.signalingSocket.on('connect', function (data) {
            if (self.debug)
                console.log("SOCKET connect", self.signalingSocket.id);

            self.webrtcEvents.emit(AbstractWEBRTC.ON_CONNECTION_READY, self.signalingSocket.id);
        });
        self.signalingSocket.on('message', function (data) {
            withExchange(self)(data);
        });
        self.signalingSocket.on('remove', function (room) {
            if (self.debug)
                console.log("SOCKET remove", room, self.signalingSocket.id);

            if (room.id !== self.signalingSocket.id) {
                self.peerManager.removePeers(room.id, self);
            }
        });
        self.signalingSocket.on('leave', function (socketId) {
            if (self.debug)
                console.log("SOCKET leave", socketId);

            self.peerManager.removePeers(socketId, self);
        });
        self.signalingSocket.on('disconnect', this.onDisconnect);
        self.signalingSocket.on('reconnect', (data) => {
            console.log("SOCKET reconnect", data);
        });
        self.signalingSocket.on('reconnectAttempt', (data) => {
            console.log("SOCKET reconnectAttempt", data);
        });
        self.signalingSocket.on('error', (data) => {
            console.log("SOCKET error", data);
        });
        self.signalingSocket.on('*', function (data) {
            console.log("SOCKET ***", data);
        });
    }

    // send via signalling channel
    send(messageType: string, payload?, optional?: { to: string }) {
        withSendMessage(this)(messageType, payload, optional);
    };

    join(roomname: string) {
        let self = this;
        this.signalingSocket.emit('join', roomname, function (err, roomDescription) {
            console.log('join', roomDescription);
            if (err) {
                self.webrtcEvents.emit(AbstractWEBRTC.JOIN_ROOM_ERROR, err);
            }
            else {
                let id, client, type, peer;
                let clients = roomDescription.clients;
                for (id in clients) {
                    console.log("id", id);
                    if (clients.hasOwnProperty(id)) {
                        client = clients[id];
                        for (type in client) {
                            if (client[type]) {
                                peer = self.peerManager.createPeer({
                                    id: id,
                                    type: type,
                                    offer: true
                                }, self);
                            }
                        }
                    }
                }
            }

            self.roomName = roomname;
            self.webrtcEvents.emit(AbstractWEBRTC.JOINED_ROOM, roomname);
        });
    }

    leaveRoom() {
        if (this.roomName) {
            this.signalingSocket.emit('leave');
            this.roomName = "";
        }
    };

    disconnect() {
        if (this.signalingSocket)
            this.signalingSocket.disconnect();
        if (this.userMedia)
            this.userMedia.stopLocalStream();
        if (this.peerManager && this.peerManager.peers.size > 0) {
            this.peerManager.peers.forEach(peer => peer.pcEvent.removeAllListeners());
        }
        delete this.peerManager;
        delete this.webrtcEvents;
        delete this.signalingSocket;
        delete this.userMedia;
    };

    onDisconnect(data) {
        if (this.debug)
            console.log("SOCKET disconnect", data);

        this.webrtcEvents.emit(AbstractWEBRTC.ON_CONNECTION_CLOSE, data);
        this.userMedia.stopLocalStream();
        if (this.peerManager && this.peerManager.peers.size > 0) {
            this.peerManager.peers.forEach(peer => peer.pcEvent.removeAllListeners());
        }
        delete this.peerManager;
        delete this.webrtcEvents;
        delete this.signalingSocket;
        delete this.userMedia;
    }
}