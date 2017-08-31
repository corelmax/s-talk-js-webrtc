// reference
// https://developers.google.com/web/updates/2016/10/capture-stream
// https://tokbox.com/blog/camera-filters-in-opentok-for-web/
// https://trackingjs.com/
const tracking = window.tracking = {};
require('tracking');

export function getImage(videoElement: HTMLVideoElement) {
    return new Promise((resolve, reject) => {
        let canvas: HTMLCanvasElement = document.createElement('canvas');
        let width = videoElement.videoWidth;
        let height = videoElement.videoHeight;
        canvas.width = width;
        canvas.height = height;
        let context = canvas.getContext('2d');
        if (!!context) {
            context.drawImage(videoElement, 0, 0, width, height);

            const imgData = context.getImageData(0, 0, width, height);
            const blurData = tracking.Image.blur(imgData.data, imgData.width, imgData.height, 50);
            const blurImg = new ImageData(new Uint8ClampedArray(blurData), imgData.width, imgData.height);
            context.putImageData(blurImg, 0, 0);

            // adding text
            context.textAlign = "center";
            context.textBaseline = "middle";
            context.fillStyle = "#FFF";
            context.font = "50px Roboto";
            context.fillText("PAUSE", (width / 2), (height / 2));

            let blurImageStream = canvas.captureStream(0);
            resolve(blurImageStream);
        }
        else {
            reject(null);
        }
    })
}