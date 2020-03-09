import React, { Component } from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import "./App.css";
import RoomList from "./components/RoomList";
import Footer from "./components/Footer";
import Login from "./pages/Login";
import RoomPage from "./pages/RoomPage";
import "./fonts/Doodle.ttf";
import withAuth from "./components/withAuth";

class App extends Component {
  state = {
    socket: null
  };

  setSocket = socket => {
    this.state.socket = socket;
    console.log(`In setSocket ${this.state.socket}`);
  };

  getSocket = () => {
    console.log(`In GETSocket ${this.state.socket}`);
    return this.state.socket;
  };

  render() {
    console.log(this.props);
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
            <Footer />
          </div>
        </Router>
      </>
    );
  }
}

export default App;
