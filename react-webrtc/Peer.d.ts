import { AbstractPeer, PeerConstructor } from "../index";
import { IMessageExchange } from "../core/WebrtcSignaling";
export declare type GetPeerStats = (track: MediaStreamTrack, cb: Function, sec_interval: number) => void;
export declare class Peer extends AbstractPeer.BasePeer {
    startTime: any;
    /**
     * reture PeerConnection
     * @param socket
     * @param stream
     * @param options
     */
    constructor(config: PeerConstructor);
    initPeerConnection(stream: MediaStream, iceConfig: RTCConfiguration): void;
    getStats(mediaTrack: MediaStreamTrack, secInterval: number): Promise<{}>;
    handleMessage(message: IMessageExchange): void;
    sendDirectly(channel: any, messageType: any, payload: any): boolean;
    getDataChannel(name: any): any;
    private createDataChannel(name);
    receiveChannelCallback(event: any): void;
    onReceiveChannelStateChange(): void;
    onReceiveMessageCallback(event: any): void;
}
