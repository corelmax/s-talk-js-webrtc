export default class NativeVolumeController {
    /**
     * Volume of running device, must apply only when onVolumeChanged callback;
     */
    private volume;
    private onVolumeChangedCallback;
    isMute: boolean;
    constructor(onVolumeChangedCallback?: any);
    /**
     * Set the volume to zero.
     */
    mute(): void;
    /**
     * Set volume to the original volume before mute.
     */
    unMute(): void;
    /**
     * Set device volume.
     * @param volume
     */
    setVolume(volume: number): void;
    /**
     * Get device volume.
     */
    getVolume(): number;
    /**
     * Get device volume callback when call getVolume
     * @param volume
     */
    private getVolumnCallback(volume);
    /**
     * Callback when the device volume is changed.
     * @param volume
     */
    protected onVolumeChanged(volume: any): void;
    private debuglog(...msg);
}
