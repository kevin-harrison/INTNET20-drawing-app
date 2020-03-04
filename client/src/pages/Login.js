import React, { Component } from "react";
import { Link } from "react-router-dom";

export default class Login extends Component {
  render() {
    return (
      <div className="center">
        <div style={style.centerBox}>
          <input
            type="text"
            placeholder="Username"
            style={style.inputArea}
          ></input>
          <input
            type="password"
            placeholder="Password"
            style={{ ...style.inputArea, ...style.password }}
          ></input>
          <button style={style.button}><Link to="/rooms" style={style.link}>LOGIN!</Link></button>
          <Link to="/register" style={style.link}>REGISTER</Link>
        </div>
      </div>
    );
  }
}

const style = {
  centerBox: {
    height: "30vh",
    width: "60vw",
    border: "1px solid #333",
    borderRadius: "10px",
    background: "linear-gradient(-45deg, #56CCF2, #2F80ED)",
    color: "aliceblue",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-evenly"
  },
  inputArea: {
    width: "80%",
    height: "25px",
    border: "0",
    borderRadius: "8px",
    paddingLeft: "5px",
    fontFamily: "Arial",
    fontSize: "18px"
  },
  button: {
    height: "30px",
    width: "80%",
    border: "1px solid #333",
    borderRadius: "8px",
    background: "linear-gradient(-45deg, #56ab2f, #a8e063)",
    color: "#000",
    fontFamily: "Doodle",
    fontSize: "20px",
    fontWeight: "bold",
    boxShadow: "5px 5px 5px 0px rgba(0,0,0,0.75)"
  },
  link: {
    color: "#000",
    fontFamily: "Doodle",
    fontSize: "15px",
    fontWeight: "bold",
    textDecoration: "none",
    letterSpacing: "3px"
  }
};
