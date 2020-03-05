import React, { Component } from "react";

export default class Canvas extends Component {
  constructor(props) {
    super(props);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onTouchStart = this.onMouseDown.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.endPaintEvent = this.endPaintEvent.bind(this);
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
    console.log("Mousedown");
    const { offsetX, offsetY } = nativeEvent;
    this.isPainting = true;
    this.prevPos = { offsetX, offsetY };
  }
  onMouseMove({ nativeEvent }) {
    console.log("Mousemove");
    if (this.isPainting) {
      const { offsetX, offsetY } = nativeEvent;
      const offSetData = { offsetX, offsetY };
      // Set the start and stop position of the paint event.
      const positionData = {
        start: { ...this.prevPos },
        stop: { ...offSetData }
      };
      // Add the position to the line array
      this.line = this.line.concat(positionData);
      this.paint(this.prevPos, offSetData, this.userStrokeStyle);
    }
  }
  endPaintEvent() {
    console.log("Mouseup");
    if (this.isPainting) {
      this.isPainting = false;
      /* this.sendPaintData(); */
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
  resizeCanvas() {
      console.log(this);
      console.log(document.documentElement.clientWidth);
      console.log(document.documentElement.clientHeight);
    this.canvas.width = document.documentElement.clientWidth;
    this.canvas.height = document.documentElement.clientHeight;
  }

  componentDidMount() {
    // Here we set up the properties of the canvas element.
    /* Sets the correct canvas dimensions depending on the screen */
    this.resizeCanvas();
    this.ctx = this.canvas.getContext("2d");
    this.ctx.lineJoin = "round";
    this.ctx.lineCap = "round";
    this.ctx.lineWidth = 5;
    window.addEventListener('resize', this.resizeCanvas());
  }

  render() {
    return (
      <canvas
        // We use the ref attribute to get direct access to the canvas element.
        ref={ref => (this.canvas = ref)}
        style={style.canvas}
        onMouseDown={this.onMouseDown}
        onMouseLeave={this.endPaintEvent}
        onMouseUp={this.endPaintEvent}
        onMouseMove={this.onMouseMove}
      />
    );
  }
}

const style = {
  canvas: {
    background: "#fff",
    borderTop: "2px solid black",
    width: "100vw",
    height: "fill-available",
    touchAction: "none",
  }
};
