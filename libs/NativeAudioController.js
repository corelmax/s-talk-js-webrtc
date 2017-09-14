var NativeAudioController = /** @class */ (function () {
    function NativeAudioController(stream) {
        this.support = false;
        this.volume = 1;
        this.gainFilter = null;
        this.audioSource = null;
        this.microphone = null;
        console.log("NativeAudioController was created.");
    }
    NativeAudioController.prototype.mute = function () {
        this.volume = 0;
        console.warn("NativeAudioController.mute is not implement yet.");
        //throw new Error("Method not implemented.");
    };
    NativeAudioController.prototype.unMute = function () {
        this.volume = 1;
        console.warn("NativeAudioController.mute is not implement yet.");
        //throw new Error("Method not implemented.");
    };
    NativeAudioController.prototype.setVolume = function (volume) {
        this.volume = volume;
        console.warn("NativeAudioController.mute is not implement yet.");
        //throw new Error("Method not implemented.");
    };
    NativeAudioController.prototype.getVolume = function () {
        console.warn("NativeAudioController.mute is not implement yet.");
        return this.volume;
        //throw new Error("Method not implemented.");
    };
    NativeAudioController.prototype.removeAudioStream = function () {
        //throw new Error("Method not implemented.");
    };
    return NativeAudioController;
}());
export default NativeAudioController;
