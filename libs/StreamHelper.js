"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function createStreamByText(text, mute) {
    if (mute === void 0) { mute = false; }
    var canvas = document.createElement('canvas');
    var width = 300;
    var height = 300;
    canvas.width = width;
    canvas.height = height;
    var context = canvas.getContext('2d');
    if (!!context) {
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillStyle = "#FFF";
        context.font = "45px Roboto";
        context.fillText(text, (width / 2), (height / 2));
    }
    var stream = canvas.captureStream(0);
    return stream;
}
exports.createStreamByText = createStreamByText;
function createDummyStream() {
    var canvas = document.createElement('canvas');
    var width = 300;
    var height = 300;
    canvas.width = width;
    canvas.height = height;
    var context = canvas.getContext('2d');
    if (!!context) {
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillStyle = "#FFF";
        context.font = "45px Roboto";
        context.fillText("DUMMY", (width / 2), (height / 2));
    }
    var dummyStream = canvas.captureStream(0);
    dummyStream.type = "dummy";
    // dummyStream.getVideoTracks()[0].muted = false;
    // dummyStream.removeTrack(dummyStream.getTracks()[0]);
    return dummyStream;
}
exports.createDummyStream = createDummyStream;
