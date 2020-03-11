/* eslint-disable no-param-reassign */

"use strict";

// ---------------------------------------------- REQUIRE DEPENDENCIES ----------------------------------------------
require("dotenv").config();
const betterLogging = require("better-logging");
// enhances log messages with timestamps etc
betterLogging.default(console, {
  stampColor: Color => Color.Light_Green,
  typeColors: Color => ({
    log: Color.Light_Green
  })
});
const path = require("path"); // helper library for resolving relative paths
const expressSession = require("express-session");
const socketIOSession = require("express-socket.io-session");
const express = require("express");
const http = require("http");
var fs = require("fs");
const cookieParser = require("cookie-parser");
const csp = require('helmet-csp')
// ------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------- SET-UP BOILERPLATE ------------------------------------------------
console.loglevel = 4; // Enables debug output
const publicPath = path.join(__dirname, "..", "..", "client", "dist");
const port = 8989; // The port that the server will listen to
const app = express(); // Creates express app

// Express usually does this for us, but socket.io needs the httpServer directly
const httpServer = http.Server(app);
const io = require("socket.io").listen(httpServer); // Creates socket.io app

// Setup middlewares
app.use(
  betterLogging.expressMiddleware(console, {
    ip: { show: true },
    path: { show: true },
    body: { show: true }
  })
);

// This is a middleware that parses the body of the request into a javascript object.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* Enable parsing of cookies and use of secrets to generate cookies */
app.use(cookieParser(process.env.KEY));

// Setup session
const session = expressSession({
  secret: process.env.KEY,
  resave: true,
  saveUninitialized: true
});
app.use(session);
io.use(
  socketIOSession(session, {
    autoSave: true,
    saveUninitialized: true
  })
);

// CSP - Only load things from the domain of this server
app.use(csp({
  directives: {
    defaultSrc: ["'self'"]
  }
}));

// ------------------------------------------------------------------------------------------------------------------
// ------------------------------------------------ BIND REST API ---------------------------------------------------
const auth = require("./controllers/auth.controller.js");
const room = require("./controllers/room.controller.js");

app.use("/api", auth.router);
app.use("/api", auth.requireAuth, room.router); // TODO: this auth gaurd makes a GET to the login API return unauthorized!
// ------------------------------------------------------------------------------------------------------------------
// ------------------------------------------------ SET-UP SOCKETS --------------------------------------------------
// Init sockets
const sockets = require("./sockets.js");
sockets.init({ io });

// Handle connected socket.io sockets and add authentication gaurd
// TODO: Place reconnecting sockets into correct room
io.use(auth.requireAuthSocket).on('connection', (socket) => {
  console.log(`New socket id=${socket.id}, user=${socket.tokenInfo.userID}, session=${socket.tokenInfo.sessionID}`);

  socket.on('disconnect', (reason) => {
    console.log(`Socket id=${socket.id} was disconnected`);
  });

  socket.on('reconnected', (reason) => {
    console.log(`Socket id=${socket.id} was reconnected`);
  });

  socket.on('draw', (lineInfo, style) => {
    sockets.draw(socket.tokenInfo.userID, lineInfo, style);
  });

  socket.on('clear', () => {
    sockets.clear(socket.tokenInfo.userID);
  });

  sockets.newConnection(socket.tokenInfo.userID, socket);
});
// ------------------------------------------------------------------------------------------------------------------
// Start server
httpServer.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});