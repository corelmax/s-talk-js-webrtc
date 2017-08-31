import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

import { VideoCallSample } from "./components/voip/VideoCallSample";

class App extends Component {
  render() {
    return (
      <div className="App">
        <VideoCallSample />
      </div>
    );
  }
}

export default App;
