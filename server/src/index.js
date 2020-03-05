/* eslint-disable no-param-reassign */

'use strict';

// #region require dependencies
const betterLogging = require('better-logging');
// enhances log messages with timestamps etc
betterLogging.default(console, {
  stampColor: (Color) => Color.Light_Green,
  typeColors: (Color) => ({
    log: Color.Light_Green,
  }),
});
const path = require('path'); // helper library for resolving relative paths
const expressSession = require('express-session');
const socketIOSession = require('express-socket.io-session');
const express = require('express');
const http = require('http');
// #endregion

// #region setup boilerplate
console.loglevel = 4; // Enables debug output
const publicPath = path.join(__dirname, '..', '..', 'client', 'dist');
const port = 8989; // The port that the server will listen to
const app = express(); // Creates express app

// Express usually does this for us, but socket.io needs the httpServer directly
const httpServer = http.Server(app);
const io = require('socket.io').listen(httpServer); // Creates socket.io app

// Setup middlewares
app.use(betterLogging.expressMiddleware(console, {
  ip: { show: true },
  path: { show: true },
  body: { show: true },
}));


// TEMPORARY!!!
/* const util = require("util");
app.use((req, res, next) => {
  var obj_str = util.inspect(req.headers);
  console.log(`HEADERS: ${obj_str}`);
  next();
}); */



/*
This is a middleware that parses the body of the request into a javascript object.
It's basically just replacing the body property like this:
req.body = JSON.parse(req.body)
*/
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

// Setup session
const session = expressSession({
  secret: 'Super secret! Shh! Don\'t tell anyone...',
  resave: true,
  saveUninitialized: true,
});
app.use(session);
io.use(socketIOSession(session, {
  autoSave: true,
  saveUninitialized: true,
}));
// #endregion

// Bind REST controllers to /api/*
const auth = require('./controllers/auth.controller.js');

//const booking = require('./controllers/booking.controller.js');
//const admin = require('./controllers/admin.controller.js');
//

app.use('/api', auth.router);

//app.use('/api', booking.router);
//app.use('/api', admin.router);
//
//
//// Handle connected socket.io sockets
//io.on('connection', (socket) => {
//  // This function serves to bind socket.io connections to user models
//
//  if (socket.handshake.session.userID
//    && model.findUser(socket.handshake.session.userID) !== undefined
//  ) {
//    // If the current user already logged in and then reloaded the page
//    model.updateUserSocket(socket.handshake.session.userID, socket);
//  } else {
//    socket.handshake.session.socketID = model.addUnregisteredSocket(socket);
//    socket.handshake.session.save((err) => {
//      if (err) console.error(err);
//      else console.debug(`Saved socketID: ${socket.handshake.session.socketID}`);
//    });
//  }
//  // TODO: Check if the user actually exists instead of creating a new one
//  model.addUser(socket.handshake.session.userID, socket.handshake.session.socketID);
//  // Update the userID of the currently active session
//  socket.handshake.session.userID = socket.handshake.session.userID;
//  socket.handshake.session.save((err) => {
//    if (err) console.error(err);
//    else console.debug(`Saved userID: ${socket.handshake.session.userID}`);
//  });
//});

app.get('/home', auth.requireAuth, (req, res) => {
  res.send('YOU MADE IT HOME');
});


// Start server
httpServer.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});
