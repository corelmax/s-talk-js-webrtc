/**
 * WebRtc Modules.
 *
 * Copyright 2017 Ahoo Studio.co.th.
 */

export namespace AbstractMediaStream {
    export const fullHdConstraints = {
        video: { width: { exact: 1920 }, height: { exact: 1080 } }
    } as MediaStreamConstraints;

    export const hdConstraints = {
        video: {
            mandatory: {
                minWidth: 1280,
                minHeight: 720
            }
        }
    } as MediaStreamConstraints;

    export const vgaConstraints = {
        video: {
            mandatory: {
                maxWidth: 640,
                maxHeight: 360
            }
        }
    } as MediaStreamConstraints;

    export const qvgaConstraints = {
        video: {
            mandatory: {
                maxWidth: 320,
                maxHeight: 240
            }
        }
    } as MediaStreamConstraints;
}

export interface IUserMedia {
    debug: boolean;
    audioController: AudioController;
    videoController: VideoController;
    getLocalStream(): MediaStream;
    setLocalStream(stream: MediaStream);
    getVideoTrack(): MediaStreamTrack | null;
    getAudioTrack(): MediaStreamTrack | null;

    startLocalStream(mediaContraints: MediaStreamConstraints, isFront?: false): Promise<MediaStream>;
    stopLocalStream();
}

export interface AudioController {
    //@ about mic-gainController in browser.
    support: boolean;
    volume: number;
    gainFilter: GainNode;
    audioSource: AudioTrack;
    microphone: AudioNode;
    mute();
    unMute();
    setVolume(volume: number);
    getVolume();
    removeAudioStream();
}

export interface VideoController {
    //@ about video stream in browser.
    localStream: MediaStream;
    videoSource: VideoTrack;
    setVideoEnabled(enabled: boolean);
}