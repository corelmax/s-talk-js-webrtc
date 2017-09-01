"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var util = require('util');
var webrtcSupport = require('webrtcsupport');
var PeerConnection = require('rtcpeerconnection');
var WildEmitter = require('wildemitter');
var FileTransfer = require('filetransfer');
// the inband-v1 protocol is sending metadata inband in a serialized JSON object
// followed by the actual data. Receiver closes the datachannel upon completion
var INBAND_FILETRANSFER_V1 = 'https://simplewebrtc.com/protocol/filetransfer#inband-v1';
function isAllTracksEnded(stream) {
    var isAllTracksEnded = true;
    stream.getTracks().forEach(function (t) {
        isAllTracksEnded = t.readyState === 'ended' && isAllTracksEnded;
    });
    return isAllTracksEnded;
}
var Peer = (function (_super) {
    __extends(Peer, _super);
    function Peer(options) {
        var _this = _super.call(this) || this;
        var self = _this;
        // call emitter constructor
        WildEmitter.call(_this);
        _this.id = options.id;
        _this.parent = options.parent;
        _this.type = options.type || 'video';
        _this.oneway = options.oneway || false;
        _this.sharemyscreen = options.sharemyscreen || false;
        _this.browserPrefix = options.prefix;
        _this.stream = options.stream;
        _this.enableDataChannels = options.enableDataChannels === undefined ? _this.parent.config.enableDataChannels : options.enableDataChannels;
        _this.receiveMedia = options.receiveMedia || _this.parent.config.receiveMedia;
        _this.channels = {};
        _this.sid = options.sid || Date.now().toString();
        // Create an RTCPeerConnection via the polyfill
        _this.pc = new PeerConnection(_this.parent.config.peerConnectionConfig, _this.parent.config.peerConnectionConstraints);
        _this.pc.on('ice', _this.onIceCandidate.bind(_this));
        _this.pc.on('endOfCandidates', function (event) {
            self.send('endOfCandidates', event);
        });
        _this.pc.on('offer', function (offer) {
            if (self.parent.config.nick)
                offer.nick = self.parent.config.nick;
            self.send('offer', offer);
        });
        _this.pc.on('answer', function (answer) {
            if (self.parent.config.nick)
                answer.nick = self.parent.config.nick;
            self.send('answer', answer);
        });
        _this.pc.on('addStream', _this.handleRemoteStreamAdded.bind(_this));
        _this.pc.on('addChannel', _this.handleDataChannelAdded.bind(_this));
        _this.pc.on('removeStream', _this.handleStreamRemoved.bind(_this));
        // Just fire negotiation needed events for now
        // When browser re-negotiation handling seems to work
        // we can use this as the trigger for starting the offer/answer process
        // automatically. We'll just leave it be for now while this stabalizes.
        _this.pc.on('negotiationNeeded', _this.emit.bind(_this, 'negotiationNeeded'));
        _this.pc.on('iceConnectionStateChange', _this.emit.bind(_this, 'iceConnectionStateChange'));
        _this.pc.on('iceConnectionStateChange', function () {
            switch (self.pc.iceConnectionState) {
                case 'failed':
                    // currently, in chrome only the initiator goes to failed
                    // so we need to signal this to the peer
                    if (self.pc.pc.localDescription.type === 'offer') {
                        self.parent.emit('iceFailed', self);
                        self.send('connectivityError');
                    }
                    break;
            }
        });
        _this.pc.on('signalingStateChange', _this.emit.bind(_this, 'signalingStateChange'));
        _this.logger = _this.parent.logger;
        // handle screensharing/broadcast mode
        if (options.type === 'screen') {
            if (_this.parent.localScreens && _this.parent.localScreens[0] && _this.sharemyscreen) {
                _this.logger.log('adding local screen stream to peer connection');
                _this.pc.addStream(_this.parent.localScreens[0]);
                _this.broadcaster = options.broadcaster;
            }
        }
        else {
            _this.parent.localStreams.forEach(function (stream) {
                console.log('addStream');
                self.pc.addStream(stream);
            });
        }
        _this.on('channelOpen', function (channel) {
            if (channel.protocol === INBAND_FILETRANSFER_V1) {
                channel.onmessage = function (event) {
                    var metadata = JSON.parse(event.data);
                    var receiver = new FileTransfer.Receiver();
                    receiver.receive(metadata, channel);
                    self.emit('fileTransfer', metadata, receiver);
                    receiver.on('receivedFile', function (file, metadata) {
                        receiver.channel.close();
                    });
                };
            }
        });
        // proxy events to parent
        _this.on('*', function () {
            self.parent.emit.apply(self.parent, arguments);
        });
        return _this;
    }
    Peer.prototype.handleMessage = function (message) {
        var self = this;
        this.logger.log('getting', message.type, message);
        if (message.prefix)
            this.browserPrefix = message.prefix;
        if (message.type === 'offer') {
            if (!this.nick)
                this.nick = message.payload.nick;
            delete message.payload.nick;
            this.pc.handleOffer(message.payload, function (err) {
                if (err) {
                    return;
                }
                // auto-accept
                self.pc.answer(function (err, sessionDescription) {
                    //self.send('answer', sessionDescription);
                });
            });
        }
        else if (message.type === 'answer') {
            if (!this.nick)
                this.nick = message.payload.nick;
            delete message.payload.nick;
            this.pc.handleAnswer(message.payload);
        }
        else if (message.type === 'candidate') {
            this.pc.processIce(message.payload);
        }
        else if (message.type === 'connectivityError') {
            this.parent.emit('connectivityError', self);
        }
        else if (message.type === 'mute') {
            this.parent.emit('mute', { id: message.from, name: message.payload.name });
        }
        else if (message.type === 'unmute') {
            this.parent.emit('unmute', { id: message.from, name: message.payload.name });
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
    ;
    // send via signalling channel
    Peer.prototype.send = function (messageType, payload) {
        var message = {
            to: this.id,
            sid: this.sid,
            broadcaster: this.broadcaster,
            roomType: this.type,
            type: messageType,
            payload: payload,
            prefix: webrtcSupport.prefix
        };
        this.logger.log('sending', messageType, message);
        this.parent.emit('message', message);
    };
    ;
    // send via data channel
    // returns true when message was sent and false if channel is not open
    Peer.prototype.sendDirectly = function (channel, messageType, payload) {
        var message = {
            type: messageType,
            payload: payload
        };
        this.logger.log('sending via datachannel', channel, messageType, message);
        var dc = this.getDataChannel(channel);
        if (dc.readyState != 'open')
            return false;
        dc.send(JSON.stringify(message));
        return true;
    };
    ;
    // Internal method registering handlers for a data channel and emitting events on the peer
    Peer.prototype._observeDataChannel = function (channel) {
        var self = this;
        channel.onclose = this.emit.bind(this, 'channelClose', channel);
        channel.onerror = this.emit.bind(this, 'channelError', channel);
        channel.onmessage = function (event) {
            self.emit('channelMessage', self, channel.label, JSON.parse(event.data), channel, event);
        };
        channel.onopen = this.emit.bind(this, 'channelOpen', channel);
    };
    ;
    // Fetch or create a data channel by the given name
    Peer.prototype.getDataChannel = function (name, opts) {
        if (!webrtcSupport.supportDataChannel)
            return this.emit('error', new Error('createDataChannel not supported'));
        var channel = this.channels[name];
        opts || (opts = {});
        if (channel)
            return channel;
        // if we don't have one by this label, create it
        channel = this.channels[name] = this.pc.createDataChannel(name, opts);
        this._observeDataChannel(channel);
        return channel;
    };
    ;
    Peer.prototype.onIceCandidate = function (candidate) {
        var self = this;
        if (this.closed)
            return;
        if (candidate) {
            var pcConfig = this.parent.config.peerConnectionConfig;
            if (webrtcSupport.prefix === 'moz' && pcConfig && pcConfig.iceTransports &&
                candidate.candidate && candidate.candidate.candidate &&
                candidate.candidate.candidate.indexOf(pcConfig.iceTransports) < 0) {
                this.logger.log('Ignoring ice candidate not matching pcConfig iceTransports type: ', pcConfig.iceTransports);
            }
            else {
                self.send('candidate', candidate);
            }
        }
        else {
            this.logger.log("End of candidates.");
        }
    };
    ;
    Peer.prototype.start = function () {
        var self = this;
        // well, the webrtc api requires that we either
        // a) create a datachannel a priori
        // b) do a renegotiation later to add the SCTP m-line
        // Let's do (a) first...
        if (this.enableDataChannels) {
            this.getDataChannel('simplewebrtc');
        }
        this.pc.offer(this.receiveMedia, function (err, sessionDescription) {
            //self.send('offer', sessionDescription);
        });
    };
    ;
    Peer.prototype.icerestart = function () {
        var constraints = this.receiveMedia;
        constraints.mandatory.IceRestart = true;
        this.pc.offer(constraints, function (err, success) { });
    };
    ;
    Peer.prototype.end = function () {
        if (this.closed)
            return;
        this.pc.close();
        this.handleStreamRemoved();
    };
    ;
    Peer.prototype.handleRemoteStreamAdded = function (event) {
        var self = this;
        if (this.stream) {
            this.logger.warn('Already have a remote stream');
        }
        else {
            this.stream = event.stream;
            this.stream.getTracks().forEach(function (track) {
                track.addEventListener('ended', function () {
                    if (isAllTracksEnded(self.stream)) {
                        self.end();
                    }
                });
            });
            this.parent.emit('peerStreamAdded', this);
        }
    };
    ;
    Peer.prototype.handleStreamRemoved = function () {
        var peerIndex = this.parent.peers.indexOf(this);
        if (peerIndex > -1) {
            this.parent.peers.splice(peerIndex, 1);
            this.closed = true;
            this.parent.emit('peerStreamRemoved', this);
        }
    };
    ;
    Peer.prototype.handleDataChannelAdded = function (channel) {
        this.channels[channel.label] = channel;
        this._observeDataChannel(channel);
    };
    ;
    Peer.prototype.sendFile = function (file) {
        var sender = new FileTransfer.Sender();
        var dc = this.getDataChannel('filetransfer' + (new Date()).getTime(), {
            protocol: INBAND_FILETRANSFER_V1
        });
        // override onopen
        dc.onopen = function () {
            dc.send(JSON.stringify({
                size: file.size,
                name: file.name
            }));
            sender.send(file, dc);
        };
        // override onclose
        dc.onclose = function () {
            console.log('sender received transfer');
            sender.emit('complete');
        };
        return sender;
    };
    ;
    return Peer;
}(WildEmitter));
// util.inherits(Peer, WildEmitter);
exports.default = Peer;
