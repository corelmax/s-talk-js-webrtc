/**
 * React-Native webrtc interface.
 *
 * Copyright 2017 Ahoo Studio.co.th.
 */
import { AbstractPeerConnection } from "../index";
import { Peer } from "./Peer";
import { WebRTC } from "./WebRTC";
export declare class PeerManager implements AbstractPeerConnection.IPC_Estabished {
    peers: Map<string, Peer>;
    debug: boolean;
    constructor(options: {
        debug: boolean;
    });
    createPeer(options: {
        id: string;
        type: string;
        offer: boolean;
    }, webrtc: WebRTC): Peer;
    getPeers(sessionId: string): Peer | Map<string, Peer>;
    removePeers(sessionId: any, webrtc: WebRTC): void;
    /**
     * sends message to all
     * use signalling message.
     *
     * @param {any} message
     * @param {any} payload
     * @memberof PeerManager
     */
    sendToAll(message: any, payload: any): void;
    sendDirectlyToAll(channel: any, message: any, payload: any): void;
}
