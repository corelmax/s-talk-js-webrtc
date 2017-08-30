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
export declare namespace AbstractWEBRTC {
    const ON_CONNECTION_READY = "connectionReady";
    const ON_CONNECTION_CLOSE = "ON_CONNECTION_CLOSE";
    const JOINED_ROOM = "joinedRoom";
    const JOIN_ROOM_ERROR = "joinRoomError";
    const NOT_SUPPORT_MEDIA = "NOT_SUPPORT_MEDIA";
}
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
    send(messageType: string, payload: any, optionals: {
        to: string;
    }): any;
    join(roomname: string): any;
    leaveRoom(): any;
    disconnect(): any;
    onDisconnect(data: any): any;
}
