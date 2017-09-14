import { MediaStreamConstraints } from 'react-native-webrtc';
import { IUserMedia, AudioController, VideoController } from "../index";
import NativeVolumeController from '../libs/native/NativeVolumeController';
export declare class UserMedia implements IUserMedia {
    debug: boolean;
    private localStream;
    getLocalStream(): MediaStream;
    setLocalStream(stream: MediaStream): void;
    getVideoTrack(): MediaStreamTrack;
    getAudioTrack(): MediaStreamTrack;
    micController: any;
    audioController: AudioController;
    videoController: VideoController;
    volumeController: NativeVolumeController;
    constructor(options: {
        debug: boolean;
    });
    startLocalStream(mediaConstraints: MediaStreamConstraints, isFront: boolean | undefined): Promise<MediaStream>;
    applyStreamIncomeVolume(volume: any): void;
    applyVolumeToAudioTrack(audioTrack?: any): void;
    setVideoEnabled(enabled: boolean): void;
    stopLocalStream(): void;
    private stopStream();
}
