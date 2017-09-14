var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
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
/**
 * UserMedia.
 *
 * Copyright 2017 Ahoo Studio.co.th.
 */
import { Platform } from 'react-native';
import { MediaStreamTrack, getUserMedia, } from 'react-native-webrtc';
import NativeVolumeController from '../libs/native/NativeVolumeController';
var UserMedia = /** @class */ (function () {
    function UserMedia(options) {
        this.debug = false;
        this.debug = options.debug;
        this.volumeController = new NativeVolumeController(this.applyStreamIncomeVolume.bind(this));
    }
    UserMedia.prototype.getLocalStream = function () {
        return this.localStream;
    };
    UserMedia.prototype.setLocalStream = function (stream) {
        this.localStream = stream;
    };
    UserMedia.prototype.getVideoTrack = function () {
        var videoTracks = this.localStream.getVideoTracks();
        if (videoTracks.length > 0) {
            return videoTracks[0];
        }
        return null;
    };
    UserMedia.prototype.getAudioTrack = function () {
        var audioTracks = this.localStream.getAudioTracks();
        if (audioTracks.length > 0) {
            return audioTracks[0];
        }
        return null;
    };
    UserMedia.prototype.startLocalStream = function (mediaConstraints, isFront) {
        return __awaiter(this, void 0, void 0, function () {
            var self, videoSourceId, defaultMediaConstraints, ex_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        self = this;
                        defaultMediaConstraints = {
                            audio: true,
                            video: {
                                mandatory: {
                                    minWidth: 640,
                                    minHeight: 360,
                                    minFrameRate: 30,
                                }
                            }
                        };
                        if (!(Platform.OS === 'ios')) return [3 /*break*/, 4];
                        if (!mediaConstraints.video) return [3 /*break*/, 4];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, new Promise(function (resolve, reject) {
                                MediaStreamTrack.getSources(function (sourceInfos) {
                                    // console.log("sourceInfos: ", sourceInfos);
                                    for (var i = 0; i < sourceInfos.length; i++) {
                                        var sourceInfo = sourceInfos[i];
                                        if (sourceInfo.kind == "video" && sourceInfo.facing == (isFront ? "front" : "back")) {
                                            videoSourceId = sourceInfo.id;
                                            resolve(videoSourceId);
                                        }
                                    }
                                });
                            })];
                    case 2:
                        videoSourceId = _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        ex_1 = _a.sent();
                        console.warn("Platform", ex_1);
                        return [3 /*break*/, 4];
                    case 4:
                        if (mediaConstraints.video != false) {
                            defaultMediaConstraints = __assign({}, mediaConstraints, { video: __assign({}, mediaConstraints.video, { facingMode: (isFront ? "user" : "environment"), optional: (videoSourceId ? [{ sourceId: videoSourceId }] : []) }) });
                        }
                        else {
                            defaultMediaConstraints = __assign({}, mediaConstraints);
                        }
                        return [2 /*return*/, new Promise(function (resolve, reject) {
                                getUserMedia(defaultMediaConstraints, function (stream) {
                                    console.log('getUserMedia success');
                                    self.setLocalStream(stream);
                                    var videoTracks = stream.getVideoTracks();
                                    var audioTracks = stream.getAudioTracks();
                                    if (videoTracks.length > 0) {
                                        console.log('Using video device: ' + videoTracks[0].label);
                                    }
                                    if (audioTracks.length > 0) {
                                        console.log('Using audio device: ' + audioTracks[0].label);
                                        self.applyVolumeToAudioTrack(audioTracks[0]);
                                    }
                                    stream.oninactive = function () {
                                        console.log('Stream inactive');
                                    };
                                    stream.onactive = function () {
                                        console.log('Local Stream active');
                                    };
                                    self.localStream = stream;
                                    resolve(self.localStream);
                                }, function (error) {
                                    console.warn(error);
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
                }
            });
        });
    };
    UserMedia.prototype.applyStreamIncomeVolume = function (volume) {
        var audioTrack = this.getAudioTrack();
        if (audioTrack == undefined)
            return;
        this.applyVolumeToAudioTrack(audioTrack);
    };
    UserMedia.prototype.applyVolumeToAudioTrack = function (audioTrack) {
        if (audioTrack === void 0) { audioTrack = undefined; }
        console.log("[Pre] apply volume to audio track");
        if (audioTrack == undefined)
            return;
        var curVolume = this.volumeController.getVolume();
        var constraints = audioTrack.getConstraints();
        var advSets = constraints.advanced;
        for (var i = 0; i < advSets.length; i++) {
            var set = advSets[i];
            set.volume = curVolume;
        }
        audioTrack.applyConstraints(constraints).then(function (res) {
            console.log("[Done] apply volume to audio track: ", res);
        });
    };
    UserMedia.prototype.setVideoEnabled = function (enabled) {
        if (!!this.localStream) {
            var videoTracks = this.localStream.getVideoTracks();
            if (!!videoTracks && videoTracks.length > 0) {
                videoTracks.forEach(function (track) {
                    track.enabled = !!enabled;
                });
            }
        }
    };
    UserMedia.prototype.stopLocalStream = function () {
        this.stopStream();
        // this.stopScreenShare();
    };
    UserMedia.prototype.stopStream = function () {
        var self = this;
        if (!self.localStream)
            return;
        var tracks = this.localStream.getTracks();
        tracks.forEach(function (track) {
            track.stop();
        });
        // this.micController.removeAudioStream();
    };
    return UserMedia;
}());
export { UserMedia };
