/// <reference types="node" />
/**
 * React,React-native webrtc peer implementation...
 *
 * Copyright 2017 Ahoo Studio.co.th.
 */
import { EventEmitter } from "events";
import { IPC_Handler, PeerConstructor } from "./AbstractPeerConnection";
export declare namespace AbstractPeer {
    abstract class BasePeer implements IPC_Handler {
        id: string;
        pc: RTCPeerConnection;
        channels: any;
        pcEvent: EventEmitter;
        debug: boolean;
        readonly type: string;
        parentsEmitter: EventEmitter;
        receiveChannel: any;
        pcPeers: any;
        browserPrefix: string;
        nick: any;
        offer: boolean;
        enableDataChannels: boolean;
        send_event: (messageType: string, payload?: any, optional?: {
            to: string;
        }) => void;
        logError: (error: any) => void;
        /**
         * reture PeerConnection
         * @param socket
         * @param stream
         * @param options
         */
        constructor(config: PeerConstructor);
        initPeerConnection(stream: MediaStream, iceConfig: any): void;
        removeStream(stream: MediaStream): void;
        addStream(stream: MediaStream): void;
        onSetSessionDescriptionError(error: any): void;
        onCreateSessionDescriptionError(error: any): void;
        createOffer(): void;
        createAnswer(message: any): void;
        handleMessage(message: any): void;
    }
}
