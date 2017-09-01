import { PeerConstructor } from "../core/AbstractPeerConnection";
import { AbstractPeer } from "../core/AbstractPeer";
export declare class Peer extends AbstractPeer.BasePeer {
    /**
     * reture PeerConnection
     * @param socket
     * @param stream
     * @param options
     */
    constructor(config: PeerConstructor);
    initPeerConnection(stream: MediaStream): void;
    getStats(): void;
    handleMessage(message: any): void;
    createDataChannel(): void;
}
