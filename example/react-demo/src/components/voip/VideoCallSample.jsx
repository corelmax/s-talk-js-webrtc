import * as React from "react";
// import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { WebRtcPage } from "./WebRtcComponent";
class VideoCall extends React.Component {
    constructor(props) {
        super(props);
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
