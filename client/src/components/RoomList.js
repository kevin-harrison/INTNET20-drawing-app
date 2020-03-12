import React, { Component } from "react";
import Room from "./Room";
import Footer from "../components/Footer";
import SocketContext from "../components/SocketContext";
import createPopup from "../components/Popup";

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
    if (this.state.newRoomName.trim() === "") {
      return;
    }
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
    }).then((res) => {
      if (!res.ok) {
        createPopup(`Only the owner of the room can remove it.`, 2, 4000, "error");
      }
    });
  }

  createSocketListeners() {
    if(this.props.socket) {
      this.props.socket.off('connect');
      this.props.socket.on('connect', () => {
        console.log(`Socket ${this.props.socket.id} connected`);
        this.props.socket.emit('connected', 'roomList');
      });

      this.props.socket.on("room_created", (userName, roomName) => {
        const newRoom = { name: roomName, owner: userName };
        this.setState({ rooms: this.state.rooms.concat(newRoom) });
      });
  
      this.props.socket.on("room_deleted", (userName, roomName) => {
        const newRooms = this.state.rooms.filter(room => room.name !== roomName);
        this.setState({ rooms: newRooms });
      });
    }
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
              <div
                onClick={this.createRoom}
                style={this.style.addRoomButton}
              >
                +
              </div>
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
      height: "50px",
      width: "100%",
      display: "flex",
      justifyContent: "space-evenly",
      alignItems: "center",
      borderBottom: "1px solid #444",
      backgroundColor: "rgb(200, 200, 200)"
    },
    roomNameInput: {
      height: "30px",
      width: "50%",
      margin: "auto",
      borderRadius: "8px",
      fontFamily: "Doodle",
      fontSize: "20px",
      color: "#000",
      paddingLeft: "5px"
    },
    addRoomButton: {
      width: "18%",
      marginRight: "2%",
      height: "84%",
      background: "rgb(111, 214, 10)",
      borderRadius: "10px",
      display: "inline-flex",
      justifyContent: "center",
      alignItems: "center",
      boxShadow: "2px 2px 1px 0px rgba(0,0,0,0.75)",
      fontSize: "37px",
      paddingTop: "1%",
      fontFamily: "Doodle",
      letterSpacing: "2px",
      color: "#fff",
      cursor: "pointer"
    }
  };
}

const RoomList = props => (
  <SocketContext.Consumer>
    {socket => <RoomListInSocketContext {...props} socket={socket} />}
  </SocketContext.Consumer>
);

export default RoomList;
