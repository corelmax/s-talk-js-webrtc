/**
 * WebRtcFactory.
 *
 * Copyright 2017 Ahoo Studio.co.th.
 */
import { WebRtcConfig, IWebRTC } from "./IWebRTC";
export declare enum Platform {
    BROWSER = 0,
    NODE = 1,
}
export declare class WebRtcFactory {
    static getObject(platform: Platform, options: WebRtcConfig): Promise<IWebRTC | undefined>;
}
