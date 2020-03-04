import React from "react";
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer style={footerStyle}>
      <Link style={linkStyle} to="/">
        Login
      </Link>
      <Link style={linkStyle} to="/rooms">
        Rooms
      </Link>
    </footer>
  );
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
  border: "2px solid #000",
  flexShrink: "0",
};

const linkStyle = {
  color: "#eee",
  fontWeight: "bold",
  textDecoration: "none",
  margin: "0 20px",
  textTransform: "uppercase",
};

export default Footer;
