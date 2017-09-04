/**
 * React,React-native webrtc peer implementation...
 *
 * Copyright 2017 Ahoo Studio.co.th.
 */
import 'webrtc-adapter';
import * as events from "events";
import * as io from 'socket.io-client';
import { withSendMessage, withExchange } from "./WebrtcSignaling";
export var AbstractWEBRTC;
(function (AbstractWEBRTC) {
    AbstractWEBRTC.ON_CONNECTION_READY = "connectionReady";
    AbstractWEBRTC.ON_CONNECTION_CLOSE = "ON_CONNECTION_CLOSE";
    AbstractWEBRTC.JOINED_ROOM = "joinedRoom";
    AbstractWEBRTC.JOIN_ROOM_ERROR = "joinRoomError";
    AbstractWEBRTC.NOT_SUPPORT_MEDIA = "NOT_SUPPORT_MEDIA";
    var BaseWebRTC = /** @class */ (function () {
        function BaseWebRTC(configs) {
            this.webrtcEvents = new events.EventEmitter();
            this.debug = false;
            var self = this;
            self.debug = configs.debug;
            self.iceConfig = configs.iceConfig;
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
            self.signalingSocket.on('reconnect', function (data) {
                console.log("SOCKET reconnect", data);
            });
            self.signalingSocket.on('reconnectAttempt', function (data) {
                console.log("SOCKET reconnectAttempt", data);
            });
            self.signalingSocket.on('error', function (data) {
                console.log("SOCKET error", data);
            });
            self.signalingSocket.on('*', function (data) {
                console.log("SOCKET ***", data);
            });
        }
        BaseWebRTC.prototype.join = function (roomname) {
            var self = this;
            this.signalingSocket.emit('join', roomname, function (err, roomDescription) {
                if (self.debug)
                    console.log('join', roomDescription);
                if (err) {
                    self.webrtcEvents.emit(AbstractWEBRTC.JOIN_ROOM_ERROR, err);
                }
                else {
                    var id = void 0, client = void 0, type = void 0, peer = void 0;
                    var clients = roomDescription.clients;
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
        };
        BaseWebRTC.prototype.leaveRoom = function () {
            if (this.roomName) {
                this.signalingSocket.emit('leave');
                this.roomName = "";
            }
        };
        ;
        // send via signalling channel
        BaseWebRTC.prototype.send = function (messageType, payload, optional) {
            withSendMessage(this)(messageType, payload, optional);
        };
        ;
        BaseWebRTC.prototype.onDisconnect = function (data) {
            if (this.debug)
                console.log("SOCKET disconnect", data);
            this.webrtcEvents.emit(AbstractWEBRTC.ON_CONNECTION_CLOSE, data);
            this.userMedia.stopLocalStream();
            if (this.peerManager && this.peerManager.peers.size > 0) {
                this.peerManager.peers.forEach(function (peer) { return peer.pcEvent.removeAllListeners(); });
            }
            delete this.peerManager;
            delete this.webrtcEvents;
            delete this.signalingSocket;
            delete this.userMedia;
        };
        BaseWebRTC.prototype.disconnect = function () {
            if (this.signalingSocket)
                this.signalingSocket.disconnect();
            if (this.userMedia)
                this.userMedia.stopLocalStream();
            if (this.peerManager && this.peerManager.peers.size > 0) {
                this.peerManager.peers.forEach(function (peer) { return peer.pcEvent.removeAllListeners(); });
            }
            delete this.peerManager;
            delete this.webrtcEvents;
            delete this.signalingSocket;
            delete this.userMedia;
        };
        ;
        return BaseWebRTC;
    }());
    AbstractWEBRTC.BaseWebRTC = BaseWebRTC;
})(AbstractWEBRTC || (AbstractWEBRTC = {}));
