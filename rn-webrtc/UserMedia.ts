/**
 * UserMedia.
 *
 * Copyright 2017 Ahoo Studio.co.th.
 */
import { Platform } from 'react-native';
import {
    RTCPeerConnection,
    RTCMediaStream,
    RTCIceCandidate,
    RTCSessionDescription,
    RTCView,
    MediaStreamTrack,
    getUserMedia,
} from 'react-native-webrtc';
import { AbstractMediaStream } from "../index";


export class UserMedia implements AbstractMediaStream.IUserMedia {
    debug: boolean = false;
    private localStream: MediaStream;
    public getLocalStream() {
        return this.localStream;
    }
    public setLocalStream(stream: MediaStream) {
        this.localStream = stream;
    }
    public getVideoTrack() {
        let videoTracks = this.localStream.getVideoTracks();
        if (videoTracks.length > 0) {
            // console.log('Using video device: ' + videoTracks[0].label);
            return videoTracks[0].label;
        }

        return "";
    }
    public getAudioTrack() {
        let audioTracks = this.localStream.getAudioTracks();
        if (audioTracks.length > 0) {
            // console.log('Using audio device: ' + audioTracks[0].label);
            return audioTracks[0].label;
        }

        return "";
    }

    micController;
    audioController: AbstractMediaStream.AudioController;
    videoController: AbstractMediaStream.VideoController;

    constructor(options: { debug: boolean }) {
        this.debug = options.debug;
    }

    async  startLocalStream(mediaConstraints: MediaStreamConstraints, isFront: boolean | undefined) {
        let self = this;
        let videoSourceId;
        let defaultMediaConstraints = {
            audio: true,
            video: {
                mandatory: {
                    minWidth: 640, // Provide your own width, height and frame rate here
                    minHeight: 360,
                    minFrameRate: 30,
                }
            }
        };

        // on android, you don't have to specify sourceId manually, just use facingMode
        // uncomment it if you want to specify
        if (Platform.OS === 'ios') {
            if (mediaConstraints.video) {
                try {
                    videoSourceId = await new Promise((resolve, reject) => {
                        MediaStreamTrack.getSources(sourceInfos => {
                            // console.log("sourceInfos: ", sourceInfos);

                            for (var i = 0; i < sourceInfos.length; i++) {
                                const sourceInfo = sourceInfos[i];
                                if (sourceInfo.kind == "video" && sourceInfo.facing == (isFront ? "front" : "back")) {
                                    videoSourceId = sourceInfo.id;

                                    resolve(videoSourceId);
                                }
                            }
                        });
                    });
                }
                catch (ex) {
                    console.warn("Platform", ex);
                }
            }
        }

        if (mediaConstraints.video != false) {
            defaultMediaConstraints = {
                ...mediaConstraints,
                facingMode: (isFront ? "user" : "environment"),
                optional: (videoSourceId ? [{ sourceId: videoSourceId }] : [])
            };
        }
        else {
            defaultMediaConstraints = { ...mediaConstraints };
        }

        return new Promise((resolve: (stream: MediaStream) => void, reject) => {
            getUserMedia(defaultMediaConstraints, function (stream) {
                console.log('getUserMedia success');

                let videoTracks = stream.getVideoTracks();
                let audioTracks = stream.getAudioTracks();
                if (videoTracks.length > 0) {
                    console.log('Using video device: ' + videoTracks[0].label);
                }
                if (audioTracks.length > 0) {
                    console.log('Using audio device: ' + audioTracks[0].label);
                }

                stream.oninactive = function () {
                    console.log('Stream inactive');
                };
                stream.onactive = () => {
                    console.log('Local Stream active');
                };

                self.localStream = stream as MediaStream;

                resolve(self.localStream);
            }, error => {
                console.warn(error);
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

    setVideoEnabled(enabled: boolean) {
        if (!!this.localStream) {
            let videoTracks = this.localStream.getVideoTracks();
            if (!!videoTracks && videoTracks.length > 0) {
                videoTracks.forEach(function (track) {
                    track.enabled = !!enabled;
                });
            }
        }
    }

    stopLocalStream() {
        this.stopStream();
        // this.stopScreenShare();
    }

    private stopStream() {
        let self = this;
        if (!self.localStream) return;

        let tracks = this.localStream.getTracks();
        tracks.forEach(function (track) {
            track.stop();
        });
        // this.micController.removeAudioStream();
    }
}