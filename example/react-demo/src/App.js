//@ts-check

import React, { Component } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Link
} from 'react-router-dom';
import './App.css';
import { MuiThemeProvider, getMuiTheme } from "material-ui/styles";

import { Home } from "./containers/Home";
import { VideoCallSample } from "./components/voip/VideoCallSample";

class App extends Component {
  render() {
    return (
      <MuiThemeProvider>
        <Router>
          <div>
            <Route exact path="/" component={Home} />
            <Route path="/:name" component={VideoCallSample} />
            {/* <Route path="/topics" component={Topics} /> */}
          </div>
        </Router>
      </MuiThemeProvider>
    );
  }
}

export default App;
