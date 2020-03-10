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
  //if(sockets[userID]) {
  //  sockets[userID].disconnect(true); // TODO: Clients are still getting too many sockets, maybe?
  //}
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
  // Check if socket is in a game room else assume they were in roomList
  await database.getUser(userName)
  .then((userData) => {
    let currentRoom = userData.currentRoomName === null ? 'roomList' : userData.currentRoomName;
    // leave current room
    try{
      sockets[userName].leave(currentRoom, () => {
        console.log(`${userName} left room ${currentRoom}`);
        sockets[userName].to(currentRoom).emit('user_left', userName); // TODO: can socket emit to curentRoom after leaving it?
        // join new room
        sockets[userName].join(roomName, () => {
          console.log(`${userName} joined room ${roomName}`);
          sockets[userName].to(roomName).emit('user_joined', userName);
        });
      });
    } catch(err) {
      console.log(`Unable to update socket: ${err}`);
    }
  })
}
exports.joinRoom = joinRoom;


async function addRoom(userID, roomName) {
  exports.io.in('roomList').emit('room_created', userID, roomName);
  //sockets[userID].to('roomList').emit('room_created', userID, roomName);
  console.log(`${userID} created room ${roomName}`);
}
exports.addRoom = addRoom;


async function removeRoom(userID, roomName) {
  exports.io.in('roomList').emit('room_deleted', userID, roomName);
  console.log(`${userID} deleted room ${roomName}`);
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


async function clear(userID) {
  const userData = await database.getUser(userID);
  sockets[userID].to(userData.currentRoomName).emit('clear', userID);
  database.clearRoom(userData.currentRoomName)
  .catch((err) => {
    console.error(err.message);
  });
}
exports.clear = clear;