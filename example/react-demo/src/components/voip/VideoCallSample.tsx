import * as React from "react";
import * as ReactDOM from "react-dom";
// import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { shallowEqual, compose } from "recompose";
import Flexbox from "flexbox-react";

import { WebRtcPage } from "./WebRtcComponent";
import { PeerStatus } from "./WithPeerStatus";

interface IComponentNameState {
    selfViewSrc;
    remoteSrc;
    isMuteVoice;
    isPauseVideo;
    remoteVolume;
    micVol;
    peer;
    isHoverPeer;
    localStreamStatus: string;
}


function getEl(idOrEl) {
    if (typeof idOrEl === 'string') {
        return document.getElementById(idOrEl);
    } else {
        return idOrEl;
    }
};

class VideoCall extends React.Component<{ roomname, history }, IComponentNameState> {
    remotesView;
    selfView;
    selfAudioName: string;
    selfVideoName: string;

    constructor(props) {
        super(props);

        this.state = {
            isMuteVoice: false,
            isPauseVideo: false,
            micVol: 100,
            selfViewSrc: null,
            remoteSrc: null,
            peer: null,
            remoteVolume: 100,
            isHoverPeer: false,
            localStreamStatus: ""
        };

        this.onClose = this.onClose.bind(this);
    }

    onClose() {
        this.props.history.replace("/");
    }

    render(): JSX.Element {
        return (
            <WebRtcPage onClose={this.onClose} />
        );
    }
}

export const VideoCallSample = withRouter(VideoCall);
