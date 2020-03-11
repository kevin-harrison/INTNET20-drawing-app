import React, { Component } from "react";
import { Link } from "react-router-dom";

class Footer extends Component {
  constructor(props) {
    super(props);
    this.logout = this.logout.bind(this);
  }

  logout() {
    fetch("/api/logout");
    this.props.history.push("/");
  }

  render() {
    return (
      <footer style={footerStyle}>
        <div style={linkStyle} onClick={this.logout}>
          Logout
        </div>
      </footer>
    );
  }
}

const footerStyle = {
  position: "absolute",
  bottom: "0",
  height: "8vh",
  width: "100vw",
  display: "flex",
  flexDirection: "row",
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "rgb(154, 205, 104)",
  color: "#fff",
  textAlign: "center",
  padding: "10px",
  borderTop: "2px solid #ccc",
  flexShrink: "0"
};

const linkStyle = {
  color: "#eee",
  fontWeight: "bold",
  textDecoration: "none",
  margin: "0 20px",
  textTransform: "uppercase",
  cursor: "pointer",
};

export default Footer;
