import React, { Component } from "react";
import Dropdown from "./Dropdown";

export default class Canvas extends Component {
  constructor(props) {
    super(props);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.endPaintEvent = this.endPaintEvent.bind(this);

    this.clearCanvas = this.clearCanvas.bind(this);

    console.log(this.props);

    this.props.socket.on("user_joined", userName => {
      this.state.members.push(userName);
      this.updateMembers();
    });

    this.props.socket.on("user_left", userName => {
      const index = this.state.members.indexOf(userName);
      if (index > -1) {
        this.state.members.splice(index, 1);
        this.updateMembers();
      }
    });

    // Receive drawing data from other sockets
    this.props.socket.on("line_drawn", (userID, lineData, style) => {
      // Draws the line point by point
      lineData.forEach(position => {
        this.paint(position.start, position.stop, style);
      });
    });

    this.props.socket.on("room_created", (userID, roomName) => {
      console.log(`${userID} created room ${roomName}`);
    });

    this.props.socket.on("room_deleted", (userID, roomName) => {
      console.log(`${userID} deleted room ${roomName}`);
    });

    this.props.socket.on("clear", (userID) => {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      console.log(`${userID} cleared the room.`);
    });

    // Notifies other people of new user in room and gets line data from database
    fetch(`/api/room/${this.props.roomName}/join`)
      .then(resp => {
        if (!resp.ok) {
          throw new Error(
            `Unexpected failure when joining room: ${this.props.roomName}`
          );
        }
        // Draw room using the line data
        // (Resp has returned a promise which is resolved here)
        resp.json().then(promiseValue => {
          console.log(promiseValue);
          // Handle users
          promiseValue.users.forEach(user => {
            this.state.members.push(user.username);
          });
          this.updateMembers();
          // Handle lines
          promiseValue.lines.forEach(line => {
            let lineData = JSON.parse(line.data);
            lineData.forEach(position => {
              this.paint(position.start, position.stop, line.style);
            });
          });
        });
      })
      .catch(console.error);
  } // End of constructor

  // Used for pdating the list of members on the page
  updateMembers() {
    let members = "";
    this.state.members.forEach((member) => {
      members += `<div>${member}</div>`
    });
    this.memberlist.innerHTML = members;
  }


  isPainting = false;
  // Different stroke styles to be used for user and guest
  strokeStyle = "#CC0000";
  line = [];
  prevPos = { offsetX: 0, offsetY: 0 };

  onMouseDown({ nativeEvent }) {
    let offsetX = nativeEvent.offsetX;
    let offsetY = nativeEvent.offsetY;
    if (offsetX === undefined) {
      offsetX = nativeEvent.touches[0].clientX;
      offsetY = nativeEvent.touches[0].clientY;
    }
    this.isPainting = true;
    this.prevPos = { offsetX, offsetY };
  }
  onMouseMove({ nativeEvent }) {
    if (this.isPainting) {
      let offsetX = nativeEvent.offsetX;
      let offsetY = nativeEvent.offsetY;
      if (offsetX === undefined) {
        offsetX = nativeEvent.touches[0].clientX;
        offsetY = nativeEvent.touches[0].clientY;
      }
      const offSetData = { offsetX, offsetY };
      // Set the start and stop position of the paint event.
      const positionData = {
        start: { ...this.prevPos },
        stop: { ...offSetData }
      };
      // Add the position to the line array
      this.line = this.line.concat(positionData);
      this.paint(this.prevPos, offSetData, this.strokeStyle);
    }
  }
  endPaintEvent() {
    if (this.isPainting) {
      this.isPainting = false;
      this.sendPaintData();
    }
  }
  paint(prevPos, currPos, strokeStyle) {
    const { offsetX, offsetY } = currPos;
    const { offsetX: x, offsetY: y } = prevPos;

    this.ctx.beginPath();
    this.ctx.strokeStyle = strokeStyle;
    // Move the the prevPosition of the mouse
    this.ctx.moveTo(x, y);
    // Draw a line to the current position of the mouse
    this.ctx.lineTo(offsetX, offsetY);
    // Visualize the line using the strokeStyle
    this.ctx.stroke();
    this.prevPos = { offsetX, offsetY };
  }
  async sendPaintData() {
    console.log(`sending draw with socket ${this.props.socket.id}`);
    this.props.socket.emit("draw", this.line, this.strokeStyle);
    this.line = [];
  }
  // Used to resize te canvas and set it up for the right size
  resizeCanvas() {
    this.canvas.width = document.documentElement.clientWidth;
    this.canvas.height = document.documentElement.clientHeight;
  }

