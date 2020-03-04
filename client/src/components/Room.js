import React, { Component } from "react";

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
        <p>{this.props.name}</p>
      </div>
    );
  }
}
