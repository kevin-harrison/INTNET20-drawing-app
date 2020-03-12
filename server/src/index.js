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
const https = require("https");
var fs = require("fs");
const cookieParser = require("cookie-parser");
const csp = require('helmet-csp')
// ------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------- SET-UP BOILERPLATE ------------------------------------------------
console.loglevel = 4; // Enables debug output
const port = 8989; // The port that the server will listen to
const app = express(); // Creates express app

// Get HTTPS credentials
const key = fs.readFileSync("./keys/key.pem");
const certificate = fs.readFileSync("./keys/cert.pem");
const credentials  = { key: key, cert: certificate };

// Express usually does this for us, but socket.io needs the httpServer directly
const httpsServer = https.Server(credentials, app);
const io = require("socket.io").listen(httpsServer); // Creates socket.io app

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
// ------------------------------------------------------------------------------------------------------------------
// Start server
httpsServer.listen(port, () => {
  console.log(`Listening on https://localhost:${port}`);
});

app.get('/httpsTest', (req, res) => {
  res.send('WOW VERY SECURE.');
});