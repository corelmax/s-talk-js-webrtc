/**
 * S-TAlK webrtc interface.
 *
 * Copyright 2017 Ahoo Studio.co.th.
 */

import 'webrtc-adapter';

import { WebRtcConfig } from "../core/IWebRTC";
import { AbstractWEBRTC } from "../core/AbstractWebRTC";
import { PeerManager } from "./PeerManager";
import { UserMedia } from "./UserMedia";

export function hasGetUserMedia() {
    return !!(navigator.getUserMedia || navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia || navigator.msGetUserMedia);
}

export class WebRTC extends AbstractWEBRTC.BaseWebRTC {

    constructor(configs: WebRtcConfig) {
        super(configs);

        // if (!hasGetUserMedia()) {
        //     alert('getUserMedia() is not supported in your browser');

        //     console.warn('Your browser does not support local media capture.');

        //     this.webrtcEvents.emit(AbstractWEBRTC.NOT_SUPPORT_MEDIA);
        //     return;
        // }

        this.peerManager = new PeerManager({ debug: this.debug });
        this.userMedia = new UserMedia({ debug: this.debug });
    }

}