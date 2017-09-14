import RNVolume from 'react-native-volume';
var NativeVolumeController = /** @class */ (function () {
    function NativeVolumeController(onVolumeChangedCallback) {
        if (onVolumeChangedCallback === void 0) { onVolumeChangedCallback = undefined; }
        /**
         * Volume of running device, must apply only when onVolumeChanged callback;
         */
        this.volume = 0;
        this.onVolumeChangedCallback = undefined;
        this.isMute = false;
        this.onVolumeChangedCallback = onVolumeChangedCallback;
        RNVolume.getVolume(this.getVolumnCallback.bind(this));
        RNVolume.onVolumeChange(this.onVolumeChanged.bind(this));
        this.debuglog("Created object.");
    }
    /**
     * Set the volume to zero.
     */
    NativeVolumeController.prototype.mute = function () {
        RNVolume.setVolume(0);
        this.isMute = true;
        this.debuglog("mute is called");
    };
    /**
     * Set volume to the original volume before mute.
     */
    NativeVolumeController.prototype.unMute = function () {
        this.isMute = false;
        RNVolume.setVolume(this.volume);
        this.debuglog("unMute is called");
    };
    /**
     * Set device volume.
     * @param volume
     */
    NativeVolumeController.prototype.setVolume = function (volume) {
        RNVolume.setVolume(this.volume);
    };
    /**
     * Get device volume.
     */
    NativeVolumeController.prototype.getVolume = function () {
        return this.volume;
    };
    /**
     * Get device volume callback when call getVolume
     * @param volume
     */
    NativeVolumeController.prototype.getVolumnCallback = function (volume) {
        this.debuglog("Get device volume: ", volume);
        this.volume = volume;
    };
    /**
     * Callback when the device volume is changed.
     * @param volume
     */
    NativeVolumeController.prototype.onVolumeChanged = function (volume) {
        this.volume = volume;
        if (this.onVolumeChangedCallback) {
            this.onVolumeChangedCallback(volume);
        }
        this.debuglog("Volume was change to: ", volume);
    };
    NativeVolumeController.prototype.debuglog = function () {
        var msg = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            msg[_i] = arguments[_i];
        }
        console.log("[NativeAudioController] > ", msg.join(" "));
    };
    return NativeVolumeController;
}());
export default NativeVolumeController;
