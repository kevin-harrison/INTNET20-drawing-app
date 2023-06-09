import React, { Component } from "react";
import Dropdown from "./Dropdown";
import SocketContext from "../components/SocketContext";

class CanvasInSocketContext extends Component {
  constructor(props) {
    super(props);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.endPaintEvent = this.endPaintEvent.bind(this);

    this.clearCanvas = this.clearCanvas.bind(this);

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
          // Handle users
          this.setState({ members: promiseValue.users });
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
      this.props.socket.emit(
        "immediate_paint",
        this.props.roomName,
        this.prevPos,
        offSetData,
        this.strokeStyle
      );
      this.paint(this.prevPos, offSetData, this.strokeStyle);
    }
  }
  endPaintEvent() {
    if (this.isPainting) {
      this.isPainting = false;
      this.sendPaintData();
    }
  }
  paint(prevPos, currPos, strokeStyle, userID = "self_user_id") {
    const { offsetX, offsetY } = currPos;
    // Catch userID undefined
    if (userID != "self_user_id" && this.state.members[userID] === undefined) {
      // TODO: May want to find out why this is sometimes undefined and try to fix the case some other way
      this.state.members[userID] = {};
      this.state.members[userID].isDrawing = false;
      this.state.members[userID].prevPos = { offsetX: 0, offsetY: 0 };
    }
    const { offsetX: x, offsetY: y } =
      userID === "self_user_id"
        ? prevPos
        : this.state.members[userID].isDrawing
        ? this.state.members[userID].prevPos
        : currPos;

    this.ctx.beginPath();
    this.ctx.strokeStyle = strokeStyle;
    // Move the the prevPosition of the mouse
    this.ctx.moveTo(x, y);
    // Draw a line to the current position of the mouse
    this.ctx.lineTo(offsetX, offsetY);
    // Visualize the line using the strokeStyle
    this.ctx.stroke();
    if (userID === "self_user_id") {
      this.prevPos = { offsetX, offsetY };
    } else {
      this.state.members[userID].prevPos = { offsetX, offsetY };
    }
  }
  async sendPaintData() {
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

  createSocketListeners() {
    if (this.props.socket) {
      this.props.socket.off("connect");
      this.props.socket.on("connect", () => {
        this.props.socket.emit("connected", this.props.roomName);
      });

      this.props.socket.on("user_joined", userName => {
        if (this.state.members[userName] === undefined) {
          let obj = { ...this.state.members }; //makes a copy of array. States should be treated as immutable
          obj[userName] = {
            username: userName,
            prevPos: { offsetX: 0, offsetY: 0 },
            isDrawing: false
          };
          this.setState({ members: obj });
        }
      });

      this.props.socket.on("user_left", userName => {
        let obj = { ...this.state.members }; //makes a copy of array
        if (obj[userName] !== undefined) {
          delete obj[userName];
          this.setState({ members: obj });
        }
      });

      // Immediate drawing, 'real time'
      this.props.socket.on("imm_draw_emit", (start, stop, style, userID) => {
        this.paint(start, stop, style, userID);
        let obj = { ...this.state.members };
        if (obj[userID] !== undefined) {
          obj[userID].isDrawing = true;
          this.setState({ members: obj });
        }
        // TODO There is still an issue where immediate draw emits are not being caught
        // in some cases.
      });

      // Receive drawing data from other sockets
      this.props.socket.on("line_drawn", userID => {
        let obj = { ...this.state.members };
        if (obj[userID] !== undefined) {
          obj[userID].isDrawing = false;
          this.setState({ members: obj });
        }
      });

      // TODO Do we need the created and deleted emits in canvas?
      this.props.socket.on("room_created", (userID, roomName) => {
        console.log(`${userID} created room ${roomName}`);
      });

      this.props.socket.on("room_deleted", (userID, roomName) => {
        console.log(`${userID} deleted room ${roomName}`);
      });

      this.props.socket.on("clear", userID => {
        this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        console.log(`${userID} cleared the room.`);
      });
    }
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

    this.createSocketListeners();
  }

  state = {
    members: {}
  };
  render() {
    return (
      <div style={style.outerContainer}>
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
        <div style={style.memberList}>
          {Object.keys(this.state.members).map(member => (
            <div key={this.state.members[member].username}>
              {this.state.members[member].username}
            </div>
          ))}
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

const Canvas = props => (
  <SocketContext.Consumer>
    {socket => <CanvasInSocketContext {...props} socket={socket} />}
  </SocketContext.Consumer>
);
export default Canvas;

const style = {
  outerContainer: {
    width: "100vw",
    height: "100vh",
  },
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
