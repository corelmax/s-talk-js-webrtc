import { IUserMedia, AudioController, VideoController } from "../index";
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
    constructor(options: {
        debug: boolean;
    });
    startLocalStream(mediaConstraints: MediaStreamConstraints, isFront: boolean | undefined): Promise<MediaStream>;
    setVideoEnabled(enabled: boolean): void;
    stopLocalStream(): void;
    private stopStream();
}
