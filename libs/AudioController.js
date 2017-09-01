import AudioCtx from './audioCtx';
// implement from mediastream-gain lib
var AudioController = (function () {
    function AudioController(stream) {
        // webrtcsupport lib
        this.support = (!!(AudioContext && AudioContext.prototype.createMediaStreamSource)
            &&
                !!(MediaStream && MediaStream.prototype.removeTrack));
        this.volume = 1;
        if (this.support) {
            // var context = this.context = AudioCtx.getInstance();
            var context = AudioCtx.getInstance();
            this.microphone = context.createMediaStreamSource(stream);
            this.gainFilter = context.createGain();
            var destination = context.createMediaStreamDestination();
            var outputStream = destination.stream;
            this.microphone.connect(this.gainFilter);
            this.gainFilter.connect(destination);
            stream.addTrack(outputStream.getAudioTracks()[0]);
            this.audioSource = stream.getAudioTracks()[0];
            stream.removeTrack(this.audioSource);
        }
        else {
            console.log("Browser doesn't support adjust local microphone volume");
        }
    }
    AudioController.prototype.setVolume = function (volume) {
        if (!this.support)
            return;
        this.gainFilter.gain.value = volume;
        this.volume = volume;
    };
    AudioController.prototype.getVolume = function () {
        return this.volume;
    };
    AudioController.prototype.mute = function () {
        this.setVolume(0);
    };
    AudioController.prototype.unMute = function () {
        this.setVolume(1);
    };
    AudioController.prototype.removeAudioStream = function () {
        !!this.audioSource && this.audioSource.stop();
        !!this.microphone && this.microphone.disconnect();
        !!this.gainFilter && this.gainFilter.disconnect();
    };
    return AudioController;
}());
export { AudioController };
