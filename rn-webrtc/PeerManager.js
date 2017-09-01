"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * React-Native webrtc interface.
 *
 * Copyright 2017 Ahoo Studio.co.th.
 */
var index_1 = require("../index");
var Peer_1 = require("./Peer");
var WebRTC_1 = require("./WebRTC");
var PeerManager = (function () {
    function PeerManager(options) {
        this.debug = false;
        this.peers = new Map();
        this.debug = options.debug;
        this.createPeer = this.createPeer.bind(this);
    }
    PeerManager.prototype.createPeer = function (options, webrtc) {
        var self = this;
        var config = {
            peer_id: options.id,
            offer: options.offer,
            pcPeers: this.peers,
            stream: webrtc.userMedia.getLocalStream(),
            emitter: webrtc.webrtcEvents,
            sendHandler: webrtc.send,
            debug: self.debug
        };
        var peer = new Peer_1.Peer(config);
        peer.logError = WebRTC_1.logError;
        this.peers.set(options.id, peer);
        return peer;
    };
    PeerManager.prototype.getPeers = function (sessionId) {
        if (sessionId) {
            return this.peers.get(sessionId);
        }
        else {
            return this.peers;
        }
    };
    ;
    PeerManager.prototype.removePeers = function (sessionId, webrtc) {
        var peer = this.getPeers(sessionId);
        if (peer) {
            peer.pc.close();
            webrtc.webrtcEvents.emit(index_1.AbstractPeerConnection.PEER_STREAM_REMOVED, peer.stream);
        }
        this.peers.delete(sessionId);
    };
    ;
    /**
     * sends message to all
     * use signalling message.
     *
     * @param {any} message
     * @param {any} payload
     * @memberof PeerManager
     */
    PeerManager.prototype.sendToAll = function (message, payload) {
        this.peers.forEach(function (peer) {
            peer.send_event(message, payload, { to: peer.id });
        });
    };
    ;
    // sends message to all using a datachannel
    // only sends to anyone who has an open datachannel
    PeerManager.prototype.sendDirectlyToAll = function (channel, message, payload) {
        this.peers.forEach(function (peer) {
            // if (peer.enableDataChannels) {
            // peer.sendDirectly(channel, message, payload);
            // }
        });
    };
    ;
    return PeerManager;
}());
exports.PeerManager = PeerManager;
