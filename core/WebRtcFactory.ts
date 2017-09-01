/**
 * WebRtcFactory.
 *
 * Copyright 2017 Ahoo Studio.co.th.
 */
import { WebRtcConfig, IWebRTC } from "./IWebRTC";

export enum Platform {
    BROWSER = 0,
    REACTNATIVE,
    NODE
}

export class WebRtcFactory {
    static async getObject(platform: Platform, options: WebRtcConfig): Promise<IWebRTC | undefined> {
        if (platform === Platform.BROWSER) {
            const { WebRTC } = require("../react-webrtc/WebRTC");
            return await new WebRTC(options);
        }
        else if (platform === Platform.REACTNATIVE) {
            const { WebRTC } = require("../rn-webrtc/WebRTC");
            return await new WebRTC(options);
        }
    }
}