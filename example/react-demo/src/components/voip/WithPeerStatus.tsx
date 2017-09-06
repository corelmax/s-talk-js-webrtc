import * as React from 'react';
import { EventEmitter } from "events";
import { IPC_Handler, AbstractPeerConnection } from "stalk-js-webrtc";

interface IPeerStatus {
    peerIceState: string;
    peerIceGatheringState: string;
    peerSignalingState: string;
    peerEvent: string;
}
export class PeerStatus extends React.Component<{ peer }, IPeerStatus> {
    peer: IPC_Handler;

    componentWillMount() {
        this.state = {
            peerIceState: "",
            peerIceGatheringState: "",
            peerSignalingState: "",
            peerEvent: ""
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

    peerAdded(peer: IPC_Handler) {
        let self = this;
        self.peer = peer as IPC_Handler;

        let peerEvent = peer.pcEvent as EventEmitter;
        peerEvent.on(AbstractPeerConnection.PeerEvent, (data) => {
            self.setState(prev => ({ ...prev, peerEvent: data }));
        });
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
                <p style={{ fontSize: 11 }}>iceConnectionState: {this.state.peerEvent}</p>
                <p style={{ fontSize: 11 }}>iceConnectionState: {this.state.peerIceState}</p>
                <p style={{ fontSize: 11 }}>iceGatheringState: {this.state.peerIceGatheringState}</p>
                <p style={{ fontSize: 11 }}>signalingState: {this.state.peerSignalingState}</p>
            </div>
        );
    }
}
