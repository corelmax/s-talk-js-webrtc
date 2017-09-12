import { AppRegistry } from 'react-native'
import App from './src/App';
import Main from './src/components/Main';
import VideoCall from './src/containers/VideoCall'
import { StackNavigator } from 'react-navigation';

const WebRtcRNDemo = StackNavigator({
//  Home: { screen: App },
  Home: { screen: Main },
  VideoCall: { screen: VideoCall },
});

AppRegistry.registerComponent('WebRtcRNDemo', () => WebRtcRNDemo);
