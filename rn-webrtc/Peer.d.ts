/// <reference types="node" />
import * as events from 'events';
import { RTCPeerConnection } from 'react-native-webrtc';
import { AbstractPeerConnection } from "../index";
export declare class Peer implements AbstractPeerConnection.IPC_Handler {
    debug: boolean;
    type: string;
    parentsEmitter: events.EventEmitter;
    id: string;
    pc: RTCPeerConnection;
    receiveChannel: any;
    channels: {};
    pcPeers: any;
    browserPrefix: any;
    nick: any;
    send_event: (messageType: string, payload?: any, optional?: {
        to: string;
    }) => void;
    logError: (error) => void;
    /**
     * reture PeerConnection
     * @param socket
     * @param stream
     * @param options
     */
    constructor(parents: AbstractPeerConnection.PeerConstructor);
    removeStream(stream: MediaStream): void;
    addStream(stream: MediaStream): void;
    getStats(): void;
    onSetSessionDescriptionError(error: any): void;
    onCreateSessionDescriptionError(error: any): void;
    createOffer(): void;
    createAnswer(message: any): void;
    handleMessage(message: any): void;
    createDataChannel(): void;
}
