import React, { Component } from "react";

export default class Dropdown extends Component {
  constructor() {
    super();

    this.state = {
      showMenu: false
    };

    this.showMenu = this.showMenu.bind(this);
    this.closeMenu = this.closeMenu.bind(this);
  }

  showMenu(event) {
    event.preventDefault();

    this.setState({ showMenu: true }, () => {
      document.addEventListener("click", this.closeMenu);
    });
  }

  closeMenu(event) {
    if (
      this.dropdownMenu === null ||
      !this.dropdownMenu.contains(event.target)
    ) {
      this.setState({ showMenu: false }, () => {
        document.removeEventListener("click", this.closeMenu);
      });
    }
  }

  render() {
    return (
      <div>
        {this.state.showMenu ? (
          <div
            className="menu"
            style={style.menu}
            ref={element => {
              this.dropdownMenu = element;
            }}
          >
            {this.props.options.map(option => (
              <button
                style={Object.assign({}, style.button, {
                  background: `linear-gradient(0deg, rgb(250, 250, 250), ${option.color})`
                })}
                key={option.name}
                onClick={option.func}
              >
                {option.name}
              </button>
            ))}
          </div>
        ) : null}

        <button style={style.button} onClick={this.showMenu}>
          {this.props.name}
        </button>
      </div>
    );
  }
}

const style = {
  button: {
    width: "30vw",
    borderRadius: "10px",
    height: "5vh",
    background: "linear-gradient(to right, orange , yellow, green, cyan, blue, violet)",
    border: "1px solid aliceblue",
    boxShadow: "1px 1px 1px 1px rgba(0,0,0,0.4)",
    cursor: "pointer",
    marginBottom: "2px",
    fontFamily: "Doodle",
    fontSize: "20px",
    letterSpacing: "2px"
  },
  menu: {
    display: "inline-flex",
    flexDirection: "column",
    position: "absolute",
    right: "46vw",
    width: "15vw"
  }
};
