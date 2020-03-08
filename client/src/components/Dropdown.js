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
    if (!this.dropdownMenu.contains(event.target)) {
      this.setState({ showMenu: false }, () => {
        document.removeEventListener("click", this.closeMenu);
      });
    }
  }

  render() {
    return (
      <div>
        {console.log(this.props.options)}
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
                key={option.name}
                onClick={option.func}
              >
                {option.name}
              </button>
            ))}
          </div>
        ) : null}

        <button onClick={this.showMenu}>{this.props.name}</button>
      </div>
    );
  }
}

const style = {
  menu: {
    display: "inline-flex",
    flexDirection: "column",
    position: "absolute",
    right: "15vw",
    width: "15vw"
  }
};
