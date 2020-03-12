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
  // TODO: I think we can solve losing of sockets on refresh by checking
  // here if we are authorized and if so create a socket
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
      console.log(`Socket ${socket.id} reconnect error.`);
    });

    // Needs to happen after we define the socket listeners
    this.setState({ socket: socket});
  };

  componentDidMount() {
    fetch('/api/isAuthorized')
      .then(res => {
        if (res.status === 200) {
          this.setSocket();
        }
      });
  }

  render() {
    // Create component or redirect based on if authorized
    const AuthedRoomList = withAuth(RoomList);
    const AuthedRoom = withAuth(RoomPage);
    
    return (
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
              render = {props => (
                <SocketContext.Provider value={this.state.socket}><AuthedRoomList {...props}/></SocketContext.Provider>
              )}
            />
            <Route
              path="/room/:roomName"
              render = {props => (
                <SocketContext.Provider value={this.state.socket}><AuthedRoom {...props}/></SocketContext.Provider>
              )}
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
    );
  }
}

export default App;
