import 'webrtc-adapter';
import { AbstractMediaStream } from "../index";
import { AudioController } from '../libs/AudioController';
import { VideoController } from '../libs/VideoController';
export declare class UserMedia implements AbstractMediaStream.IUserMedia {
    debug: boolean;
    private localStream;
    getLocalStream(): MediaStream;
    setLocalStream(stream: any): void;
    getVideoTrack(): MediaStreamTrack;
    getAudioTrack(): MediaStreamTrack;
    audioController: AudioController;
    videoController: VideoController;
    constructor(options: {
        debug: boolean;
    });
    startLocalStream(mediaConstraints: MediaStreamConstraints): Promise<MediaStream>;
    stopLocalStream(): void;
    private stopStream();
}
