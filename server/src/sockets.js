'use strict';

const database = require('./database.js');

// Will be initialized in the exports.init function
exports.io = undefined;
const sockets = {};

/**
 * Initialize the model
 * @param { { io: SocketIO.Server } } config - The configurations needed to initialize the model.
 * @returns {void}
 */
exports.init = ({ io }) => {
  exports.io = io;
};

/**
 * Assigns a socket to a user
 * If the user already has a socket it will be disconnected
 * @param {String} userID - Unique username of the user.
 * @param {SocketIO.Socket} socket - New socket connection to the user.
 */
exports.newConnection = (userID, socket) => {
  if(sockets[userID]) {
    sockets[userID].disconnect(true); // TODO: Clients are still getting too many sockets
  }
  sockets[userID] = socket;
};

/**
 * Called when a user joins a game room through the API.
 * Links the the user with their socket.
 * Leaves the socket's previous room and joins the new room.
 * @param {String} userName - Unique username of the user
 * @param {String} roomName - Unique name of the room to join.
 */
// TODO: check that if server restarts, reconnected sockets are still in a room
async function joinRoom(userName, roomName) {
  await database.getUser(userName)
  .then((userData) => {
    // leave current room
    try{
      sockets[userName].leave(userData.currentRoomName, () => {
        console.log(`${userName} left room ${userData.currentRoomName}`);
        exports.io.in(userData.currentRoomName).emit('user_left', userName);
        // join new room
        sockets[userName].join(roomName, () => {
          console.log(`${userName} joined room ${roomName}`);
          exports.io.in(roomName).emit('user_joined', userName);
        });
      });
    } catch(err) {
      console.log('Unable to update socket');
    }
  })
}
exports.joinRoom = joinRoom;


async function addRoom(userID, roomName) {
  exports.io.sockets.emit('room_created', userID, roomName);
}
exports.addRoom = addRoom;


async function removeRoom(userID, roomName) {
  exports.io.sockets.emit('room_deleted', userID, roomName);
}
exports.removeRoom = removeRoom;


async function draw(userID, lineData, style) {
  // Add new line to database
  const userData = await database.getUser(userID)
  // Emit new line on sockets. Doing this outside of database actions to prevent delay
  sockets[userID].to(userData.currentRoomName).emit('line_drawn', userID, lineData, style);
  database.addLine(userData.currentRoomName, JSON.stringify(lineData), style)
  .catch((err) => {
    console.error(err.message);
  });
}
exports.draw = draw;