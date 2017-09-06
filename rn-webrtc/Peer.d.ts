import { PeerConstructor } from "../core/AbstractPeerConnection";
import { AbstractPeer } from "../core/AbstractPeer";
import { IMessageExchange } from "../core/WebrtcSignaling";
export declare class Peer extends AbstractPeer.BasePeer {
    /**
     * reture PeerConnection
     * @param socket
     * @param stream
     * @param options
     */
    constructor(config: PeerConstructor);
    initPeerConnection(stream: MediaStream, iceConfig: any): void;
    getStats(): void;
    handleMessage(message: IMessageExchange): void;
    createDataChannel(): void;
}
