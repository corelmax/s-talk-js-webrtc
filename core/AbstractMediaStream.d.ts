/**
 * WebRtc Modules.
 *
 * Copyright 2017 Ahoo Studio.co.th.
 */
export declare namespace AbstractMediaStream {
    const fullHdConstraints: MediaStreamConstraints;
    const hdConstraints: MediaStreamConstraints;
    const vgaConstraints: MediaStreamConstraints;
    const qvgaConstraints: MediaStreamConstraints;
}
export interface IUserMedia {
    debug: boolean;
    audioController: AudioController;
    videoController: VideoController;
    getLocalStream(): MediaStream;
    setLocalStream(stream: MediaStream): any;
    getVideoTrack(): MediaStreamTrack | null;
    getAudioTrack(): MediaStreamTrack | null;
    startLocalStream(mediaContraints: MediaStreamConstraints, isFront?: false): Promise<MediaStream>;
    stopLocalStream(): any;
}
export interface AudioController {
    support: boolean;
    volume: number;
    gainFilter: GainNode;
    audioSource: AudioTrack;
    microphone: AudioNode;
    mute(): any;
    unMute(): any;
    setVolume(volume: number): any;
    getVolume(): any;
    removeAudioStream(): any;
}
export interface VideoController {
    localStream: MediaStream;
    videoSource: VideoTrack;
    setVideoEnabled(enabled: boolean): any;
}
