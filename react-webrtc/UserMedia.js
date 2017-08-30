var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import 'webrtc-adapter';
import { AudioController } from '../libs/AudioController';
import { VideoController } from '../libs/VideoController';
export class UserMedia {
    constructor(options) {
        this.debug = false;
        this.debug = options.debug;
    }
    getLocalStream() {
        return this.localStream;
    }
    setLocalStream(stream) {
        this.localStream = stream;
    }
    getVideoTrack() {
        if (!!this.localStream) {
            let videoTracks = this.localStream.getVideoTracks();
            if (videoTracks.length > 0) {
                return videoTracks[0];
            }
        }
        return null;
    }
    getAudioTrack() {
        if (!!this.localStream) {
            let audioTracks = this.localStream.getAudioTracks();
            if (audioTracks.length > 0) {
                return audioTracks[0];
            }
        }
        return null;
    }
    startLocalStream(mediaConstraints) {
        return __awaiter(this, void 0, void 0, function* () {
            let self = this;
            return new Promise((resolve, reject) => {
                navigator.mediaDevices.getUserMedia(mediaConstraints).then(function (stream) {
                    stream.oninactive = function () {
                        if (self.debug) {
                            console.log('Stream inactive');
                        }
                    };
                    stream.onactive = () => {
                        if (self.debug)
                            console.log('Local Stream active');
                    };
                    if (stream.getAudioTracks().length > 0) {
                        self.audioController = new AudioController(stream);
                    }
                    if (stream.getVideoTracks().length > 0) {
                        self.videoController = new VideoController(stream);
                    }
                    self.localStream = stream;
                    resolve(self.localStream);
                }, error => {
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
            });
        });
    }
    stopLocalStream() {
        this.stopStream();
        // this.stopScreenShare();
    }
    stopStream() {
        let self = this;
        if (!!this.localStream) {
            let tracks = this.localStream.getTracks();
            tracks.forEach(function (track) {
                track.stop();
            });
        }
        if (!!this.audioController) {
            this.audioController.removeAudioStream();
        }
    }
}
