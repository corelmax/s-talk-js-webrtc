import * as React from "react";
import * as ReactDOM from "react-dom";
// import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { shallowEqual, compose } from "recompose";
import Flexbox from "flexbox-react";

import { WebRtcPage } from "./WebRtcComponent";

class VideoCall extends React.Component<{ roomname, history }, any> {
    constructor(props) {
        super(props);

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
