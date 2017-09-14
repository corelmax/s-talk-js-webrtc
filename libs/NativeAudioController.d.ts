import { AudioController } from "../core/AbstractMediaStream";
export default class NativeAudioController implements AudioController {
    support: boolean;
    volume: number;
    gainFilter: GainNode;
    audioSource: AudioTrack;
    microphone: AudioNode;
    constructor(stream: any);
    mute(): void;
    unMute(): void;
    setVolume(volume: number): void;
    getVolume(): number;
    removeAudioStream(): void;
}
