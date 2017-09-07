/**
 * React,React-native webrtc peer implementation...
 * 
 * Copyright 2017 Ahoo Studio.co.th.
 */
import 'webrtc-adapter';
import * as events from "events";
import * as io from 'socket.io-client';

import { IWebRTC, WebRtcConfig } from "./IWebRTC";
import { AbstractPeerConnection, IPC_Estabished } from "./AbstractPeerConnection";
import { IUserMedia } from "./AbstractMediaStream";
import { withSendMessage, withExchange } from "./WebrtcSignaling";

export namespace AbstractWEBRTC {
    export const ON_CONNECTION_READY = "connectionReady";
    export const ON_CONNECTION_CLOSE = "ON_CONNECTION_CLOSE";
    export const JOINED_ROOM = "joinedRoom"
    export const JOIN_ROOM_ERROR = "joinRoomError";
    export const NOT_SUPPORT_MEDIA = "NOT_SUPPORT_MEDIA";

    export abstract class BaseWebRTC implements IWebRTC {
        signalingSocket: SocketIOClient.Socket;  //{ transports: ['websocket'] }
        webrtcEvents = new events.EventEmitter();
        roomName: string;
        peerManager: IPC_Estabished;
        userMedia: IUserMedia;
        debug: boolean = false;
        iceConfig: RTCConfiguration;

        constructor(configs: WebRtcConfig) {
            let self = this;
            self.debug = configs.debug;
            self.iceConfig = { iceServers: [] };

            // this.signalingSocket = io.connect('https://chitchats.ga:8888', { transports: ['websocket'], 'force new connection': true });
            this.signalingSocket = io.connect(configs.signalingUrl, configs.socketOptions);
            this.send = this.send.bind(this);
            this.onDisconnect = this.onDisconnect.bind(this);

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
            self.signalingSocket.on('stunservers', function (data) {
                if (self.debug)
                    console.log("stunservers", data);
                self.iceConfig.iceServers[0] = data[0];
            });
            self.signalingSocket.on('turnservers', function (data) {
                if (self.debug)
                    console.log("turnservers", data);
                self.iceConfig.iceServers[1] = data[0];
            });
        }

        join(roomname: string) {
            let self = this;
            this.signalingSocket.emit('join', roomname, function (err, roomDescription) {
                if (self.debug)
                    console.log('join', roomDescription);

                if (err) {
                    self.webrtcEvents.emit(AbstractWEBRTC.JOIN_ROOM_ERROR, err);
                }
                else {
                    let id, client, type, peer;
                    let clients = roomDescription.clients;
                    for (id in clients) {
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

        // send via signalling channel
        send(messageType: string, payload, optional: { to: string }) {
            withSendMessage(this)(messageType, payload, optional);
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
    }
}
