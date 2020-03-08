import React, { Component } from "react";
import Canvas from "../components/Canvas";
import backbuttonimg from "../img/backbutton.png";

export default class RoomPage extends Component {
  render() {
    return (
      <div style={style.container}>
        <header style={style.header}>
          <div style={style.backbutton} onClick={() => {this.props.history.push("/rooms")}}></div>
          <div
            style={style.roomname}
            
          >
            {this.props.match.params.roomName}
          </div>
        </header>
        <Canvas
          roomName={this.props.match.params.roomName}
          socket={this.props.socket}
        />
      </div>
    );
  }
}

const style = {
  container: {
    display: "flex",
    flexDirection: "column"
  },
  header: {
    position: "absolute",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    width: "100vw",
    background: "linear-gradient(-45deg, rgb(86, 204, 242), rgb(47, 128, 237))",
    height: "6vh",
    borderBottom: "2px solid #ccc",
    textTransform: "uppercase",
    fontSize: "25px",
    fontWeight: "bold"
  },
  backbutton: {
    backgroundImage: `url(${backbuttonimg})`,
    backgroundSize: "34px",
    width: "34px",
    height: "34px",
    marginLeft: "2vw"
  },
  roomname: {
    margin: "auto"
  }
};
