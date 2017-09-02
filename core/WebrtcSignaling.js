/**
 * WebRtcSiggnalling.
 *
 * Copyright 2017 Ahoo Studio.co.th.
 */
export function withExchange(webrtcObject) {
    return function exchange(message) {
        var self = webrtcObject;
        var fromId = message.from;
        // const roomType = message.roomType;
        var peer = self.peerManager.getPeers(fromId);
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
        var self = webrtcObject;
        if (!self.signalingSocket)
            return;
        var message = {
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
