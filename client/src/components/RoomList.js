import React, { Component } from "react";
import Room from "./Room";

export default class RoomList extends Component {
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

  componentDidMount() {
    // Call our fetch function below once the component mounts
    this.callBackendAPI()
      .then(res => this.setState({ data: res.express }))
      .catch(err => console.log(err));
  }
  // Fetches our GET route from the Express server. (Note the route we are fetching matches the GET route from server.js
  callBackendAPI = async () => {
    const response = await fetch("/express_backend");
    const body = await response.json();

    if (response.status !== 200) {
      throw Error(body.message);
    }
    return body;
  };
  render() {
    return (
      <div className="center">
        <div style={this.style.roomHeader}>ROOMS</div>
        <div style={this.style.roomBox}>
          {this.state.rooms.map(room => (
            <Room key={room.id} name={room.name} available={room.available} />
          ))}
        </div>
      </div>
    );
  }

  style = {
    roomBox: {
      height: "70vh",
      width: "80vw",
      border: "1px solid #333",
      borderBottomLeftRadius: "10px",
      borderBottomRightRadius: "10px",
      background: "linear-gradient(-45deg, #56CCF2, #2F80ED)",
      color: "aliceblue",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      overflowX: "auto"
    },
    roomHeader: {
      height: "50px",
      borderTopLeftRadius: "10px",
      borderTopRightRadius: "10px",
      borderBottom: "2px solid #000",
      width: "80vw",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      fontSize: "25px",
      fontWeight: "bold",
      color: "#000",
      background: "linear-gradient(0deg, #FF4E50, #F9D423)"
    }
  };
}