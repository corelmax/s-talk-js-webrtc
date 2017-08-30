import { AbstractMediaStream } from "../IWebRTC";
export declare class AudioController implements AbstractMediaStream.AudioController {
    support: any;
    volume: any;
    gainFilter: any;
    audioSource: any;
    microphone: any;
    constructor(stream: any);
    setVolume(volume: any): void;
    getVolume(): any;
    mute(): void;
    unMute(): void;
    removeAudioStream(): void;
}
