import React, { Component } from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect
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
    data: null,
    rooms: [
      {
        id: 1,
        name: "Room 1",
        available: true
      },
      {
        id: 2,
        name: "Room 2",
        available: false
      },
      {
        id: 3,
        name: "Room 3",
        available: true
      }
    ]
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
              <Route path="/rooms" component={withAuth(RoomList)} />
              <Route exact path="/room/:roomName" component={withAuth(RoomPage)} />
              {/* The '/' route needs to be at the bottom in order to catch all other routes
            that fail to match previous Route paths */}
              <Route exact path="/" component={Login} />
            </Switch>
            <Footer />
          </div>
        </Router>
      </>
    );
  }
}

export default App;
