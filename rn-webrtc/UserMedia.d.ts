import { AbstractMediaStream } from "../index";
export declare class UserMedia implements AbstractMediaStream.IUserMedia {
    debug: boolean;
    private localStream;
    getLocalStream(): MediaStream;
    setLocalStream(stream: MediaStream): void;
    getVideoTrack(): string;
    getAudioTrack(): string;
    micController: any;
    audioController: AbstractMediaStream.AudioController;
    videoController: AbstractMediaStream.VideoController;
    constructor(options: {
        debug: boolean;
    });
    startLocalStream(mediaConstraints: MediaStreamConstraints, isFront: boolean | undefined): Promise<MediaStream>;
    setVideoEnabled(enabled: boolean): void;
    stopLocalStream(): void;
    private stopStream();
}
