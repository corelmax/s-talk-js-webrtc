import * as React from "react";
// import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { WebRtcPage } from "./WebRtcComponent";
function getEl(idOrEl) {
    if (typeof idOrEl === 'string') {
        return document.getElementById(idOrEl);
    }
    else {
        return idOrEl;
    }
}
;
class VideoCall extends React.Component {
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
    render() {
        return (<WebRtcPage onClose={this.onClose}/>);
    }
}
export const VideoCallSample = withRouter(VideoCall);
