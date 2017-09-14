import { AudioController } from "../core/AbstractMediaStream";
export default class NativeAudioController implements AudioController{
        support: boolean;
        volume: number;
        gainFilter: GainNode;
        audioSource: AudioTrack;
        microphone: AudioNode;
        constructor(stream){
                this.support = false;
                this.volume = 1;
                this.gainFilter = null;
                this.audioSource = null;
                this.microphone = null;
                console.log("NativeAudioController was created.");
        }
        mute() {
                this.volume  = 0;
                console.warn("NativeAudioController.mute is not implement yet.")
                //throw new Error("Method not implemented.");
        }
        unMute() {
                this.volume  = 1;
                console.warn("NativeAudioController.mute is not implement yet.")
                //throw new Error("Method not implemented.");
        }
        setVolume(volume: number) {
                this.volume  = volume;
                console.warn("NativeAudioController.mute is not implement yet.")
                //throw new Error("Method not implemented.");
        }
        getVolume() {
                console.warn("NativeAudioController.mute is not implement yet.")
                return this.volume;
                //throw new Error("Method not implemented.");
        }
        removeAudioStream() {
                //throw new Error("Method not implemented.");
        }

}