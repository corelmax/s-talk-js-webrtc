/**
 * WebRtcSiggnalling.
 *
 * Copyright 2017 Ahoo Studio.co.th.
 */

import { IWebRTC } from "./IWebRTC";
import { AbstractPeerConnection, IPC_Handler } from "./AbstractPeerConnection";

export function withExchange(webrtcObject: IWebRTC) {
    return function exchange(message) {
        let self = webrtcObject;
        const fromId = message.from;
        // const roomType = message.roomType;
        let peer = self.peerManager.getPeers(fromId) as IPC_Handler;
        if (!peer) {
            peer = self.peerManager.createPeer({
                id: message.from,
                // sid: message.sid,
                // type: message.roomType,
                offer: false,
                // enableDataChannels: self.config.enableDataChannels && message.roomType !== 'screen',
                // sharemyscreen: message.roomType === 'screen' && !message.broadcaster,
                // broadcaster: message.roomType === 'screen' && !message.broadcaster ? self.connection.getSessionid() : null
            }, self);
        }

        peer.handleMessage(message);
    }
}

// send via signalling channel
export function withSendMessage(webrtcObject: IWebRTC) {
    return function send(messageType: string, payload, optional: { to: string }) {
        let self = webrtcObject;
        if (!self.signalingSocket) return;

        let message = {
            to: optional.to,
            // sid: self.sid,
            // broadcaster: this.broadcaster,
            // roomType: self.type,
            type: messageType,
            payload: payload,
            // prefix: webrtcSupport.prefix
        };
        self.signalingSocket.emit('message', message);
    };
}