  // Used in the dropdown menu to set the line style
  setStrokeStyle(color) {
    this.strokeStyle = color;
  }

  // Erases al lines on canvas
  clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.props.socket.emit("clear");
  }

  componentDidMount() {
    // Here we set up the properties of the canvas element.
    /* Sets the correct canvas dimensions depending on the screen */
    this.resizeCanvas();
    this.ctx = this.canvas.getContext("2d");
    this.ctx.lineJoin = "round";
    this.ctx.lineCap = "round";
    this.ctx.lineWidth = 20;
    window.addEventListener("resize", this.resizeCanvas());
  }

  state = {
    members: []
  };
  render() {
    return (
      <div>
        <canvas
          // We use the ref attribute to get direct access to the canvas element.
          ref={ref => (this.canvas = ref)}
          style={style.canvas}
          onMouseDown={this.onMouseDown}
          onMouseMove={this.onMouseMove}
          onMouseLeave={this.endPaintEvent}
          onMouseUp={this.endPaintEvent}
          onTouchStart={this.onMouseDown}
          onTouchMove={this.onMouseMove}
          onTouchEnd={this.endPaintEvent}
        />
        <div ref={ref => (this.memberlist = ref)}
        style={style.memberList}>
        </div>
        <div style={style.dropdownArea}>
          <Dropdown
            name="Color"
            options={[
              {
                name: "Red",
                func: () => this.setStrokeStyle("#CC0000"),
                color: "#CC0000"
              },
              {
                name: "Yellow",
                func: () => this.setStrokeStyle("#CCCC00"),
                color: "#CCCC00"
              },
              {
                name: "Green",
                func: () => this.setStrokeStyle("#00CC00"),
                color: "#00CC00"
              },
              {
                name: "Teal",
                func: () => this.setStrokeStyle("#00CCCC"),
                color: "#00CCCC"
              },
              {
                name: "Blue",
                func: () => this.setStrokeStyle("#0000CC"),
                color: "#0000CC"
              },
              {
                name: "Purple",
                func: () => this.setStrokeStyle("#CC00CC"),
                color: "#CC00CC"
              }
            ]}
          />
          <button onClick={this.clearCanvas} style={style.clearButton}>
            Clear
          </button>
        </div>
      </div>
    );
  }
}

const style = {
  canvas: {
    background: "#fff",
    width: "100vw",
    height: "100vh",
    touchAction: "none"
  },
  memberList: {
    position: "absolute",
    top: "6vh",
    left: "2vw",
    display: "flex",
    flexDirection: "column",
    fontFamily: "Doodle"
  },
  dropdownArea: {
    position: "absolute",
    top: "6vh",
    right: "2vw",
    display: "flex",
    flexDirection: "column",
    fontFamily: "Doodle"
  },
  clearButton: {
    width: "30vw",
    background: "linear-gradient(0deg, rgb(252, 234, 187), rgb(240, 44, 0))",
    borderRadius: "10px",
    height: "5vh",
    border: "1px solid aliceblue",
    boxShadow: "1px 1px 1px 1px rgba(0,0,0,0.4)",
    cursor: "pointer",
    marginBottom: "2px",
    fontFamily: "Doodle",
    fontSize: "20px",
    letterSpacing: "2px"
  }
};
