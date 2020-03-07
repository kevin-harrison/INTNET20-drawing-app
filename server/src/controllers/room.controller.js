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
// TODO: Set up sockets to emit new rooms being created or deleted
router.get('/roomList', (req, res) => {
  database.getRooms()
  .then((result) => {
    res.status(200).json({
      roomList: result
    });
  });
});

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
    // Send join event on sockets
    sockets.joinRoom(req.tokenInfo.userID, req.params.room)
    .then(() => {
      // Update database
      database.joinRoom(req.tokenInfo.userID, req.params.room)
      .then((roomState) => {
        // Send room data
        res.status(200).json({
          lines: roomState,
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