/// <reference types="socket.io-client" />
/// <reference types="node" />
/**
 * WebRtc Modules.
 *
 * Copyright 2017 Ahoo Studio.co.th.
 */
import { EventEmitter } from 'events';
import { IPC_Estabished } from "./AbstractPeerConnection";
import { IUserMedia } from "./AbstractMediaStream";
export interface WebRtcConfig {
    signalingUrl: string;
    socketOptions: any;
    debug: boolean;
    detectSpeakingEvents: boolean;
}
export interface IWebRTC {
    signalingSocket: SocketIOClient.Socket;
    webrtcEvents: EventEmitter;
    roomName: string;
    peerManager: IPC_Estabished;
    userMedia: IUserMedia;
    debug: boolean;
    initWebRtc(): any;
    send(messageType: string, payload: any, optionals: {
        to: string;
    }): any;
    join(roomname: string): any;
    leaveRoom(): any;
    disconnect(): any;
    onDisconnect(data: any): any;
}
