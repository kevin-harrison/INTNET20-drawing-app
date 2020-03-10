import React, { Component } from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import "./App.css";
import RoomList from "./components/RoomList";
import Login from "./pages/Login";
import RoomPage from "./pages/RoomPage";
import "./fonts/Doodle.ttf";
import withAuth from "./components/withAuth";

class App extends Component {
  state = {
    socket: null
  };

  setSocket = socket => {
    // Manually enables reconnects
    socket.on('disconnect', () =>{
      socket.connect();
    });

    this.state.socket = socket;
  };

  getSocket = () => {
    return this.state.socket;
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
                component={withAuth(RoomList, this.getSocket)}
              />
              <Route
                path="/room/:roomName"
                component={withAuth(RoomPage, this.getSocket)}
              />
              <Route
                path="/"
                render={props => (
                  <Login {...props} setSocket={this.setSocket} />
                )}
              />
            </Switch>
          </div>
        </Router>
      </>
    );
  }
}

export default App;
