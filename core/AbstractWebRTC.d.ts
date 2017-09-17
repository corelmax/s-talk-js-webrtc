/// <reference types="socket.io-client" />
/// <reference types="node" />
/**
 * React,React-native webrtc peer implementation...
 *
 * Copyright 2017 Ahoo Studio.co.th.
 */
import * as events from "events";
import { IWebRTC, WebRtcConfig } from "./IWebRTC";
import { IPC_Estabished } from "./AbstractPeerConnection";
import { IUserMedia } from "./AbstractMediaStream";
export declare namespace AbstractWEBRTC {
    const ON_CONNECTION_READY = "connectionReady";
    const ON_CONNECTION_CLOSE = "ON_CONNECTION_CLOSE";
    const JOINED_ROOM = "joinedRoom";
    const JOIN_ROOM_ERROR = "joinRoomError";
    const NOT_SUPPORT_MEDIA = "NOT_SUPPORT_MEDIA";
    abstract class BaseWebRTC implements IWebRTC {
        signalingSocket: SocketIOClient.Socket;
        webrtcEvents: events.EventEmitter;
        roomName: string;
        peerManager: IPC_Estabished;
        userMedia: IUserMedia;
        debug: boolean;
        pingInverval: number;
        iceConfig: RTCConfiguration;
        constructor(configs: WebRtcConfig);
        join(roomname: string): void;
        leaveRoom(): void;
        send(messageType: string, payload: any, optional: {
            to: string;
        }): void;
        onDisconnect(data: any): void;
        disconnect(): void;
    }
}
