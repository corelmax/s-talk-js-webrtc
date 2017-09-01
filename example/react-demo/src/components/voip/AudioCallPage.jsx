import * as React from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { shallowEqual, compose } from "recompose";
import Flexbox from "flexbox-react";
import { CallingEvents } from "stalk-js";
import * as Colors from "material-ui/styles/colors";
import * as chatroom from "../../chitchat/chats/redux/chatroom/";
import * as calling from "../../chitchat/calling/";
import { WithDialog } from "../toolsbox/DialogBoxEnhancer";
import { SimpleToolbar } from "../../components/SimpleToolbar";
import { WebRtcAudio } from "./";
class AudioCall extends React.Component {
    constructor(props) {
        super(props);
        this.onBackPressed = this.onBackPressed.bind(this);
        this.onTitlePressed = this.onTitlePressed.bind(this);
    }
    componentWillMount() {
        if (!this.props.teamReducer.team) {
            this.props.history.replace("/");
        }
    }
    componentWillReceiveProps(nextProps) {
        let prevInline = this.props.stalkReducer.get("inline");
        let nextInline = nextProps.stalkReducer.get("inline");
        if (!nextInline && !shallowEqual(nextInline, prevInline)) {
            this.onBackPressed();
        }
        let { alertReducer: { error } } = nextProps;
        if (!shallowEqual(this.props.alertReducer.error, error) && !!error) {
            this.props.onError(error);
        }
        if (!error && this.props.alertReducer.error) {
            this.props.history.goBack();
        }
    }
    componentWillUnmount() {
        this.props.dispatch(calling.onVideoCallEnded());
        let { match, userReducer: { user }, stalkReducer } = this.props;
        if (!user)
            return;
        let room_id = match.params.id;
        let room = chatroom.getRoom(room_id);
        let targets = new Array();
        if (!!room && room.members.length > 0) {
            room.members.map(value => {
                if (value._id !== user._id) {
                    targets.push(value._id);
                }
            });
        }
        this.props.dispatch(calling.hangupCallRequest({ target_ids: targets, user_id: user._id }));
    }
    onBackPressed() {
        // Jump to main menu.
        this.props.history.goBack();
    }
    onTitlePressed() {
        let { history, teamReducer } = this.props;
        history.replace(`/team/${teamReducer.team._id}`);
    }
    onJoinedRoom(roomname) {
        let self = this;
        let { match, userReducer: { user }, stalkReducer } = this.props;
        if (!user)
            return;
        let incommingCall = stalkReducer.get("incommingCall");
        if (!!incommingCall) {
            self.props.dispatch(calling.onCalling(incommingCall.payload.room_id));
        }
        else {
            let room_id = match.params.id;
            self.props.dispatch(calling.onCalling(room_id));
            let room = chatroom.getRoom(room_id);
            let targets = new Array();
            if (!!room) {
                room.members.map(value => {
                    if (value._id !== user._id) {
                        targets.push(value._id);
                    }
                });
            }
            this.props.dispatch(calling.callling_Epic({
                target_ids: targets, user_id: user._id, room_id: match.params.id,
                calllingType: CallingEvents.VoiceCall
            }));
        }
    }
    render() {
        let { team } = this.props.teamReducer;
        let remoteUser = {
            avatar: null,
            username: '',
        };
        let room_id = this.props.match.params.id;
        let room = chatroom.getRoom(room_id);
        if (!!room) {
            remoteUser = {
                avatar: room.image,
                username: room.name,
            };
        }
        return (<Flexbox flexDirection="column" height="100vh" style={{ backgroundColor: Colors.blueGrey50 }}>
                <div style={{ position: "relative", height: "56px" }}>
                    <div style={{ position: "fixed", width: "100%", zIndex: 1 }}>
                        <SimpleToolbar title={(!!team) ? team.name.toUpperCase() : ""} onBackPressed={this.onBackPressed} onPressTitle={this.onTitlePressed}/>
                    </div>
                </div>
                <WebRtcAudio remoteUser={remoteUser} user={this.props.userReducer.user} onJoinedRoom={this.onJoinedRoom.bind(this)} onError={this.props.onError}/>
            </Flexbox>);
    }
}
const mapStateToProps = (state) => {
    return {
        userReducer: state.userReducer,
        alertReducer: state.alertReducer,
        teamReducer: state.teamReducer,
        stalkReducer: state.stalkReducer,
    };
};
const enhance = compose(WithDialog, withRouter, connect(mapStateToProps));
export const AudioCallPage = enhance(AudioCall);
