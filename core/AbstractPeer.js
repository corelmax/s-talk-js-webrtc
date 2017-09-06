/**
 * React,React-native webrtc peer implementation...
 *
 * Copyright 2017 Ahoo Studio.co.th.
 */
import { AbstractPeerConnection } from "./AbstractPeerConnection";
export var AbstractPeer;
(function (AbstractPeer) {
    var BasePeer = /** @class */ (function () {
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
        BasePeer.prototype.initPeerConnection = function (stream, iceConfig) { };
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
            this.pc.createOffer(function (offer) {
                if (self.debug)
                    console.log('createOffer Success');
                self.pc.setLocalDescription(offer, function () {
                    if (self.debug)
                        console.log('setLocalDescription Success');
                    // Waiting for all ice. and then send offer.
                }, self.onSetSessionDescriptionError);
            }, self.onCreateSessionDescriptionError, { iceRestart: true });
        };
        BasePeer.prototype.createAnswer = function (message) {
            var self = this;
            self.pc.createAnswer(function (answer) {
                if (self.debug)
                    console.log('createAnswer Success');
                self.pc.setLocalDescription(answer, function () {
                    if (self.debug)
                        console.log('setLocalDescription Success');
                    self.pcEvent.emit(AbstractPeerConnection.PeerEvent, "createAnswer Success");
                    self.send_event(AbstractPeerConnection.ANSWER, self.pc.localDescription, { to: message.from });
                }, self.onSetSessionDescriptionError);
            }, self.onCreateSessionDescriptionError);
        };
        BasePeer.prototype.sendOffer = function () {
            var self = this;
            if (!self.offer)
                return;
            self.offer = false;
            self.pcEvent.emit(AbstractPeerConnection.PeerEvent, "createOffer Success");
            self.send_event(AbstractPeerConnection.OFFER, self.pc.localDescription, { to: self.id });
        };
        BasePeer.prototype.handleMessage = function (message) { };
        return BasePeer;
    }());
    AbstractPeer.BasePeer = BasePeer;
})(AbstractPeer || (AbstractPeer = {}));
