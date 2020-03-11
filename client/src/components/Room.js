import React, { Component } from "react";
import { Link } from "react-router-dom";

export default class Room extends Component {
  render() {
    return (
      <div style={style.room}>
        <Link to={`/room/${this.props.name}`} style={style.linkarea}>
          <p>{this.props.name}</p>
        </Link>
        <div
          onClick={() => this.props.deleteRoom(this.props.name)}
          style={style.deletebutton}
        >
          Del.
        </div>
      </div>
    );
  }
}

const style = {
  room: {
    height: "50px",
    width: "100%",
    borderBottom: "1px solid #444",
    textDecoration: "none",
    backgroundColor: "rgb(31, 224, 86)"
  },
  linkarea: {
    fontWeight: "bold",
    color: "aliceblue",
    textDecoration: "none",
    fontSize: "22px",
    width: "80%",
    height: "100%",
    display: "inline-flex",
    justifyContent: "center",
    alignItems: "center"
  },
  deletebutton: {
    width: "18%",
    marginRight: "2%",
    height: "84%",
    background: "#c03020",
    borderRadius: "10px",
    display: "inline-flex",
    justifyContent: "center",
    alignItems: "center",
    boxShadow: "2px 2px 1px 0px rgba(0,0,0,0.75)",
    fontSize: "22px",
    fontFamily: "Doodle",
    letterSpacing: "2px",
  }
};
