"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
require("webrtc-adapter");
var AudioController_1 = require("../libs/AudioController");
var VideoController_1 = require("../libs/VideoController");
var UserMedia = (function () {
    function UserMedia(options) {
        this.debug = false;
        this.debug = options.debug;
    }
    UserMedia.prototype.getLocalStream = function () {
        return this.localStream;
    };
    UserMedia.prototype.setLocalStream = function (stream) {
        this.localStream = stream;
    };
    UserMedia.prototype.getVideoTrack = function () {
        if (!!this.localStream) {
            var videoTracks = this.localStream.getVideoTracks();
            if (videoTracks.length > 0) {
                return videoTracks[0];
            }
        }
        return null;
    };
    UserMedia.prototype.getAudioTrack = function () {
        if (!!this.localStream) {
            var audioTracks = this.localStream.getAudioTracks();
            if (audioTracks.length > 0) {
                return audioTracks[0];
            }
        }
        return null;
    };
    UserMedia.prototype.startLocalStream = function (mediaConstraints) {
        return __awaiter(this, void 0, void 0, function () {
            var self;
            return __generator(this, function (_a) {
                self = this;
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        navigator.mediaDevices.getUserMedia(mediaConstraints).then(function (stream) {
                            stream.oninactive = function () {
                                if (self.debug) {
                                    console.log('Stream inactive');
                                }
                            };
                            stream.onactive = function () {
                                if (self.debug)
                                    console.log('Local Stream active');
                            };
                            if (stream.getAudioTracks().length > 0) {
                                self.audioController = new AudioController_1.AudioController(stream);
                            }
                            if (stream.getVideoTracks().length > 0) {
                                self.videoController = new VideoController_1.VideoController(stream);
                            }
                            self.localStream = stream;
                            resolve(self.localStream);
                        }, function (error) {
                            if (error.name === 'ConstraintNotSatisfiedError') {
                                reject('The resolution  is not supported by your device.');
                            }
                            else if (error.name === 'PermissionDeniedError') {
                                reject('Permissions have not been granted to use your camera and ' +
                                    'microphone, you need to allow the page access to your devices in ' +
                                    'order for the demo to work.');
                            }
                            else {
                                reject('getUserMedia error: ' + error.name);
                            }
                        });
                    })];
            });
        });
    };
    UserMedia.prototype.stopLocalStream = function () {
        this.stopStream();
        // this.stopScreenShare();
    };
    UserMedia.prototype.stopStream = function () {
        var self = this;
        if (!!this.localStream) {
            var tracks = this.localStream.getTracks();
            tracks.forEach(function (track) {
                track.stop();
            });
        }
        if (!!this.audioController) {
            this.audioController.removeAudioStream();
        }
    };
    return UserMedia;
}());
exports.UserMedia = UserMedia;
