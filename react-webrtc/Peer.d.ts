import { AbstractPeer, PeerConstructor } from "../index";
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
    sendDirectly(channel: any, messageType: any, payload: any): boolean;
    getDataChannel(name: any): any;
    private createDataChannel(name);
    receiveChannelCallback(event: any): void;
    onReceiveChannelStateChange(): void;
    onReceiveMessageCallback(event: any): void;
}
