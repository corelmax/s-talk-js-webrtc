/// <reference types="socket.io-client" />
/// <reference types="node" />
/**
 * WebRtc Modules.
 *
 * Copyright 2017 Ahoo Studio.co.th.
 */
import { EventEmitter } from 'events';
export declare namespace AbstractWEBRTC {
    const ON_CONNECTION_READY = "connectionReady";
    const ON_CONNECTION_CLOSE = "ON_CONNECTION_CLOSE";
    const JOINED_ROOM = "joinedRoom";
    const JOIN_ROOM_ERROR = "joinRoomError";
    const NOT_SUPPORT_MEDIA = "NOT_SUPPORT_MEDIA";
    interface WebRtcConfig {
        signalingUrl: string;
        socketOptions: any;
        debug: boolean;
        detectSpeakingEvents: boolean;
    }
    interface IWebRTC {
        signalingSocket: SocketIOClient.Socket;
        webrtcEvents: EventEmitter;
        roomName: string;
        peerManager: AbstractPeerConnection.IPC_Estabished;
        userMedia: AbstractMediaStream.IUserMedia;
        debug: boolean;
        send(messageType: string, payload: any, optionals: {
            to: string;
        }): any;
        join(roomname: string): any;
        leaveRoom(): any;
        disconnect(): any;
        onDisconnect(data: any): any;
    }
}
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
    interface IPC_Estabished {
        createPeer(options: any, webrtc: any): AbstractPeerConnection.IPC_Handler;
        getPeers(session_id?: string): AbstractPeerConnection.IPC_Handler | Map<string, AbstractPeerConnection.IPC_Handler>;
        removePeers(session_id: string, webrtc: any): any;
        sendToAll(message: any, payload: any): any;
        sendDirectlyToAll(channel: string, message: any, payload: any): any;
    }
    interface IPC_Handler {
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
    interface PeerConstructor {
        peer_id: any;
        stream: any;
        pcPeers: any;
        emitter: any;
        sendHandler: any;
        offer: any;
        debug: any;
    }
}
export declare namespace AbstractMediaStream {
    const fullHdConstraints: MediaStreamConstraints;
    const hdConstraints: MediaStreamConstraints;
    const vgaConstraints: MediaStreamConstraints;
    const qvgaConstraints: MediaStreamConstraints;
    interface IUserMedia {
        debug: boolean;
        audioController: AudioController;
        videoController: VideoController;
        getLocalStream(): MediaStream;
        setLocalStream(stream: MediaStream): any;
        getVideoTrack(): MediaStreamTrack | null;
        getAudioTrack(): MediaStreamTrack | null;
        startLocalStream(mediaContraints: MediaStreamConstraints, isFront?: false): Promise<MediaStream>;
        stopLocalStream(): any;
    }
    interface AudioController {
        support: boolean;
        volume: number;
        gainFilter: GainNode;
        audioSource: AudioTrack;
        microphone: AudioNode;
        mute(): any;
        unMute(): any;
        setVolume(volume: number): any;
        getVolume(): any;
        removeAudioStream(): any;
    }
    interface VideoController {
        localStream: MediaStream;
        videoSource: VideoTrack;
        setVideoEnabled(enabled: boolean): any;
    }
}
