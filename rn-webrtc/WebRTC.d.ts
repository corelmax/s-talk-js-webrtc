/**
 * React-Native webrtc interface.
 *
 * Copyright 2017 Ahoo Studio.co.th.
 */
import { WebRtcConfig } from "../core/IWebRTC";
import { AbstractWEBRTC } from "../core/AbstractWebRTC";
export declare class WebRTC extends AbstractWEBRTC.BaseWebRTC {
    constructor(configs: WebRtcConfig);
}
