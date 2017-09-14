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
            // const twilioIceServers = [
            //     { url: 'stun:global.stun.twilio.com:3478?transport=udp' }
            // ];
            // configuration.iceServers = twilioIceServers;
            this.configuration = {
                iceServers: [
                    {
                        urls: ["stun:stun.l.google.com:19302",
                            'stun:stun1.l.google.com:19302',
                            'stun:stun2.l.google.com:19302',
                            'stun:stun3.l.google.com:19302',
                            'stun:stun4.l.google.com:19302']
                    },
                ]
            };
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
            this.restartIce = this.restartIce.bind(this);
            this.onCreateOfferSuccess = this.onCreateOfferSuccess.bind(this);
        }
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
        // Simulate an ice restart.
        BasePeer.prototype.restartIce = function () {
            var self = this;
            if (self.debug)
                console.log('pc createOffer restart');
            self.offer = true;
            var offerOptions = { iceRestart: true };
            self.pc.createOffer(self.onCreateOfferSuccess, self.onCreateSessionDescriptionError, offerOptions);
        };
        BasePeer.prototype.onCreateOfferSuccess = function (desc) {
            var self = this;
            if (self.debug)
                console.log('createOffer Success');
            self.pc.setLocalDescription(desc, function () {
                if (self.debug)
                    console.log('setLocalDescription Success');
                // Waiting for all ice. and then send offer.
            }, self.onSetSessionDescriptionError);
        };
        BasePeer.prototype.createOffer = function () {
            var self = this;
            this.pc.createOffer(self.onCreateOfferSuccess, self.onCreateSessionDescriptionError);
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
