"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const react_redux_1 = require("react-redux");
const react_router_dom_1 = require("react-router-dom");
const recompose_1 = require("recompose");
const flexbox_react_1 = require("flexbox-react");
const stalk_js_1 = require("stalk-js");
const Colors = require("material-ui/styles/colors");
const chatroom = require("../../chitchat/chats/redux/chatroom/");
const calling = require("../../chitchat/calling/");
const DialogBoxEnhancer_1 = require("../toolsbox/DialogBoxEnhancer");
const SimpleToolbar_1 = require("../../components/SimpleToolbar");
const _1 = require("./");
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
        if (!nextInline && !recompose_1.shallowEqual(nextInline, prevInline)) {
            this.onBackPressed();
        }
        let { alertReducer: { error } } = nextProps;
        if (!recompose_1.shallowEqual(this.props.alertReducer.error, error) && !!error) {
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
                calllingType: stalk_js_1.CallingEvents.VoiceCall
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
        return (React.createElement(flexbox_react_1.default, { flexDirection: "column", height: "100vh", style: { backgroundColor: Colors.blueGrey50 } },
            React.createElement("div", { style: { position: "relative", height: "56px" } },
                React.createElement("div", { style: { position: "fixed", width: "100%", zIndex: 1 } },
                    React.createElement(SimpleToolbar_1.SimpleToolbar, { title: (!!team) ? team.name.toUpperCase() : "", onBackPressed: this.onBackPressed, onPressTitle: this.onTitlePressed }))),
            React.createElement(_1.WebRtcAudio, { remoteUser: remoteUser, user: this.props.userReducer.user, onJoinedRoom: this.onJoinedRoom.bind(this), onError: this.props.onError })));
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
const enhance = recompose_1.compose(DialogBoxEnhancer_1.WithDialog, react_router_dom_1.withRouter, react_redux_1.connect(mapStateToProps));
exports.AudioCallPage = enhance(AudioCall);
