import React, { Component } from "react";

export default class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      usernameInput: "",
      passwordInput: ""
    };
    this.updateUsername = this.updateUsername.bind(this);
    this.updatePassword = this.updatePassword.bind(this);
    this.checkLogin = this.checkLogin.bind(this);
    this.register = this.register.bind(this);
  }

  updateUsername(event) {
    this.setState({ usernameInput: event.target.value });
  }
  updatePassword(event) {
    this.setState({ passwordInput: event.target.value });
  }

  checkLogin() {
    fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username: this.state.usernameInput,
        password: this.state.passwordInput
      })
    })
      .then(resp => {
        if (resp.ok) {
          /* Connect and give socketID for connection */
          this.props.setSocket();
          this.props.history.push("/rooms");
        }
      })
      .catch(error => {
        console.error("Authentication failed unexpectedly");
        throw error;
      });
  }

  register() {
    fetch("/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username: this.state.usernameInput,
        password: this.state.passwordInput
      })
    })
      .then(resp => {
        console.log(resp);
        if (resp.ok) return resp;
      })
      .catch(error => {
        console.error("Authentication failed unexpectedly");
        throw error;
      });
  }

  render() {
    return (
      <div className="center">
        <div style={style.centerBox}>
          <input
            id="usernameInput"
            type="text"
            placeholder="Username"
            style={style.inputArea}
            onChange={this.updateUsername}
          ></input>
          <input
            id="passwordInput"
            type="password"
            placeholder="Password"
            style={{ ...style.inputArea, ...style.password }}
            onChange={this.updatePassword}
          ></input>
          <button style={style.button} onClick={this.checkLogin}>
            LOGIN
          </button>
          <button style={style.button} onClick={this.register}>
            Register
          </button>
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
    boxShadow: "5px 5px 5px 0px rgba(0,0,0,0.75)",
    textTransform: "uppercase",
    letterSpacing: "2px"
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
