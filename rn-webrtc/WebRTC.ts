/**
 * React-Native webrtc interface.
 *
 * Copyright 2017 Ahoo Studio.co.th.
 */
import {
    RTCPeerConnection,
    RTCMediaStream,
    RTCIceCandidate,
    RTCSessionDescription,
    RTCView,
    MediaStreamTrack,
    getUserMedia,
} from 'react-native-webrtc';
import * as events from 'events';
import * as io from 'socket.io-client';

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