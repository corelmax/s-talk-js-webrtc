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
import WebRTC from './webrtc';
import SocketIoConnection from './socketioconnection';
var WildEmitter = require('wildemitter');
var webrtcSupport = require('webrtcsupport');
var attachMediaStream = require('attachmediastream');
var mockconsole = require('mockconsole');
var SimpleWebRTC = /** @class */ (function (_super) {
    __extends(SimpleWebRTC, _super);
    function SimpleWebRTC(opts) {
        var _this = _super.call(this) || this;
        _this.testReadiness = function () {
            var self = this;
            if (this.sessionReady) {
                if (!this.config.media.video && !this.config.media.audio) {
                    self.emit('readyToCall', self.connection.getSessionid());
                }
                else if (this.webrtc.localStreams.length > 0) {
                    self.emit('readyToCall', self.connection.getSessionid());
                }
                else {
                    self.emit('readyToCall', self.connection.getSessionid());
                }
            }
        };
        _this.handlePeerStreamAdded = function (peer) {
            var self = this;
            var container = this.getRemoteVideoContainer();
            var video = attachMediaStream(peer.stream);
            // store video element as part of peer for easy removal
            peer.videoEl = video;
            video.id = this.getDomId(peer);
            if (container)
                container.appendChild(video);
            this.emit('videoAdded', video, peer);
            // send our mute status to new peer if we're muted
            // currently called with a small delay because it arrives before
            // the video element is created otherwise (which happens after
            // the async setRemoteDescription-createAnswer)
            window.setTimeout(function () {
                if (!self.webrtc.isAudioEnabled()) {
                    peer.send('mute', { name: 'audio' });
                }
                if (!self.webrtc.isVideoEnabled()) {
                    peer.send('mute', { name: 'video' });
                }
            }, 250);
        };
        _this.getEl = function (idOrEl) {
            if (typeof idOrEl === 'string') {
                return document.getElementById(idOrEl);
            }
            else {
                return idOrEl;
            }
        };
        _this.leaveRoom = function () {
            if (this.roomName) {
                this.connection.emit('leave');
                while (this.webrtc.peers.length) {
                    this.webrtc.peers[0].end();
                }
                if (this.getLocalScreen()) {
                    this.stopScreenShare();
                }
                this.emit('leftRoom', this.roomName);
                this.roomName = undefined;
            }
        };
        _this.disconnect = function () {
            this.connection.disconnect();
            delete this.connection;
        };
        _this.handlePeerStreamRemoved = function (peer) {
            var container = this.getRemoteVideoContainer();
            var videoEl = peer.videoEl;
            if (this.config.autoRemoveVideos && container && videoEl) {
                container.removeChild(videoEl);
            }
            if (videoEl)
                this.emit('videoRemoved', videoEl, peer);
        };
        _this.getDomId = function (peer) {
            return [peer.id, peer.type, peer.broadcaster ? 'broadcasting' : 'incoming'].join('_');
        };
        // set volume on video tag for all peers takse a value between 0 and 1
        _this.setVolumeForAll = function (volume) {
            this.webrtc.peers.forEach(function (peer) {
                if (peer.videoEl)
                    peer.videoEl.volume = volume;
            });
        };
        _this.joinRoom = function (name, cb) {
            var self = this;
            this.roomName = name;
            this.connection.emit('join', name, function (err, roomDescription) {
                console.log('join CB', err, roomDescription);
                if (err) {
                    self.emit('error', err);
                }
                else if (Object.keys(roomDescription.clients).length === 0) {
                    // alert("roomDescription clients empty");
                    self.emit('error', "roomDescription clients empty");
                }
                else {
                    var id = void 0, client = void 0, type = void 0, peer = void 0;
                    for (id in roomDescription.clients) {
                        client = roomDescription.clients[id];
                        for (type in client) {
                            if (client[type]) {
                                peer = self.webrtc.createPeer({
                                    id: id,
                                    type: type,
                                    enableDataChannels: self.config.enableDataChannels && type !== 'screen',
                                    receiveMedia: {
                                        offerToReceiveAudio: type !== 'screen' && self.config.receiveMedia.offerToReceiveAudio ? 1 : 0,
                                        offerToReceiveVideo: self.config.receiveMedia.offerToReceiveVideo
                                    }
                                });
                                self.emit('createdPeer', peer);
                                peer.start();
                            }
                        }
                    }
                }
                if (cb)
                    cb(err, roomDescription);
                self.emit('joinedRoom', name);
            });
        };
        _this.startLocalVideo = function () {
            var self = this;
            this.webrtc.start(this.config.media, function (err, stream) {
                if (err) {
                    self.emit('localMediaError', err);
                    self.config.localVideoEl.style.background = 'black';
                }
                else {
                    attachMediaStream(stream, self.getLocalVideoContainer(), self.config.localVideo);
                }
            });
        };
        _this.stopLocalVideo = function () {
            this.webrtc.stop();
        };
        // this accepts either element ID or element
        // and either the video tag itself or a container
        // that will be used to put the video tag into.
        _this.getLocalVideoContainer = function () {
            var el = this.getEl(this.config.localVideoEl);
            if (el && el.tagName === 'VIDEO') {
                el.oncontextmenu = function () { return false; };
                return el;
            }
            else if (el) {
                var video = document.createElement('video');
                video.oncontextmenu = function () { return false; };
                el.appendChild(video);
                return video;
            }
            else {
                return;
            }
        };
        _this.getRemoteVideoContainer = function () {
            return this.getEl(this.config.remoteVideosEl);
        };
        _this.shareScreen = function (cb) {
            this.webrtc.startScreenShare(cb);
        };
        _this.getLocalScreen = function () {
            return this.webrtc.localScreens && this.webrtc.localScreens[0];
        };
        _this.stopScreenShare = function () {
            this.connection.emit('unshareScreen');
            var videoEl = document.getElementById('localScreen');
            var container = this.getRemoteVideoContainer();
            if (this.config.autoRemoveVideos && container && videoEl) {
                container.removeChild(videoEl);
            }
            // a hack to emit the event the removes the video
            // element that we want
            if (videoEl) {
                this.emit('videoRemoved', videoEl);
            }
            if (this.getLocalScreen()) {
                this.webrtc.stopScreenShare();
            }
            this.webrtc.peers.forEach(function (peer) {
                if (peer.broadcaster) {
                    peer.end();
                }
            });
        };
        _this.createRoom = function (name, cb) {
            this.roomName = name;
            if (arguments.length === 2) {
                this.connection.emit('create', name, cb);
            }
            else {
                this.connection.emit('create', name);
            }
        };
        _this.sendFile = function () {
            if (!webrtcSupport.dataChannel) {
                return this.emit('error', new Error('DataChannelNotSupported'));
            }
        };
        var self = _this;
        var options = opts || {};
        var config = _this.config = {
            url: 'https://sandbox.simplewebrtc.com:443/',
            socketio: {},
            connection: null,
            debug: false,
            localVideoEl: '',
            remoteVideosEl: '',
            enableDataChannels: true,
            autoRequestMedia: false,
            autoRemoveVideos: true,
            adjustPeerVolume: false,
            peerVolumeWhenSpeaking: 0.25,
            media: {
                video: true,
                audio: true
            },
            receiveMedia: {
                offerToReceiveAudio: 1,
                offerToReceiveVideo: 1
            },
            localVideo: {
                autoplay: true,
                mirror: true,
                muted: true
            }
        };
        var item;
        var connection;
        // We also allow a 'logger' option. It can be any object that implements
        // log, warn, and error methods.
        // We log nothing by default, following "the rule of silence":
        // http://www.linfo.org/rule_of_silence.html
        _this.logger = function () {
            // we assume that if you're in debug mode and you didn't
            // pass in a logger, you actually want to log as much as
            // possible.
            if (opts.debug) {
                return opts.logger || console;
            }
            else {
                // or we'll use your logger which should have its own logic
                // for output. Or we'll return the no-op.
                return opts.logger || mockconsole;
            }
        }();
        // set our config from options
        for (item in options) {
            if (options.hasOwnProperty(item)) {
                _this.config[item] = options[item];
            }
        }
        // attach detected support for convenience
        _this.capabilities = webrtcSupport;
        // call WildEmitter constructor
        WildEmitter.call(_this);
        // create default SocketIoConnection if it's not passed in
        if (_this.config.connection === null) {
            connection = _this.connection = new SocketIoConnection(_this.config);
        }
        else {
            connection = _this.connection = _this.config.connection;
        }
        connection.on('connect', function () {
            console.log("connection connect", connection.getSessionid());
            self.emit('connectionReady', connection.getSessionid());
            self.sessionReady = true;
            self.testReadiness();
        });
        connection.on('message', function (message) {
            var peers = self.webrtc.getPeers(message.from, message.roomType);
            var peer;
            if (message.type === 'offer') {
                if (peers.length) {
                    peers.forEach(function (p) {
                        if (p.sid == message.sid)
                            peer = p;
                    });
                    //if (!peer) peer = peers[0]; // fallback for old protocol versions
                }
                if (!peer) {
                    peer = self.webrtc.createPeer({
                        id: message.from,
                        sid: message.sid,
                        type: message.roomType,
                        enableDataChannels: self.config.enableDataChannels && message.roomType !== 'screen',
                        sharemyscreen: message.roomType === 'screen' && !message.broadcaster,
                        broadcaster: message.roomType === 'screen' && !message.broadcaster ? self.connection.getSessionid() : null
                    });
                    self.emit('createdPeer', peer);
                }
                peer.handleMessage(message);
            }
            else if (peers.length) {
                peers.forEach(function (peer) {
                    if (message.sid) {
                        if (peer.sid === message.sid) {
                            peer.handleMessage(message);
                        }
                    }
                    else {
                        peer.handleMessage(message);
                    }
                });
            }
        });
        connection.on('remove', function (room) {
            console.log("connection remove", room);
            if (room.id !== self.connection.getSessionid()) {
                self.webrtc.removePeers(room.id, room.type);
            }
        });
        // instantiate our main WebRTC helper
        // using same logger from logic here
        opts.logger = _this.logger;
        opts.debug = false;
        _this.webrtc = new WebRTC(opts);
        // attach a few methods from underlying lib to simple.
        ['mute', 'unmute', 'pauseVideo', 'resumeVideo', 'pause', 'resume', 'sendToAll', 'sendDirectlyToAll', 'getPeers'].forEach(function (method) {
            self[method] = self.webrtc[method].bind(self.webrtc);
        });
        // proxy events from WebRTC
        _this.webrtc.on('*', function () {
            self.emit.apply(self, arguments);
        });
        // log all events in debug mode
        if (config.debug) {
            _this.on('*', _this.logger.log.bind(_this.logger, 'SimpleWebRTC event:'));
        }
        // check for readiness
        _this.webrtc.on('localStream', function () {
            self.testReadiness();
        });
        _this.webrtc.on('message', function (payload) {
            self.connection.emit('message', payload);
        });
        _this.webrtc.on('peerStreamAdded', _this.handlePeerStreamAdded.bind(_this));
        _this.webrtc.on('peerStreamRemoved', _this.handlePeerStreamRemoved.bind(_this));
        // echo cancellation attempts
        if (_this.config.adjustPeerVolume) {
            _this.webrtc.on('speaking', _this.setVolumeForAll.bind(_this, _this.config.peerVolumeWhenSpeaking));
            _this.webrtc.on('stoppedSpeaking', _this.setVolumeForAll.bind(_this, 1));
        }
        connection.on('stunservers', function (args) {
            console.log("connection stunservers", args);
            // resets/overrides the config
            self.webrtc.config.peerConnectionConfig.iceServers = args;
            self.emit('stunservers', args);
        });
        connection.on('turnservers', function (args) {
            console.log("connection turnservers", args);
            // appends to the config
            self.webrtc.config.peerConnectionConfig.iceServers = self.webrtc.config.peerConnectionConfig.iceServers.concat(args);
            self.emit('turnservers', args);
        });
        _this.webrtc.on('iceFailed', function (peer) {
            // local ice failure
        });
        _this.webrtc.on('connectivityError', function (peer) {
            // remote ice failure
        });
        // sending mute/unmute to all peers
        _this.webrtc.on('audioOn', function () {
            self.webrtc.sendToAll('unmute', { name: 'audio' });
        });
        _this.webrtc.on('audioOff', function () {
            self.webrtc.sendToAll('mute', { name: 'audio' });
        });
        _this.webrtc.on('videoOn', function () {
            self.webrtc.sendToAll('unmute', { name: 'video' });
        });
        _this.webrtc.on('videoOff', function () {
            self.webrtc.sendToAll('mute', { name: 'video' });
        });
        // screensharing events
        _this.webrtc.on('localScreen', function (stream) {
            var item, el = document.createElement('video'), container = self.getRemoteVideoContainer();
            el.oncontextmenu = function () { return false; };
            el.id = 'localScreen';
            attachMediaStream(stream, el);
            if (container) {
                container.appendChild(el);
            }
            self.emit('localScreenAdded', el);
            self.connection.emit('shareScreen');
            self.webrtc.peers.forEach(function (existingPeer) {
                var peer;
                if (existingPeer.type === 'video') {
                    peer = self.webrtc.createPeer({
                        id: existingPeer.id,
                        type: 'screen',
                        sharemyscreen: true,
                        enableDataChannels: false,
                        receiveMedia: {
                            offerToReceiveAudio: 0,
                            offerToReceiveVideo: 0
                        },
                        broadcaster: self.connection.getSessionid(),
                    });
                    self.emit('createdPeer', peer);
                    peer.start();
                }
            });
        });
        _this.webrtc.on('localScreenStopped', function (stream) {
            if (self.getLocalScreen()) {
                self.stopScreenShare();
            }
            /*
            self.connection.emit('unshareScreen');
            self.webrtc.peers.forEach(function (peer) {
                if (peer.sharemyscreen) {
                    peer.end();
                }
            });
            */
        });
        _this.webrtc.on('channelMessage', function (peer, label, data) {
            if (data.type == 'volume') {
                self.emit('remoteVolumeChange', peer, data.volume);
            }
        });
        if (_this.config.autoRequestMedia)
            _this.startLocalVideo();
        return _this;
    }
    return SimpleWebRTC;
}(WildEmitter));
SimpleWebRTC.prototype = Object.create(WildEmitter.prototype, {
    constructor: {
        value: SimpleWebRTC
    }
});
export default SimpleWebRTC;
