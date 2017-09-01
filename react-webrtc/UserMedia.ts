import 'webrtc-adapter';
import { AbstractMediaStream, IUserMedia } from "../index";
import { AudioController } from '../libs/AudioController';
import { VideoController } from '../libs/VideoController';

export class UserMedia implements IUserMedia {
    debug: boolean = false;
    private localStream: MediaStream;
    public getLocalStream() {
        return this.localStream;
    }
    public setLocalStream(stream) {
        this.localStream = stream;
    }
    public getVideoTrack() {
        if (!!this.localStream) {
            let videoTracks = this.localStream.getVideoTracks();
            if (videoTracks.length > 0) {
                return videoTracks[0];
            }
        }

        return null;
    }
    public getAudioTrack() {
        if (!!this.localStream) {
            let audioTracks = this.localStream.getAudioTracks();
            if (audioTracks.length > 0) {
                return audioTracks[0];
            }
        }

        return null;
    }

    audioController: AudioController;
    videoController: VideoController;

    constructor(options: { debug: boolean }) {
        this.debug = options.debug;
    }

    async  startLocalStream(mediaConstraints: MediaStreamConstraints) {
        let self = this;
        return new Promise((resolve: (stream: MediaStream) => void, reject) => {
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
                self.localStream = stream as MediaStream;

                resolve(self.localStream);
            }, error => {
                if (error.name === 'ConstraintNotSatisfiedError') {
                    reject('The resolution  is not supported by your device.');
                } else if (error.name === 'PermissionDeniedError') {
                    reject('Permissions have not been granted to use your camera and ' +
                        'microphone, you need to allow the page access to your devices in ' +
                        'order for the demo to work.');
                }
                else {
                    reject('getUserMedia error: ' + error.name);
                }
            });
        });
    }

    stopLocalStream() {
        this.stopStream();
        // this.stopScreenShare();
    }

    private stopStream() {
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