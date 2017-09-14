/**
 * WebRtc Modules.
 *
 * Copyright 2017 Ahoo Studio.co.th.
 */
import { EventEmitter } from 'events';
import { IMessageExchange } from "./WebrtcSignaling";

export namespace AbstractPeerConnection {
    export const CREATED_PEER = "createdPeer";
    export const PEER_STREAM_ADDED = "peerStreamAdded";
    export const PEER_STREAM_REMOVED = "peerStreamRemoved";
    export const CONNECTIVITY_ERROR = "connectivityError";
    export const PEER_STATS_READY = "PEER_STATS_READY";

    export const ON_ICE_COMPLETED = "iceCompleted";
    export const ON_ICE_CONNECTED = "iceConnected";
    export const ON_ICE_CONNECTION_FAILED = "iceFailed";
    export const ON_ICE_CONNECTION_CLOSED = "iceClosed";

    export const PAUSE = "pause"; // for video
    export const UNPAUSE = "unpause"; // for video
    export const DUMMY_VIDEO = "dummy_video"; // for video

    export const ANSWER = "answer";
    export const OFFER = "offer";
    export const CANDIDATE = "candidate";
    export const PeerEvent = "PeerEvent";
}

export interface IPC_Estabished {
    peers: Map<string, IPC_Handler>;

    createPeer(options, webrtc): IPC_Handler;
    getPeers(session_id?: string): IPC_Handler | Map<string, IPC_Handler>;
    removePeers(session_id: string, webrtc);

    sendToAll(message, payload);
    sendDirectlyToAll(channel: string, message, payload);
}

export interface IPC_Handler {
    id: string;
    pc: RTCPeerConnection;
    channels: any;
    pcEvent: EventEmitter;
    debug: boolean;
    readonly type: string;
    parentsEmitter: EventEmitter;
    receiveChannel;
    pcPeers;
    browserPrefix: string;
    nick;
    offer: boolean;
    audioTracks: MediaStreamTrack[];
    videoTracks: MediaStreamTrack[];

    send_event: (messageType: string, payload?: any, optional?: { to: string }) => void;
    logError(error: string);

    initPeerConnection(stream: MediaStream, iceConfig: any);
    addStream(stream: MediaStream);
    removeStream(stream: MediaStream);
    handleMessage(message: IMessageExchange);
    getStats(mediaTrack: MediaStreamTrack, secInterval: number): Promise<any>;
    restartIce();
}
export interface PeerConstructor {
    peer_id;
    stream;
    pcPeers;
    emitter;
    sendHandler;
    offer;
    debug;
    iceConfig: RTCConfiguration;
}