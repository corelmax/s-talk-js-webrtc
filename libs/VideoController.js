"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var VideoToBlurImage_1 = require("./VideoToBlurImage");
// implement from mediastream-gain lib
var VideoController = (function () {
    function VideoController(stream) {
        this.localStream = stream;
        this.videoSource = stream.getVideoTracks()[0];
    }
    VideoController.prototype.setVideoEnabled = function (enabled) {
        if (!!this.videoSource) {
            var localVideoElement_1 = document.getElementById('localVideo');
            if (!!localVideoElement_1) {
                if (enabled) {
                    localVideoElement_1.srcObject = this.localStream;
                }
                else {
                    VideoToBlurImage_1.getImage(localVideoElement_1).then(function (res) {
                        localVideoElement_1.srcObject = res;
                    });
                }
            }
            this.videoSource.enabled = !!enabled;
            // videoTracks.forEach(function (track) {
            //     track.enabled = !!enabled;
            // })
        }
    };
    return VideoController;
}());
exports.VideoController = VideoController;
