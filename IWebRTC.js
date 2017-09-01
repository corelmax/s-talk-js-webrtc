"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var AbstractWEBRTC;
(function (AbstractWEBRTC) {
    AbstractWEBRTC.ON_CONNECTION_READY = "connectionReady";
    AbstractWEBRTC.ON_CONNECTION_CLOSE = "ON_CONNECTION_CLOSE";
    AbstractWEBRTC.JOINED_ROOM = "joinedRoom";
    AbstractWEBRTC.JOIN_ROOM_ERROR = "joinRoomError";
    AbstractWEBRTC.NOT_SUPPORT_MEDIA = "NOT_SUPPORT_MEDIA";
})(AbstractWEBRTC = exports.AbstractWEBRTC || (exports.AbstractWEBRTC = {}));
var AbstractPeerConnection;
(function (AbstractPeerConnection) {
    AbstractPeerConnection.CREATED_PEER = "createdPeer";
    AbstractPeerConnection.PEER_STREAM_ADDED = "peerStreamAdded";
    AbstractPeerConnection.PEER_STREAM_REMOVED = "peerStreamRemoved";
    AbstractPeerConnection.CONNECTIVITY_ERROR = "connectivityError";
    AbstractPeerConnection.ON_ICE_CONNECTION_FAILED = "iceFailed";
    AbstractPeerConnection.PAUSE = "pause"; // for video
    AbstractPeerConnection.UNPAUSE = "unpause"; // for video
    AbstractPeerConnection.DUMMY_VIDEO = "dummy_video"; // for video
    AbstractPeerConnection.ANSWER = "answer";
    AbstractPeerConnection.OFFER = "offer";
    AbstractPeerConnection.CANDIDATE = "candidate";
})(AbstractPeerConnection = exports.AbstractPeerConnection || (exports.AbstractPeerConnection = {}));
var AbstractMediaStream;
(function (AbstractMediaStream) {
    AbstractMediaStream.fullHdConstraints = {
        video: { width: { exact: 1920 }, height: { exact: 1080 } }
    };
    AbstractMediaStream.hdConstraints = {
        video: {
            mandatory: {
                minWidth: 1280,
                minHeight: 720
            }
        }
    };
    AbstractMediaStream.vgaConstraints = {
        video: {
            mandatory: {
                maxWidth: 640,
                maxHeight: 360
            }
        }
    };
    AbstractMediaStream.qvgaConstraints = {
        video: {
            mandatory: {
                maxWidth: 320,
                maxHeight: 240
            }
        }
    };
})(AbstractMediaStream = exports.AbstractMediaStream || (exports.AbstractMediaStream = {}));
