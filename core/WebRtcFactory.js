"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Platform;
(function (Platform) {
    Platform[Platform["BROWSER"] = 0] = "BROWSER";
    Platform[Platform["NODE"] = 1] = "NODE";
})(Platform = exports.Platform || (exports.Platform = {}));
var WebRtcFactory = (function () {
    function WebRtcFactory() {
    }
    WebRtcFactory.getObject = function (platform, options) {
        console.log("userAgent", global["userAgent"]);
        if (platform === Platform.BROWSER) {
            var WebRTC = require("../react-webrtc/WebRTC").WebRTC;
            return new WebRTC(options);
        }
        else if (platform === Platform.NODE) {
            // const { WebRTC } = require("../rn-webrtc/WebRTC");
            // return new WebRTC(options);
        }
    };
    return WebRtcFactory;
}());
exports.WebRtcFactory = WebRtcFactory;
