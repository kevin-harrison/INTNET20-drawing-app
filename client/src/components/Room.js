import React, { Component } from "react";
import { Link } from "react-router-dom";

export default class Room extends Component {
  getStyle = () => {
    let style = {
      height: "40px",
      width: "100%",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      fontWeight: "bold",
      color: "aliceblue",
      borderBottom: "1px solid #444"
    };
    if (this.props.available) {
      style.backgroundColor = 'rgb(31, 224, 86)';
    } else {
      style.backgroundColor = 'rgb(228, 22, 22)';
        
    }
    return style;
  };

  render() {
    return (
      <div style={this.getStyle()}>
        <Link to={`/room/${this.props.name}`} style={style.link}>{this.props.name}</Link>
      </div>
    );
  }
}
const style = {
  link: {
    color: "#000",
    fontFamily: "Doodle",
    fontSize: "15px",
    fontWeight: "bold",
    textDecoration: "none",
    letterSpacing: "3px"
  }
}
