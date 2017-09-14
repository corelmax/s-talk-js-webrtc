import * as React from 'react';
import Flexbox from 'flexbox-react'; import {
    withRouter
} from 'react-router-dom';
import { withState, compose } from "recompose";
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import FontIcon from 'material-ui/FontIcon';
import * as Colors from "material-ui/styles/colors";

class HomeComponent extends React.Component<{ history }, { roomName: string }> {
    constructor(props) {
        super(props);

        this.state = {
            roomName: ""
        };
        this.setRoomName = this.setRoomName.bind(this);
        this.onVideoCall = this.onVideoCall.bind(this);
    }
    setRoomName(roomName) {
        this.setState({ roomName: roomName });
    }
    onVideoCall(roomName) {
        this.props.history.push(`/${this.state.roomName}`);
    };
    onError(error) {
        console.log(error);
    }
    render() {
        return (
            <Flexbox height="100vh" style={{ backgroundColor: Colors.blueGrey50 }}>
                <Flexbox flexDirection="column" alignItems="center" width="100%" flexGrow={1}>
                    <p> S-Talk Videocall experiment.</p>
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
                    <RaisedButton label="Create or enter room" primary={true} style={{ margin: 10 }}
                        onClick={() => (this.state.roomName.length > 0) ?
                            this.onVideoCall(this.state.roomName) :
                            this.onError("Room name is missing")
                        } />
                    {/* <FontIcon
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
      </FontIcon> */}
                </Flexbox>
            </Flexbox>
        );
    }
}

export const Home = withRouter(HomeComponent);