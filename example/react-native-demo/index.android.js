import { AppRegistry } from 'react-native'
import App from './src/App'
import VideoCall from './src/containers/VideoCall'
import { StackNavigator } from 'react-navigation';

const WebRtcRNDemo = StackNavigator({
  Home: { screen: App },
  VideoCall: { screen: VideoCall },
});

AppRegistry.registerComponent('WebRtcRNDemo', () => WebRtcRNDemo);
