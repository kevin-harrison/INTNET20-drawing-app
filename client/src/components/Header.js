import React from "react";
import { Link } from "react-router-dom";

function Header() {
  return (
    <header style={headerStyle}>
      <Link style={linkStyle} to="/">
        Login
      </Link>
      <Link style={linkStyle} to="/rooms">
        Rooms
      </Link>
      <Link style={linkStyle} to="/about">
        About
      </Link>
    </header>
  );
}

const headerStyle = {
  height: "50px",
  display: "flex",
  flexDirection: "row",
  justifyContent: "center",
  background:
    "radial-gradient(circle, rgba(0,209,255,1) 0%, rgba(97,198,236,1) 49%, rgba(31,67,79,1) 81%, rgba(0,0,0,1) 100%)",
  color: "#ffff",
  textAlign: "center",
  padding: "10px",
  border: "2px solid #000",
  borderRadius: "10px"
};

const linkStyle = {
  color: "#eee",
  fontWeight: "bold",
  textDecoration: "none",
  margin: "0 20px"
};

export default Header;
