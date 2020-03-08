import React, { Component } from "react";
import Room from "./Room";
import { withRouter } from "react-router-dom";

class RoomList extends Component {
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
      <div className="center">
        <div style={this.style.roomHeader}>ROOMS</div>
        <div style={this.style.roomBox}>
          {this.state.rooms.map(room => (
            <Room key={room.id} name={room.name} available={room.available} socket={this.props.socket}/>
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
      background: "linear-gradient(0deg, rgb(252, 234, 187), rgb(240, 220, 0))",
    }
  };
}

export default withRouter(RoomList);