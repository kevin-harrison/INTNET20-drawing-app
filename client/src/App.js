import React, { Component } from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";
import "./App.css";
import RoomList from "./components/RoomList";
import Footer from "./components/Footer";
import Login from "./pages/Login";
import RoomPage from "./pages/RoomPage";
import "./fonts/Doodle.ttf";
import withAuth from "./components/withAuth";

class App extends Component {
  state = {
    data: {
      socket: null
    }
  };

  setSocket = socket => {
    this.state.data.socket = socket;
  };

  render() {
    return (
      <>
        <Router>
          <div
            className="App"
            style={{
              height: "100vh",
              margin: "0"
            }}
          >
            <Switch>
              <Route
                path="/rooms"
                // TODO Auth works but doesnt send socket data
                /* component={withAuth(RoomList)} */
                render={props => <RoomList {...props} socket={this.state.data.socket} />}
              />
              <Route
                path="/room/:roomName"
                // TODO Auth works but doesnt send socket data
                /* component={withAuth(RoomPage)} */
                render={props => <RoomPage {...props} socket={this.state.data.socket} />}
              />
              {/* The '/' route needs to be at the bottom in order to catch all other routes
            that fail to match previous Route paths */}
              <Route
                path="/"
                render={props => <Login {...props} setSocket={this.setSocket} />}
              />
            </Switch>
            <Footer />
          </div>
        </Router>
      </>
    );
  }
}

export default App;
