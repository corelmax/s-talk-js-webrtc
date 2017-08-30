/**
 * WebRtcSiggnalling.
 *
 * Copyright 2017 Ahoo Studio.co.th.
 */
export function withExchange(webrtcObject) {
    return function exchange(message) {
        let self = webrtcObject;
        const fromId = message.from;
        // const roomType = message.roomType;
        let peer = self.peerManager.getPeers(fromId);
        if (!peer) {
            peer = self.peerManager.createPeer({
                id: message.from,
                // sid: message.sid,
                // type: message.roomType,
                offer: false,
            }, self);
        }
        peer.handleMessage(message);
    };
}
// send via signalling channel
export function withSendMessage(webrtcObject) {
    return function send(messageType, payload, optional) {
        let self = webrtcObject;
        if (!self.signalingSocket)
            return;
        let message = {
            to: optional.to,
            // sid: self.sid,
            // broadcaster: this.broadcaster,
            // roomType: self.type,
            type: messageType,
            payload: payload,
        };
        self.signalingSocket.emit('message', message);
    };
}
