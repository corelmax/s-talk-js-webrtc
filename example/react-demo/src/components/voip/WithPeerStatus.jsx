import * as React from 'react';
import { AbstractPeerConnection } from "stalk-js-webrtc";
export class PeerStatus extends React.Component {
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
    peerAdded(peer) {
        let self = this;
        self.peer = peer;
        let peerEvent = peer.pcEvent;
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
        return (<div>
                <p style={{ fontSize: 11 }}>iceConnectionState: {this.state.peerEvent}</p>
                <p style={{ fontSize: 11 }}>iceConnectionState: {this.state.peerIceState}</p>
                <p style={{ fontSize: 11 }}>iceGatheringState: {this.state.peerIceGatheringState}</p>
                <p style={{ fontSize: 11 }}>signalingState: {this.state.peerSignalingState}</p>
            </div>);
    }
}
