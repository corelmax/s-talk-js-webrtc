"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// const RTCSessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription || window.webkitRTCSessionDescription || window.msRTCSessionDescription;
// const RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection || window.msRTCPeerConnection;
require("webrtc-adapter");
var io = require("socket.io-client");
var events = require("events");
var index_1 = require("../index");
var PeerManager_1 = require("./PeerManager");
var UserMedia_1 = require("./UserMedia");
function hasGetUserMedia() {
    return !!(navigator.getUserMedia || navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia || navigator.msGetUserMedia);
}
exports.hasGetUserMedia = hasGetUserMedia;
var WebRTC = (function () {
    function WebRTC(configs) {
        this.webrtcEvents = new events.EventEmitter();
        this.debug = false;
        var self = this;
        self.debug = configs.debug;
        if (!hasGetUserMedia()) {
            alert('getUserMedia() is not supported in your browser');
            console.warn('Your browser does not support local media capture.');
            self.webrtcEvents.emit(index_1.AbstractWEBRTC.NOT_SUPPORT_MEDIA);
            return;
        }
        this.signalingSocket = io.connect(configs.signalingUrl, configs.socketOptions);
        this.send = this.send.bind(this);
        this.onDisconnect = this.onDisconnect.bind(this);
        this.peerManager = new PeerManager_1.PeerManager({ debug: self.debug });
        this.userMedia = new UserMedia_1.UserMedia({ debug: self.debug });
        self.signalingSocket.on('connect', function (data) {
            if (self.debug)
                console.log("SOCKET connect", self.signalingSocket.id);
            self.webrtcEvents.emit(index_1.AbstractWEBRTC.ON_CONNECTION_READY, self.signalingSocket.id);
        });
        self.signalingSocket.on('message', function (data) {
            index_1.withExchange(self)(data);
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
    // send via signalling channel
    WebRTC.prototype.send = function (messageType, payload, optional) {
        index_1.withSendMessage(this)(messageType, payload, optional);
    };
    ;
    WebRTC.prototype.join = function (roomname) {
        var self = this;
        this.signalingSocket.emit('join', roomname, function (err, roomDescription) {
            if (self.debug)
                console.log('join', roomDescription);
            if (err) {
                self.webrtcEvents.emit(index_1.AbstractWEBRTC.JOIN_ROOM_ERROR, err);
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
            self.webrtcEvents.emit(index_1.AbstractWEBRTC.JOINED_ROOM, roomname);
        });
    };
    WebRTC.prototype.leaveRoom = function () {
        if (this.roomName) {
            this.signalingSocket.emit('leave');
            this.roomName = "";
        }
    };
    ;
    WebRTC.prototype.disconnect = function () {
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
    WebRTC.prototype.onDisconnect = function (data) {
        if (this.debug)
            console.log("SOCKET disconnect", data);
        this.webrtcEvents.emit(index_1.AbstractWEBRTC.ON_CONNECTION_CLOSE, data);
        this.userMedia.stopLocalStream();
        if (this.peerManager && this.peerManager.peers.size > 0) {
            this.peerManager.peers.forEach(function (peer) { return peer.pcEvent.removeAllListeners(); });
        }
        delete this.peerManager;
        delete this.webrtcEvents;
        delete this.signalingSocket;
        delete this.userMedia;
    };
    return WebRTC;
}());
exports.WebRTC = WebRTC;