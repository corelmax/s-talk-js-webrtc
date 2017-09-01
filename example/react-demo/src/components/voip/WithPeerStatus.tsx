import * as React from 'react';
import { EventEmitter } from "events";
import { AbstractPeerConnection } from "../../chitchat/stalk-js-webrtc/index";

interface IPeerStatus {
    peerIceState: string;
    peerIceGatheringState: string;
    peerSignalingState: string;
}
export class PeerStatus extends React.Component<{ peer }, IPeerStatus> {
    peer;

    componentWillMount() {
        this.state = {
            peerIceState: "",
            peerIceGatheringState: "",
            peerSignalingState: ""
        }

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

    peerAdded(peer: AbstractPeerConnection.IPC_Handler) {
        let self = this;
        self.peer = peer;

        let peerEvent = peer.pcEvent as EventEmitter;
        peerEvent.on("oniceconnectionstatechange", event => {
            self.setState(prev => ({ ...prev, peerIceState: event }));
        });
        peerEvent.on("onicegatheringstatechange", event => {
            self.setState(prev => ({ ...prev, peerIceGatheringState: event }));
        });
        peerEvent.on("onsignalingstatechange", event => {
            self.setState(prev => ({ ...prev, peerSignalingState: event }));
        });
    }

    render() {
        return (
            <div>
                <p style={{ fontSize: 11 }}>iceConnectionState: {this.state.peerIceState}</p>
                <p style={{ fontSize: 11 }}>iceGatheringState: {this.state.peerIceGatheringState}</p>
                <p style={{ fontSize: 11 }}>signalingState: {this.state.peerSignalingState}</p>
            </div>
        );
    }
}
