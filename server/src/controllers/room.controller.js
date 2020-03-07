'use strict';

const express = require('express');
const router = express.Router();
const database = require('../database.js');

module.exports = { router }

// ---------------------------------------- API routes -------------------------------------------------
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
 * This will allow the user-session to listen to and post messages in the given room.
 * @param {String} req.params.room - The id of the room you would like to join
 * @param {String} req.session.userID - A string that uniquely identifies the given user.
 * @returns {void}
 */
router.get('/room/:room/join', (req, res) => {
  // Check that room exists
  database.findRoom(req.params.room)
  .then((roomExists) => {
    if(!roomExists) {
      res.status(403).json({
        msg: 'Trying to join non-existant room'
      });
    } else {
      // TODO: have user socket.join and socket.leave correct rooms
      // Send join message on socket
      database.joinRoom(req.params.room);

      // Send room data
      database.getRoom(req.params.room)
      .then((roomState) => {
        res.status(200).json({
          lines: roomState,
          msg: `Successfully joined room: ${req.params.room}`,
        });
      });
    }
  })
  .catch((err) => {
    res.status(500).json({
      msg: err.message
    });
  });
});