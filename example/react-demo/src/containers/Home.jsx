import * as React from 'react';
import Flexbox from 'flexbox-react';
import { withRouter } from 'react-router-dom';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
class HomeComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            roomName: ""
        };
        this.setRoomName = this.setRoomName.bind(this);
        this.onVideoCall = this.onVideoCall.bind(this);
        this.endCall = this.endCall.bind(this);
    }
    setRoomName(roomName) {
        this.setState({ roomName: roomName });
    }
    onVideoCall(roomName) {
        // this.setState({ call: !this.state.call });
        this.props.history.push(`/${this.state.roomName}`);
    }
    ;
    endCall() {
        this.setState(prev => ({ ...prev, call: false, roomname: "" }));
    }
    onError(error) {
        console.log(error);
    }
    render() {
        return (<div>
                <Flexbox flexDirection="column" alignItems="center" width="100%" flexGrow={1}>
                    <p> S-Talk Videocall experiment.</p>
                    <TextField id="text-field-controlled" hintText="Enter videocall room name" value={this.state.roomName} onChange={(event) => this.setRoomName(event.target.value)} onKeyUp={(event) => {
            if (event.keyCode === 13) {
                if (this.state.roomName.length > 0) {
                    this.onVideoCall(this.state.roomName);
                }
                else {
                    this.onError("Room name is missing");
                }
            }
        }}/>
                    <RaisedButton label="Create or enter room" primary={true} style={{ margin: 10 }} onClick={() => (this.state.roomName.length > 0) ?
            this.onVideoCall(this.state.roomName) :
            this.onError("Room name is missing")}/>
                    
                </Flexbox>
            </div>);
    }
}
export const Home = withRouter(HomeComponent);
