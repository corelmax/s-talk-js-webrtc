import * as React from 'react';
import { Text, View, } from 'react-native';
export class PeerStatus extends React.Component {
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
        return (
            <View>
                <Text style={{ fontSize: 11 }}>iceConnectionState: {this.state.peerIceState}</Text>
                <Text style={{ fontSize: 11 }}>iceGatheringState: {this.state.peerIceGatheringState}</Text>
                <Text style={{ fontSize: 11 }}>signalingState: {this.state.peerSignalingState}</Text>
            </View>
        );
    }
}


