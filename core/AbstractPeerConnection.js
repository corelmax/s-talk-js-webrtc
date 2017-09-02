export var AbstractPeerConnection;
(function (AbstractPeerConnection) {
    AbstractPeerConnection.CREATED_PEER = "createdPeer";
    AbstractPeerConnection.PEER_STREAM_ADDED = "peerStreamAdded";
    AbstractPeerConnection.PEER_STREAM_REMOVED = "peerStreamRemoved";
    AbstractPeerConnection.CONNECTIVITY_ERROR = "connectivityError";
    AbstractPeerConnection.ON_ICE_COMPLETED = "iceCompleted";
    AbstractPeerConnection.ON_ICE_CONNECTED = "iceConnected";
    AbstractPeerConnection.ON_ICE_CONNECTION_FAILED = "iceFailed";
    AbstractPeerConnection.ON_ICE_CONNECTION_CLOSED = "iceClosed";
    AbstractPeerConnection.PAUSE = "pause"; // for video
    AbstractPeerConnection.UNPAUSE = "unpause"; // for video
    AbstractPeerConnection.DUMMY_VIDEO = "dummy_video"; // for video
    AbstractPeerConnection.ANSWER = "answer";
    AbstractPeerConnection.OFFER = "offer";
    AbstractPeerConnection.CANDIDATE = "candidate";
})(AbstractPeerConnection || (AbstractPeerConnection = {}));
