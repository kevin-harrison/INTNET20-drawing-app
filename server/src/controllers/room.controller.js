'use strict';

const express = require('express');
const router = express.Router();
const database = require('../database.js');
const sockets = require('../sockets.js');

module.exports = { router }

/**
 * Get a list of all the available rooms
 * @returns {void} - Sends a JSON payload whose roomList element has an Array of room objects
 */
router.get('/roomList', (req, res) => {
  // Send join event on sockets and change socket room
  sockets.joinRoom(req.tokenInfo.userID, 'roomList')
  .then(() => {
    database.getRooms()
    .then((result) => {
      res.status(200).json({
        roomList: result
      });
    });
  });
});

/**
 * Creates a new game room
 * @param {String} req.bode.roomName - The name of the room to be created
 */
router.post('/roomList/create', (req, res) => {
  // "roomList" room is saved for /roomList endpoint
  if (req.body.roomName === 'roomList') {
    res.status(403).json({
      msg: 'Forbidden room name'
    });
    return;
  }

  database.addRoom(req.tokenInfo.userID, req.body.roomName)
  .then(() => {
    sockets.addRoom(req.tokenInfo.userID, req.body.roomName)
    .then(() => {
      res.status(200).json({
        msg: `Room ${req.body.roomName} created!`
      });
    });
  })
  .catch((err) => {
    console.error(err.message);
    res.status(500).json({
      msg: err.message
    });
  });
})

/**
 * Deletes a new game room
 * @param {String} req.bode.roomName - The name of the room to be deleted
 */
router.post('/roomList/delete', (req, res) => {
  database.removeRoom(req.tokenInfo.userID, req.body.roomName)
  .then((removed) => {
    if (!removed) {
      throw Error(`Couldn't delete room.`);
    }
    sockets.removeRoom(req.tokenInfo.userID, req.body.roomName)
    .then(() => {
      res.status(200).json({
        msg: `Room ${req.body.roomName} deleted!`
      });
    });
  })
  .catch((err) => {
    console.error(err.message);
    res.status(500).json({
      msg: err.message
    });
  });
})

/**
 * Join the specific room.
 * This updates the user's state in the database and sets up the user's socket's room.
 * @param {String} req.params.room - The id of the room you would like to join
 * @param {String} req.tokenInfo.userID - Set automatically by the authentication gaurd.
 * @returns {void} - If the join is successful sends a JSON payload with data describing the state of the room.
 */
router.get('/room/:room/join', (req, res) => {
  // Check that room exists
  database.getRoom(req.params.room)
  .then((roomExists) => {
    if(!roomExists) {
      throw Error('Trying to join non-existant room');
    } 
  })
  // Join room
  .then(() => {
    // Send join event on sockets and change socket room
    sockets.joinRoom(req.tokenInfo.userID, req.params.room)
    .then(() => {
      // Update database and get data of the room
      database.joinRoom(req.tokenInfo.userID, req.params.room)
      .then((roomState) => {
        // Send room data
        res.status(200).json({
          lines: roomState.lineData,
          users: roomState.users.map(user => user.username),
          msg: `Successfully joined ${req.params.room}`,
        });
      });
    })
  })
  .catch((err) => {
    res.status(403).json({
      msg: err.message
    });
    console.error(err.message);
  });
});