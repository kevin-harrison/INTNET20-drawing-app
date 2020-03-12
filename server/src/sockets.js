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
    sockets[userID].disconnect(true);
  }
  sockets[userID] = socket;
};

/**
 * Called when a user joins a game room through the API.
 * Links the the user with their socket.
 * Leaves the socket's previous room and joins the new room.
 * @param {String} userID - Unique username of the user
 * @param {String} roomName - Unique name of the room to join.
 */
// TODO: check that if server restarts, reconnected sockets are still in a room
async function joinRoom(userID, roomName) {
  const socket = sockets[userID];
  
  try {
    // Leave all rooms except for personal id room
    var connectedRooms = Object.keys(exports.io.sockets.adapter.sids[socket.id]);
    connectedRooms.map((room) => {
      if(room !== socket.id) {
        database.leaveRoom(userID);
        socket.leave(room, () => {
          socket.to(room).emit('user_left', userID);
          console.log(`${userID} left room ${room}`);
        });
      }
    });
    // Join new room        
    socket.join(roomName, () => {
      console.log(`${userID} joined room ${roomName}`);
      socket.to(roomName).emit('user_joined', userID);
    });
  } catch(err) {
    console.log(`Unable to update socket: ${err}`);
  }
}
exports.joinRoom = joinRoom;

async function leaveRoom(userID) {
  const room = await database.leaveRoom(userID);
  console.log(`Removing ${userID} from ${room} due to disconnection`);
  exports.io.in(room).emit('user_left', userID);
}
exports.leaveRoom = leaveRoom;


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