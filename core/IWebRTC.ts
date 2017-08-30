/**
 * WebRtc Modules.
 *
 * Copyright 2017 Ahoo Studio.co.th.
 */
import { EventEmitter } from 'events';
import { IPC_Estabished } from "./AbstractPeerConnection";
import { IUserMedia } from "./AbstractMediaStream";

export namespace AbstractWEBRTC {
    export const ON_CONNECTION_READY = "connectionReady";
    export const ON_CONNECTION_CLOSE = "ON_CONNECTION_CLOSE";
    export const JOINED_ROOM = "joinedRoom"
    export const JOIN_ROOM_ERROR = "joinRoomError";
    export const NOT_SUPPORT_MEDIA = "NOT_SUPPORT_MEDIA";
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

    send(messageType: string, payload: any, optionals: { to: string });
    join(roomname: string);
    leaveRoom();
    disconnect();
    onDisconnect(data);
}   