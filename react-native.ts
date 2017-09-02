/**
 * WebRtc Modules.
 *
 * Copyright 2017 Ahoo Studio.co.th.
 */
export * from "./core/IWebRTC";
export * from "./core/AbstractMediaStream";
export * from "./core/AbstractPeerConnection";
// export * from "./core/WebRtcFactory";
export * from "./core/WebrtcSignaling";
export * from "./core/AbstractPeer";
export * from "./core/AbstractWebRTC";

import { WebRtcConfig, IWebRTC } from "./core/IWebRTC";

export namespace StalkWebRtcFactory {
    export class WebRtcFactory {
        static async getObject(options: WebRtcConfig): Promise<IWebRTC | undefined> {
            const { WebRTC } = require("./rn-webrtc/WebRTC");
            return await new WebRTC(options);
        }
    }
}
