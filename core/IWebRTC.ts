/**
 * WebRtc Modules.
 *
 * Copyright 2017 Ahoo Studio.co.th.
 */
import { EventEmitter } from 'events';

export namespace AbstractWEBRTC {
    export const ON_CONNECTION_READY = "connectionReady";
    export const ON_CONNECTION_CLOSE = "ON_CONNECTION_CLOSE";
    export const JOINED_ROOM = "joinedRoom"
    export const JOIN_ROOM_ERROR = "joinRoomError";
    export const NOT_SUPPORT_MEDIA = "NOT_SUPPORT_MEDIA";

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
        peerManager: AbstractPeerConnection.IPC_Estabished;
        userMedia: AbstractMediaStream.IUserMedia;
        debug: boolean;

        send(messageType: string, payload: any, optionals: { to: string });
        join(roomname: string);
        leaveRoom();
        disconnect();
        onDisconnect(data);
    }
}

export namespace AbstractPeerConnection {
    export const CREATED_PEER = "createdPeer";
    export const PEER_STREAM_ADDED = "peerStreamAdded";
    export const PEER_STREAM_REMOVED = "peerStreamRemoved";
    export const CONNECTIVITY_ERROR = "connectivityError";
    export const ON_ICE_CONNECTION_FAILED = "iceFailed";

    export const PAUSE = "pause"; // for video
    export const UNPAUSE = "unpause"; // for video
    export const DUMMY_VIDEO = "dummy_video"; // for video

    export const ANSWER = "answer";
    export const OFFER = "offer";
    export const CANDIDATE = "candidate";

    export interface IPC_Estabished {
        createPeer(options, webrtc): AbstractPeerConnection.IPC_Handler;
        getPeers(session_id?: string): AbstractPeerConnection.IPC_Handler | Map<string, AbstractPeerConnection.IPC_Handler>;
        removePeers(session_id: string, webrtc);

        sendToAll(message, payload);
        sendDirectlyToAll(channel: string, message, payload);
    }

    export interface IPC_Handler {
        id: string;
        pc: RTCPeerConnection;
        channels: any;
        pcEvent: EventEmitter;
        readonly debug: boolean;
        readonly type: string;
        parentsEmitter: EventEmitter;
        receiveChannel;
        pcPeers;
        browserPrefix: string;
        nick;
        offer: boolean;

        send_event: (messageType: string, payload?: any, optional?: { to: string }) => void;
        logError(error: string);

        initPeerConnection(stream: MediaStream);
        addStream(stream: MediaStream);
        removeStream(stream: MediaStream);
        handleMessage(message: any);
    }
    export interface PeerConstructor {
        peer_id; stream; pcPeers; emitter; sendHandler; offer; debug;
    }
}

export namespace AbstractMediaStream {
    export const fullHdConstraints = {
        video: { width: { exact: 1920 }, height: { exact: 1080 } }
    } as MediaStreamConstraints;

    export const hdConstraints = {
        video: {
            mandatory: {
                minWidth: 1280,
                minHeight: 720
            }
        }
    } as MediaStreamConstraints;

    export const vgaConstraints = {
        video: {
            mandatory: {
                maxWidth: 640,
                maxHeight: 360
            }
        }
    } as MediaStreamConstraints;

    export const qvgaConstraints = {
        video: {
            mandatory: {
                maxWidth: 320,
                maxHeight: 240
            }
        }
    } as MediaStreamConstraints;

    export interface IUserMedia {
        debug: boolean;
        audioController: AudioController;
        videoController: VideoController;
        getLocalStream(): MediaStream;
        setLocalStream(stream: MediaStream);
        getVideoTrack(): MediaStreamTrack | null;
        getAudioTrack(): MediaStreamTrack | null;

        startLocalStream(mediaContraints: MediaStreamConstraints, isFront?: false): Promise<MediaStream>;
        stopLocalStream();
    }

    export interface AudioController {
        //@ about mic-gainController in browser.
        support: boolean;
        volume: number;
        gainFilter: GainNode;
        audioSource: AudioTrack;
        microphone: AudioNode;
        mute();
        unMute();
        setVolume(volume: number);
        getVolume();
        removeAudioStream();
    }

    export interface VideoController {
        //@ about video stream in browser.
        localStream: MediaStream;
        videoSource: VideoTrack;
        setVideoEnabled(enabled: boolean);
    }
}   