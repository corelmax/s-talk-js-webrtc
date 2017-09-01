/**
 * S-TAlK webrtc interface.
 *
 * Copyright 2017 Ahoo Studio.co.th.
 */
import { IPC_Estabished } from "../index";
import { Peer } from "./Peer";
import { WebRTC } from "./WebRTC";
export declare class PeerManager implements IPC_Estabished {
    peers: Map<string, Peer>;
    debug: boolean;
    constructor(options: {
        debug: boolean;
    });
    createPeer(options: {
        id;
        type;
        offer;
    }, webrtc: WebRTC): Peer;
    getPeers(sessionId?: string): Peer | Map<string, Peer>;
    removePeers(sessionId: string, webrtc: WebRTC): void;
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
