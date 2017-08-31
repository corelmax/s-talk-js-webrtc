import AudioCtx from './audioCtx';
import { AbstractMediaStream } from "../core/AbstractMediaStream";
import { getImage } from './VideoToBlurImage';

// implement from mediastream-gain lib
export class VideoController implements AbstractMediaStream.VideoController {
    localStream;
    videoSource;

    constructor(stream) {
        this.localStream = stream;
        this.videoSource = stream.getVideoTracks()[0];
    }

    setVideoEnabled(enabled: boolean) {
        if (!!this.videoSource) {
            let localVideoElement: HTMLVideoElement = document.getElementById('localVideo');
            if (!!localVideoElement) {
                if (enabled) {
                    localVideoElement.srcObject = this.localStream;
                }
                else {
                    getImage(localVideoElement).then((res: MediaStream) => {
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