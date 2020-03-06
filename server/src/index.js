/* eslint-disable no-param-reassign */

'use strict';

// #region require dependencies
require('dotenv').config();
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
const https = require('https');
var fs = require('fs');
const cookieParser = require('cookie-parser');
// #endregion

// #region setup boilerplate
console.loglevel = 4; // Enables debug output
const publicPath = path.join(__dirname, '..', '..', 'client', 'dist');
const port = 8989; // The port that the server will listen to
const app = express(); // Creates express app

// Express usually does this for us, but socket.io needs the httpServer directly
var options = {
  key: fs.readFileSync('keys/key.pem'),
  cert: fs.readFileSync('keys/cert.pem')
};

const httpsServer = https.Server(options, app);
const io = require('socket.io').listen(httpsServer); // Creates socket.io app

// Setup middlewares
app.use(betterLogging.expressMiddleware(console, {
  ip: { show: true },
  path: { show: true },
  body: { show: true },
}));


// TEMPORARY!!!
/* const util = require("util");
app.use((req, res, next) => {
  var obj_str = util.inspect(req.connection.remoteAddress);
  console.log(`HEADERS: ${obj_str}`);
  next();
});
 */


/*
This is a middleware that parses the body of the request into a javascript object.
It's basically just replacing the body property like this:
req.body = JSON.parse(req.body)
*/
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

/* Enable parsing of cookies and use of secrets to generate cookies */
app.use(cookieParser(process.env.KEY));

// Setup session
const session = expressSession({
  secret: process.env.KEY,
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


// Handle connected socket.io sockets
io.on('connection', (socket) => {
  console.log(socket.id);
  console.log('New socket id');
  // This function serves to bind socket.io connections to user models
  /* if (socket.handshake.session.userID
    && model.findUser(socket.handshake.session.userID) !== undefined
  ) {
    // If the current user already logged in and then reloaded the page
    model.updateUserSocket(socket.handshake.session.userID, socket);
  } else {
    socket.handshake.session.socketID = model.addUnregisteredSocket(socket);
    socket.handshake.session.save((err) => {
      if (err) console.error(err);
      else console.debug(`Saved socketID: ${socket.handshake.session.socketID}`);
    });
  } */
  /* // TODO: Check if the user actually exists instead of creating a new one
  model.addUser(socket.handshake.session.userID, socket.handshake.session.socketID);
  // Update the userID of the currently active session
  socket.handshake.session.userID = socket.handshake.session.userID;
  socket.handshake.session.save((err) => {
    if (err) console.error(err);
    else console.debug(`Saved userID: ${socket.handshake.session.userID}`);
  }); */
});

app.get('/home', auth.requireAuth, (req, res) => {
  res.send('YOU MADE IT HOME');
});


// Start server
httpsServer.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});
