import React, { Component } from "react";
import { Link } from "react-router-dom";

export default class Room extends Component {
  render() {
    return (
      <div style={style}>
        <Link to={`/room/${this.props.name}`}>
          {this.props.name}
        </Link>
        <button onClick={() => this.props.deleteRoom(this.props.name)}>-</button>
      </div>
    );
  }
}

const style = {
  height: "40px",
  width: "100%",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  fontWeight: "bold",
  color: "aliceblue",
  borderBottom: "1px solid #444",
  textDecoration: "none",
  backgroundColor: "rgb(31, 224, 86)"
};
