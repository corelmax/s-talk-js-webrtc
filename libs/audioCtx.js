"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var AudioCtx = (function () {
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
exports.default = AudioCtx;
