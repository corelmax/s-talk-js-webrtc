/**
 * React-Native webrtc interface.
 *
 * Copyright 2017 Ahoo Studio.co.th.
 */

import { WebRtcConfig } from "../core/IWebRTC";
import { AbstractWEBRTC } from "../core/AbstractWebRTC";
import { PeerManager } from "./PeerManager";
import { UserMedia } from "./UserMedia";

export class WebRTC extends AbstractWEBRTC.BaseWebRTC {
    constructor(configs: WebRtcConfig) {
        super(configs);

        this.peerManager = new PeerManager({ debug: this.debug });
        this.userMedia = new UserMedia({ debug: this.debug });
    }
}