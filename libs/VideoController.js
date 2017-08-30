import { getImage } from './VideoToBlurImage';
// implement from mediastream-gain lib
export class VideoController {
    constructor(stream) {
        this.localStream = stream;
        this.videoSource = stream.getVideoTracks()[0];
    }
    setVideoEnabled(enabled) {
        if (!!this.videoSource) {
            let localVideoElement = document.getElementById('localVideo');
            if (!!localVideoElement) {
                if (enabled) {
                    localVideoElement.srcObject = this.localStream;
                }
                else {
                    getImage(localVideoElement).then((res) => {
                        localVideoElement.srcObject = res;
                    });
                }
            }
            this.videoSource.enabled = !!enabled;
            // videoTracks.forEach(function (track) {
            //     track.enabled = !!enabled;
            // })
        }
    }
}
