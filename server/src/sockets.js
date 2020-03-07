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
 * Called when a user joins a room through the API.
 * Links the the user with their socket.
 * Leaves the socket's previous room and joins the new room.
 * @param {String} userID - Unique username of the user
 * @param {String} roomName - Unique name of the room to join.
 */
async function joinRoom(userID, roomName){
  await database.getUser(userID)
  .then((userData) => {
    // leave current room
    try{
      sockets[userID].leave(userData.currentRoomName, () => {
        console.log(`${userID} left room ${userData.currentRoomName}`);
        // join new room
        sockets[userID].join(roomName, () => {
          console.log(`${userID} joined room ${roomName}`);
          exports.io.in(roomName).emit('user_joined', `${userID} has joined ${roomName}`);
        });
      });
    } catch(err) {
      console.log('Unable to update socket');
    }
  })
}
exports.joinRoom = joinRoom;