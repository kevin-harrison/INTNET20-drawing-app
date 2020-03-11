import React, { Component } from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import io from 'socket.io-client';
// Style
import "./App.css";
import "./fonts/Doodle.ttf";
// Components
import withAuth from "./components/withAuth";
import RoomList from "./components/RoomList";
import SocketContext from "./components/SocketContext";
import Login from "./pages/Login";
import RoomPage from "./pages/RoomPage";

class App extends Component {
  state = {
    socket: null
  };

  setSocket = () => {
    const socket = io();
    
    socket.on('disconnect', () => {
      console.log(`Socket ${socket} disconnected`);
    });
    socket.on('connect', () => {
      console.log(`Socket ${socket.id} connected`);
    });
    socket.on('reconnect_attempt', () => {
      console.log(`Socket ${socket.id} reconnecting attempt...`);
    });
    socket.on('reconnecting', () => {
      console.log(`Socket ${socket.id} reconnecting...`);
    });
    socket.on('reconnect', () => {
      console.log(`Socket ${socket.id} reconnected!!!!`);
    });
    socket.on('reconnect_error', () => {
      console.log(`Socket ${socket.id} reconnect failed.`);
    });

    this.setState({ socket: socket});
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
              <SocketContext.Provider value={this.state.socket}>
                <Route
                  path="/rooms"
                  component={withAuth(RoomList)}
                />
                {/* <Route
                  path="/room/:roomName"
                  component={withAuth(RoomPage)}
                /> */}
              </SocketContext.Provider>
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
