import RNVolume from 'react-native-volume';
export default class NativeVolumeController{
        /**
         * Volume of running device, must apply only when onVolumeChanged callback;
         */
        private volume = 0;
        isMute = false;
        constructor(){
                console.log("getVolume is ",RNVolume.getVolume);
                console.log("setVolume is ",RNVolume.setVolume);
                console.log("onVolumeChange is ",RNVolume.onVolumeChange);
                RNVolume.getVolume(this.getVolumnCallback.bind(this));
                this.debuglog("Created object.");
        }
        /**
         * Set the volume to zero.
         */
        mute() {
                RNVolume.setVolume(0);
                this.isMute = true;
                this.debuglog("mute is called");
        }
        /**
         * Set volume to the original volume before mute.
         */
        unMute() {
                this.isMute = false;
                RNVolume.setVolume(this.volume);
                this.debuglog("unMute is called");
        }
        /**
         * Set device volume.
         * @param volume 
         */
        setVolume(volume: number) {
                RNVolume.setVolume(this.volume);
        }
        /**
         * Get device volume.
         */
        getVolume() {
                return this.volume;
        }
        /**
         * Get device volume callback when call getVolume
         * @param volume 
         */
        private getVolumnCallback(volume) {
                this.debuglog("Get device volume: ", volume);
                this.volume = volume;
        }
        /**
         * Callback when the device volume is changed.
         * @param volume 
         */
        protected onVolumeChanged(volume){
                this.volume = volume;
        }

        private debuglog(...msg){
                console.log("[NativeAudioController] > ", msg);
        }
}