class AudioCtx {
    static getInstance() {
        if (AudioCtx.instance === null || AudioCtx.instance === undefined) {
            AudioCtx.instance = new (window.AudioContext || window.webkitAudioContext)();
        }
        return AudioCtx.instance;
    }
}
export default AudioCtx;
