/// <reference types="node" />
/**
 * React,React-native webrtc peer implementation...
 *
 * Copyright 2017 Ahoo Studio.co.th.
 */
import { EventEmitter } from "events";
import { IPC_Handler, PeerConstructor } from "./AbstractPeerConnection";
import { IMessageExchange } from "./WebrtcSignaling";
export declare namespace AbstractPeer {
    abstract class BasePeer implements IPC_Handler {
        configuration: {
            iceServers: {
                urls: string[];
            }[];
        };
        id: string;
        pc: RTCPeerConnection;
        channels: any;
        debug: boolean;
        readonly type: string;
        pcEvent: EventEmitter;
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
        abstract initPeerConnection(stream: MediaStream, iceConfig: any): any;
        removeStream(stream: MediaStream): void;
        addStream(stream: MediaStream): void;
        onSetSessionDescriptionError(error: any): void;
        onCreateSessionDescriptionError(error: any): void;
        restartIce(): void;
        onCreateOfferSuccess(desc: RTCSessionDescription): void;
        createOffer(): void;
        createAnswer(message: IMessageExchange): void;
        sendOffer(): void;
        handleMessage(message: IMessageExchange): void;
    }
}
