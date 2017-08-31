"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// reference
// https://developers.google.com/web/updates/2016/10/capture-stream
// https://tokbox.com/blog/camera-filters-in-opentok-for-web/
// https://trackingjs.com/
var tracking = window.tracking = {};
require('tracking');
function getImage(videoElement) {
    return new Promise(function (resolve, reject) {
        var canvas = document.createElement('canvas');
        var width = videoElement.videoWidth;
        var height = videoElement.videoHeight;
        canvas.width = width;
        canvas.height = height;
        var context = canvas.getContext('2d');
        if (!!context) {
            context.drawImage(videoElement, 0, 0, width, height);
            var imgData = context.getImageData(0, 0, width, height);
            var blurData = tracking.Image.blur(imgData.data, imgData.width, imgData.height, 50);
            var blurImg = new ImageData(new Uint8ClampedArray(blurData), imgData.width, imgData.height);
            context.putImageData(blurImg, 0, 0);
            // adding text
            context.textAlign = "center";
            context.textBaseline = "middle";
            context.fillStyle = "#FFF";
            context.font = "50px Roboto";
            context.fillText("PAUSE", (width / 2), (height / 2));
            var blurImageStream = canvas.captureStream(0);
            resolve(blurImageStream);
        }
        else {
            reject(null);
        }
    });
}
exports.getImage = getImage;
