"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
class PeerStatus extends React.Component {
    componentWillMount() {
        this.state = {
            peerIceState: "",
            peerIceGatheringState: "",
            peerSignalingState: ""
        };
        this.peerAdded = this.peerAdded.bind(this);
    }
    componentWillUnmount() {
        delete this.peer;
    }
    componentWillReceiveProps({ peer }) {
        if (!!peer && peer != this.props.peer) {
            this.peerAdded(peer);
        }
    }
    peerAdded(peer) {
        let self = this;
        self.peer = peer;
        let peerEvent = peer.pcEvent;
        peerEvent.on("oniceconnectionstatechange", event => {
            self.setState(prev => (Object.assign({}, prev, { peerIceState: event })));
        });
        peerEvent.on("onicegatheringstatechange", event => {
            self.setState(prev => (Object.assign({}, prev, { peerIceGatheringState: event })));
        });
        peerEvent.on("onsignalingstatechange", event => {
            self.setState(prev => (Object.assign({}, prev, { peerSignalingState: event })));
        });
    }
    render() {
        return (React.createElement("div", null,
            React.createElement("p", { style: { fontSize: 11 } },
                "iceConnectionState: ",
                this.state.peerIceState),
            React.createElement("p", { style: { fontSize: 11 } },
                "iceGatheringState: ",
                this.state.peerIceGatheringState),
            React.createElement("p", { style: { fontSize: 11 } },
                "signalingState: ",
                this.state.peerSignalingState)));
    }
}
exports.PeerStatus = PeerStatus;
