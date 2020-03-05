import React, { Component } from "react";
import Canvas from "../components/Canvas";

export default class RoomPage extends Component {
  render() {
    return (
      <div style={style.container}>
      <header style={style.header}>
        {this.props.match.params.roomName}
      </header>
      <Canvas />
      </div>
    );
  }
}

const style = {
  container: {
    display: "flex",
    flexDirection: "column",
  },
  header: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    width: "100vw",
    background: "linear-gradient(-45deg, rgb(86, 204, 242), rgb(47, 128, 237))",
    height: "6vh",
    textTransform: "uppercase",
    fontSize: "25px",
    fontWeight: "bold"
  },
}