import React, { Component } from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import "./App.css";
import RoomList from "./components/RoomList";
import Login from "./pages/Login";
import RoomPage from "./pages/RoomPage";
import "./fonts/Doodle.ttf";
import withAuth from "./components/withAuth";
import io from 'socket.io-client';

class App extends Component {
  state = {
    socket: null,
    manager: null
  };

  setSocket = () => {
    const socket = io();
    
    socket.on('disconnect', () => {
      console.log(`Socket ${socket} disconnected`);
    });

    socket.on('line_drawn', () => {
      console.log(`Socket ${socket.id} receive a line drawn`);
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
