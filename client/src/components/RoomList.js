import React, { Component } from "react";
import Room from "./Room";
import Footer from "../components/Footer";
import SocketContext from "../components/SocketContext";

class RoomListInSocketContext extends Component {
  constructor(props) {
    super(props);
    this.state = {
      rooms: null,
      newRoomName: ""
    };
    this.updateNewRoomName = this.updateNewRoomName.bind(this);
    this.createRoom = this.createRoom.bind(this);
    this.deleteRoom = this.deleteRoom.bind(this);
  }

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
      return this.state.rooms.map(room => (
        <Room
          key={room.name}
          name={room.name}
          owner={room.owner}
        />
      ));
    });
  }

  updateNewRoomName(event) {
    this.setState({ newRoomName: event.target.value });
  }

  createRoom() {
    fetch("/api/roomList/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        roomName: this.state.newRoomName
      })
    });
  }

  deleteRoom(roomName) {
    fetch("/api/roomList/delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        roomName: roomName
      })
    });
  }

  createSocketListeners() {
    this.props.socket.on("room_created", (userName, roomName) => {
      console.log(`${userName} created room: ${roomName}`);
      const newRoom = { name: roomName, owner: userName };
      this.setState({ rooms: this.state.rooms.concat(newRoom) });
    });

    this.props.socket.on("room_deleted", (userName, roomName) => {
      console.log(`${userName} deleted room: ${roomName}`);
      const newRooms = this.state.rooms.filter(room => room.name !== roomName);
      this.setState({ rooms: newRooms });
    });
  }

  render() {
    return (
      <>
        <div className="center">
          <div style={this.style.roomHeader}>ROOMS</div>
          <div style={this.style.roomBox}>
            {this.state.rooms
              ? this.state.rooms.map(room => (
                  <Room
                    key={room.name}
                    name={room.name}
                    owner={room.owner}
                    deleteRoom={this.deleteRoom}
                  />
                ))
              : "Loading"}
            <div style={this.style.newRoom}>
              <input
                id="newRoomName"
                name="newRoomName"
                type="text"
                placeholder="Name your room"
                style={this.style.roomNameInput}
                onChange={this.updateNewRoomName}
              />
              <button onClick={this.createRoom}>+</button>
            </div>
          </div>
        </div>
        <Footer history={this.props.history} />
      </>
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
    },
    newRoom: {
      height: "40px",
      width: "100%",
      display: "flex",
      justifyContent: "space-evenly",
      alignItems: "center",
      borderBottom: "1px solid #444",
      backgroundColor: "rgb(200, 200, 200)"
    },
    roomNameInput: {
      height: "30px",
      borderRadius: "8px",
      fontFamily: "Doodle",
      fontSize: "20px",
      color: "#000",
      paddingLeft: "5px"
    },
    addRoomButton: {
      height: "30px",
      width: "30px",
      color: "#fff",
      backgroundColor: "rgb(120, 205, 104)"
    }
  };
}

const RoomList = props => (
  <SocketContext.Consumer>
    {socket => <RoomListInSocketContext {...props} socket={socket} />}
  </SocketContext.Consumer>
);

export default RoomList;
