import React, { Component } from "react";
import { Link } from "react-router-dom";

export default class Room extends Component {

  render() {
    return (
      <Link to={`/room/${this.props.name}`} style={style}>
        {this.props.name}
      </Link>
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
      backgroundColor: "rgb(31, 224, 86)",
}