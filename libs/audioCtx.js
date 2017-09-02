var AudioCtx = /** @class */ (function () {
    function AudioCtx() {
    }
    AudioCtx.getInstance = function () {
        if (AudioCtx.instance === null || AudioCtx.instance === undefined) {
            AudioCtx.instance = new (window.AudioContext || window.webkitAudioContext)();
        }
        return AudioCtx.instance;
    };
    return AudioCtx;
}());
export default AudioCtx;
