"use strict";
/**
 * React,React-native webrtc peer implementation...
 *
 * Copyright 2017 Ahoo Studio.co.th.
 */
Object.defineProperty(exports, "__esModule", { value: true });
var _1 = require("./");
var AbstractPeer;
(function (AbstractPeer) {
    var BasePeer = (function () {
        /**
         * reture PeerConnection
         * @param socket
         * @param stream
         * @param options
         */
        function BasePeer(config) {
            this.enableDataChannels = true;
            this.logError = function (error) {
                console.log(error);
            };
            if (!config.stream) {
                throw new Error("Missing stream!!!");
            }
            this.debug = config.debug;
            this.id = config.peer_id;
            this.pcPeers = config.pcPeers;
            this.parentsEmitter = config.emitter;
            this.send_event = config.sendHandler;
            this.offer = config.offer;
        }
        BasePeer.prototype.initPeerConnection = function (stream) { };
        BasePeer.prototype.removeStream = function (stream) {
            this.pc.removeStream(stream);
        };
        BasePeer.prototype.addStream = function (stream) {
            this.pc.addStream(stream);
        };
        BasePeer.prototype.onSetSessionDescriptionError = function (error) {
            console.warn('Failed to set session description: ' + error.toString());
        };
        BasePeer.prototype.onCreateSessionDescriptionError = function (error) {
            console.warn('Failed to create session description: ' + error.toString());
        };
        BasePeer.prototype.createOffer = function () {
            var self = this;
            this.pc.createOffer(function (desc) {
                if (self.debug)
                    console.log('createOffer Success');
                self.pc.setLocalDescription(desc, function () {
                    if (self.debug)
                        console.log('setLocalDescription Success');
                    self.send_event(_1.AbstractPeerConnection.OFFER, self.pc.localDescription, { to: self.id });
                }, self.onSetSessionDescriptionError);
            }, self.onCreateSessionDescriptionError);
        };
        BasePeer.prototype.createAnswer = function (message) {
            var self = this;
            self.pc.createAnswer(function (desc) {
                if (self.debug)
                    console.log('createAnswer Success');
                self.pc.setLocalDescription(desc, function () {
                    if (self.debug)
                        console.log('setLocalDescription Success');
                    self.send_event(_1.AbstractPeerConnection.OFFER, self.pc.localDescription, { to: message.from });
                }, self.onSetSessionDescriptionError);
            }, self.onCreateSessionDescriptionError);
        };
        BasePeer.prototype.handleMessage = function (message) { };
        return BasePeer;
    }());
    AbstractPeer.BasePeer = BasePeer;
})(AbstractPeer = exports.AbstractPeer || (exports.AbstractPeer = {}));
