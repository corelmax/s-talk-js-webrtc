export var Platform;
(function (Platform) {
    Platform[Platform["BROWSER"] = 0] = "BROWSER";
    Platform[Platform["NODE"] = 1] = "NODE";
})(Platform || (Platform = {}));
export class WebRtcFactory {
    static getObject(platform, options) {
        console.log("userAgent", global["userAgent"]);
        if (platform === Platform.BROWSER) {
            const { WebRTC } = require("../react-webrtc/WebRTC");
            return new WebRTC(options);
        }
        else if (platform === Platform.NODE) {
            // const { WebRTC } = require("../rn-webrtc/WebRTC");
            // return new WebRTC(options);
        }
    }
}
