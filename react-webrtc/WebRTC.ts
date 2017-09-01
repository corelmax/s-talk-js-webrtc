// const RTCSessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription || window.webkitRTCSessionDescription || window.msRTCSessionDescription;
// const RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection || window.msRTCPeerConnection;
import 'webrtc-adapter';
import * as events from "events";
import * as io from 'socket.io-client';

import { withExchange, withSendMessage, IWebRTC, WebRtcConfig } from "../index";
import { AbstractWEBRTC } from "../core/AbstractWebRTC";
import * as Peer from "./Peer";
import { PeerManager } from "./PeerManager";
import { UserMedia } from "./UserMedia";

export function hasGetUserMedia() {
    return !!(navigator.getUserMedia || navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia || navigator.msGetUserMedia);
}

export class WebRTC extends AbstractWEBRTC.BaseWebRTC {

    constructor(configs: WebRtcConfig) {
        super(configs);

        if (!hasGetUserMedia()) {
            alert('getUserMedia() is not supported in your browser');

            console.warn('Your browser does not support local media capture.');

            self.webrtcEvents.emit(AbstractWEBRTC.NOT_SUPPORT_MEDIA);
            return;
        }




        this.peerManager = new PeerManager({ debug: self.debug });
        this.userMedia = new UserMedia({ debug: self.debug });

    }

}