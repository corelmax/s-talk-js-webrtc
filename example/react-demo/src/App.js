import React, { Component } from 'react';
import { withState, compose } from "recompose";
import logo from './logo.svg';
import './App.css';
import { MuiThemeProvider, getMuiTheme } from "material-ui/styles";
import TextField from 'material-ui/TextField';
import FontIcon from 'material-ui/FontIcon';
import * as Colors from "material-ui/styles/colors";

import { VideoCallSample } from "./components/voip/VideoCallSample";


const onVideoCall = ({ history, roomName }) => {
  history.push(`/groupcall/${roomName}`);
};
const enhance = compose(
  withState('roomName', 'setRoomName', "")
);
var VideoCallCreateRoomSample = enhance(({ roomName, setRoomName, history, onError }) => (
  <div>

  </div>
));

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      roomName: "",
      call: false
    };
    this.setRoomName = this.setRoomName.bind(this);
    this.onVideoCall = this.onVideoCall.bind(this);
    this.endCall = this.endCall.bind(this);
  }

  setRoomName(roomName) {
    this.setState({ roomName: roomName });
  }
  onVideoCall = (roomName) => {
    this.setState({ call: !this.state.call });
  };
  endCall() {
    this.setState(prev => ({ ...prev, call: false, roomname: "" }));
  }
  onError(error) {
    console.log(error);
  }

  render() {
    return (
      <MuiThemeProvider>
        <div className="App">
          <p> Videocall room experiment.</p>
          <TextField
            id="text-field-controlled"
            hintText="Enter videocall room name"
            value={this.state.roomName}
            onChange={(event) => this.setRoomName(event.target.value)}
            onKeyUp={(event) => {
              if (event.keyCode === 13) {
                if (this.state.roomName.length > 0) {
                  this.onVideoCall(this.state.roomName);
                }
                else {
                  this.onError("Room name is missing")
                }
              }
            }}
          />
          <FontIcon
            className="material-icons"
            style={{ marginRight: 24, fontSize: 48, cursor: 'pointer' }}
            color={Colors.lightGreen500}
            onClick={() => (this.state.roomName.length > 0) ?
              this.onVideoCall(this.state.roomName) :
              this.onError("Room name is missing")}
          >
            video_call
      </FontIcon>
          <FontIcon
            className="material-icons"
            style={{ marginRight: 24, fontSize: 48, cursor: 'pointer' }}
            color={Colors.red500}
            onClick={this.endCall}
          >
            call_end
      </FontIcon>
          {
            (this.state.call) ?
              <VideoCallSample roomname={this.state.roomName} /> : null
          }
        </div>
      </MuiThemeProvider>
    );
  }
}

export default App;
