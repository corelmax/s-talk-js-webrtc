import { getVolume,  setVolume, onVolumeChange } from 'react-native-volume';
export default class NativeVolumeController{
        /**
         * Volume of running device, must apply only when onVolumeChanged callback;
         */
        private volume = 0;
        isMute = false;
        constructor(){
                getVolume(this.getVolumnCallback.bind(this));
                this.debuglog("Created object.");
        }
        /**
         * Set the volume to zero.
         */
        mute() {
                setVolume(0);
                this.isMute = true;
                this.debuglog("mute is called");
        }
        /**
         * Set volume to the original volume before mute.
         */
        unMute() {
                this.isMute = false;
                setVolume(this.volume);
                this.debuglog("unMute is called");
        }
        /**
         * Set device volume.
         * @param volume 
         */
        setVolume(volume: number) {
                setVolume(this.volume);
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