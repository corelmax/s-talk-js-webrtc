/// <reference types="socket.io-client" />
/// <reference types="node" />
import * as events from 'events';
import { IWebRTC, WebRtcConfig } from "../index";
import { PeerManager } from "./PeerManager";
import { UserMedia } from "./UserMedia";
export declare function logError(error: any): void;
export declare class WebRTC implements IWebRTC {
    signalingSocket: SocketIOClient.Socket;
    webrtcEvents: events.EventEmitter;
    roomName: string;
    peerManager: PeerManager;
    userMedia: UserMedia;
    debug: boolean;
    constructor(configs: WebRtcConfig);
    send(messageType: string, payload?: any, optional?: {
        to: string;
    }): void;
    join(roomname: string): void;
    leaveRoom(): void;
    disconnect(): void;
    onDisconnect(data: any): void;
}
