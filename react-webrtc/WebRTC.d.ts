/**
 * S-TAlK webrtc interface.
 *
 * Copyright 2017 Ahoo Studio.co.th.
 */
import 'webrtc-adapter';
import { WebRtcConfig } from "../core/IWebRTC";
import { AbstractWEBRTC } from "../core/AbstractWebRTC";
export declare function hasGetUserMedia(): boolean;
export declare class WebRTC extends AbstractWEBRTC.BaseWebRTC {
    constructor(configs: WebRtcConfig);
}
