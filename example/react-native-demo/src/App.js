import React, { Component } from 'react'
import { StyleSheet, Text, View } from 'react-native';
import WebView from './components/WebView'

class App extends Component {
    state = {}
    static navigationOptions = {
        title: 'Welcome',
        header: null
    }

    render() {
        const { navigate } = this.props.navigation; //onPress={() => navigate('Call')}
        return (
            <WebView navigate={navigate} />
        );
    }
}

export default App;