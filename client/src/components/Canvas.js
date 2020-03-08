import React, { Component } from "react";
import Dropdown from "./Dropdown";

export default class Canvas extends Component {
  constructor(props) {
    super(props);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.endPaintEvent = this.endPaintEvent.bind(this);
    
    this.clearCanvas = this.clearCanvas.bind(this);

    this.props.socket.on("user_joined", msg => {
      console.log(msg);
    });

    // Receive drawing data from other sockets
    this.props.socket.on("line_drawn", (userID, lineData) => {
      console.log(`${userID} drew ${JSON.stringify(lineData, null, 2)}`);

      // Draws the line point by point
      lineData.forEach(position => {
        this.paint(position.start, position.stop, this.guestStrokeStyle);
      });
    });

    this.props.socket.on("room_created", (userID, roomName) => {
      console.log(`${userID} created room ${roomName}`);
    });

    this.props.socket.on("room_deleted", (userID, roomName) => {
      console.log(`${userID} deleted room ${roomName}`);
    });

    console.log(this.props.socket);

    this.props.socket.emit("join_room", this.props.roomName);

    // Links a socket to a room in the database
    fetch(`/api/room/${this.props.roomName}/join`)
      .then(resp => {
        if (!resp.ok) {
          throw new Error(
            `Unexpected failure when joining room: ${this.props.roomName}`
          );
        }
        return resp.json();
      })
      .catch(console.error);

    // Receive drawing data from other sockets
    this.props.socket.on("draw", data => {
      console.log(data);
      this.paint(data.prevPos, data.offSetData, this.guestStrokeStyle);
    });
  }
  isPainting = false;
  // Different stroke styles to be used for user and guest
  userStrokeStyle = "#EE92C2";
  guestStrokeStyle = "#F0C987";
  line = [];
  /* // v4 creates a unique id for each user. We used this since there's no auth to tell users apart
  userId = v4(); */
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
      this.paint(this.prevPos, offSetData, this.userStrokeStyle);
      /* this.props.socket.emit("draw", {
        room: this.props.roomName,
        prevPos: this.prevPos,
        offsetData: offSetData
      }); */
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
    const body = {
      line: this.line,
      userId: this.userId
    };
    console.log("emitting");
    this.props.socket.emit("draw", this.line);
    /* 
    // We use the native fetch API to make requests to the server
    const req = await fetch('http://localhost:4000/paint', {
      method: 'post',
      body: JSON.stringify(body),
      headers: {
        'content-type': 'application/json',
      },
    });
    const res = await req.json(); */
    this.line = [];
  }
  // Used to resize te canvas and set it up for the right size
  resizeCanvas() {
    this.canvas.width = document.documentElement.clientWidth;
    this.canvas.height = document.documentElement.clientHeight;
  }

  // Used in the dropdown menu to set the line style
  setStrokeStyle(color) {
    this.userStrokeStyle = color;
  }

  // Erases al lines on canvas
  clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
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
        <div style={style.dropdownArea}>
          <Dropdown
            name="Color"
            options={[
              { name: "Red", func: () => this.setStrokeStyle("#CC0000")},
              { name: "Green", func: () => this.setStrokeStyle("#00CC00")},
              { name: "Blue", func: () => this.setStrokeStyle("#0000CC")}
            ]}
          />
          <button onClick={this.clearCanvas} style={style.clearButton}>Clear</button>
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
  dropdownArea: {
    position: "absolute",
    top: "6vh",
    right: "2vw",
    display: "flex",
    flexDirection: "column",
    fontFamily: "Doodle",
  },
  clearButton: {
    width: "20vw",
    background: "linear-gradient(0deg, rgb(252, 234, 187), rgb(240, 44, 0))",
    borderRadius: "10px",
    height: "24px",
    border: "1px solid aliceblue",
    boxShadow: "1px 1px 1px 1px rgba(0,0,0,0.4)",
    cursor: "pointer",
    marginBottom: "2px",
    fontFamily: "Doodle",
    fontSize: "20px",
    letterSpacing: "2px"
  }
};
