'use strict';

const database = require('./database.js');
const auth = require("./controllers/auth.controller.js");

// Will be initialized in the exports.init function
exports.io = undefined;
const sockets = {};

/**
 * Initialize the model, handle connected socket.io sockets and add authentication gaurd
 * @param { { io: SocketIO.Server } } config - The configurations needed to initialize the model.
 * @returns {void}
 */
exports.init = ({ io }) => {
  exports.io = io;

  exports.io.use(auth.requireAuthSocket).on('connection', (socket) => {
    console.log(`New socket id=${socket.id}, user=${socket.tokenInfo.userID}, session=${socket.tokenInfo.sessionID}`);

    socket.on('connected', (currentRoom) => {
      console.log(`Socket id=${socket.id} connected from room ${currentRoom}`);
      joinRoom(socket.tokenInfo.userID, currentRoom); // TODO: If server crashes and socket reconnects, we still dont emit which room they left
      const databaseRoom = currentRoom === 'roomList' ? null : currentRoom;
      database.joinRoom(socket.tokenInfo.userID, databaseRoom);
    });

    socket.on('disconnect', () => {
      console.log(`Socket id=${socket.id} was disconnected`);
      leaveRoom(socket.tokenInfo.userID);
    });

    socket.on('draw', (lineInfo, style) => {
      console.log(`Draw event by ${socket.tokenInfo.userID}`);
      draw(socket.tokenInfo.userID, lineInfo, style);
    });

    socket.on('clear', () => {
      clear(socket.tokenInfo.userID);
    });

    newConnection(socket.tokenInfo.userID, socket);
  });
};

/**
 * Assigns a socket to a user
 * If the user already has a socket it will be disconnected
 * @param {String} userID - Unique username of the user.
 * @param {SocketIO.Socket} socket - New socket connection to the user.
 */
function newConnection(userID, socket) {
  if(sockets[userID]) {
    sockets[userID].disconnect(true);
  }
  sockets[userID] = socket;
};
exports.newConnection = newConnection;

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
      if(room !== socket.id && room !== roomName) {
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
  console.log(`Removing ${userID} from ${room}`);
  exports.io.in(room).emit('user_left', userID);
}
exports.leaveRoom = leaveRoom;


async function addRoom(userID, roomName) {
  exports.io.in('roomList').emit('room_created', userID, roomName);
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