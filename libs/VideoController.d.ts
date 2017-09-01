import { AbstractMediaStream } from "../IWebRTC";
export declare class VideoController implements AbstractMediaStream.VideoController {
    localStream: any;
    videoSource: any;
    constructor(stream: any);
    setVideoEnabled(enabled: boolean): void;
}
