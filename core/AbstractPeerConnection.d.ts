/// <reference types="node" />
/**
 * WebRtc Modules.
 *
 * Copyright 2017 Ahoo Studio.co.th.
 */
import { EventEmitter } from 'events';
export declare namespace AbstractPeerConnection {
    const CREATED_PEER = "createdPeer";
    const PEER_STREAM_ADDED = "peerStreamAdded";
    const PEER_STREAM_REMOVED = "peerStreamRemoved";
    const CONNECTIVITY_ERROR = "connectivityError";
    const ON_ICE_CONNECTION_FAILED = "iceFailed";
    const PAUSE = "pause";
    const UNPAUSE = "unpause";
    const DUMMY_VIDEO = "dummy_video";
    const ANSWER = "answer";
    const OFFER = "offer";
    const CANDIDATE = "candidate";
}
export interface IPC_Estabished {
    createPeer(options: any, webrtc: any): IPC_Handler;
    getPeers(session_id?: string): IPC_Handler | Map<string, IPC_Handler>;
    removePeers(session_id: string, webrtc: any): any;
    sendToAll(message: any, payload: any): any;
    sendDirectlyToAll(channel: string, message: any, payload: any): any;
}
export interface IPC_Handler {
    id: string;
    pc: RTCPeerConnection;
    channels: any;
    pcEvent: EventEmitter;
    readonly debug: boolean;
    readonly type: string;
    parentsEmitter: EventEmitter;
    receiveChannel: any;
    pcPeers: any;
    browserPrefix: string;
    nick: any;
    offer: boolean;
    send_event: (messageType: string, payload?: any, optional?: {
        to: string;
    }) => void;
    logError(error: string): any;
    initPeerConnection(stream: MediaStream): any;
    addStream(stream: MediaStream): any;
    removeStream(stream: MediaStream): any;
    handleMessage(message: any): any;
}
export interface PeerConstructor {
    peer_id: any;
    stream: any;
    pcPeers: any;
    emitter: any;
    sendHandler: any;
    offer: any;
    debug: any;
}
