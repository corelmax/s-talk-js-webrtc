"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Platform;
(function (Platform) {
    Platform[Platform["BROWSER"] = 0] = "BROWSER";
    Platform[Platform["REACTNATIVE"] = 1] = "REACTNATIVE";
    Platform[Platform["NODE"] = 2] = "NODE";
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
        else if (platform === Platform.REACTNATIVE) {
            var WebRTC = require("../rn-webrtc/WebRTC").WebRTC;
            return new WebRTC(options);
        }
    };
    return WebRtcFactory;
}());
exports.WebRtcFactory = WebRtcFactory;
