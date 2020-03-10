import React, { Component } from "react";
import Room from "./Room";
import { withRouter } from "react-router-dom";

class RoomList extends Component {
  state = {
    rooms: null
  };

  componentDidMount() {
    this.createSocketListeners();
    this.setRooms();
  }

  async setRooms() {
    const resp = await fetch("/api/roomList");
    const promiseValue = await resp.json();
    this.setState({ rooms: promiseValue.roomList });
  }

  getRooms() {
    this.setRooms().then(() => {
      console.log(this.state.rooms);
      console.log(this.state.rooms[0]);
      return this.state.rooms.map(room => (
        <Room
          key={room.name}
          name={room.name}
          available={room.available}
          socket={this.props.socket}
        />
      ));
    });
  }

  createSocketListeners(){
    this.props.socket.on('room_created', (userName, roomName) => {
      console.log(`${userName} created room: ${roomName}`);
      const newRoom = { name: roomName, owner: userName };
      this.setState({ rooms: this.state.rooms.concat(newRoom) });
    });

    this.props.socket.on('room_deleted', (userName, roomName) => {
      console.log(`${userName} deleted room: ${roomName}`);
      const newRooms = this.state.rooms.filter(room => room.name !== roomName);
      this.setState({ rooms: newRooms });
    });
  }

  render() {
    return (
      <div className="center">
        <div style={this.style.roomHeader}>ROOMS</div>
        <div style={this.style.roomBox}>
          {this.state.rooms ? (
            this.state.rooms.map(room => (
              <Room
                key={room.name}
                name={room.name}
                owner={room.owner}
                socket={this.props.socket}
              />
            ))
          ) : (
            "Loading"
          )}
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
      background: "linear-gradient(0deg, rgb(252, 234, 187), rgb(240, 220, 0))"
    }
  };
}

export default withRouter(RoomList);
