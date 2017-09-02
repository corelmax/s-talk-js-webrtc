/**
 * WebRtc Modules.
 *
 * Copyright 2017 Ahoo Studio.co.th.
 */
export * from "./core/IWebRTC";
export * from "./core/AbstractMediaStream";
export * from "./core/AbstractPeerConnection";
export * from "./core/WebrtcSignaling";
export * from "./core/AbstractPeer";
export * from "./core/AbstractWebRTC";
import { WebRtcConfig, IWebRTC } from "./core/IWebRTC";
export declare namespace StalkWebRtcFactory {
    class WebRtcFactory {
        static getObject(options: WebRtcConfig): Promise<IWebRTC | undefined>;
    }
}
