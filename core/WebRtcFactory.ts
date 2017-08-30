/**
 * WebRtcFactory.
 *
 * Copyright 2017 Ahoo Studio.co.th.
 */
import { WebRtcConfig, IWebRTC } from "./IWebRTC";

export enum Platform {
    BROWSER = 0,
    NODE
}

export class WebRtcFactory {
    static getObject(platform: Platform, options: WebRtcConfig): Promise<IWebRTC | undefined> {
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