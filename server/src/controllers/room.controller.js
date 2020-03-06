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
    /* const room = model.findRoom(req.params.room);
    if (room === undefined) {
      res.status(404).json({
        msg: `No room with ID: ${req.params.room}`,
        href_roomList: '/roomList',
      });
      return;
    } */
  
    /* const user = database.findUser(req.session.userID); */
  
  /*   // Leave previous room if exists
    if (user.currentRoom !== null) {
      console.log(`${user.name} leaving ${user.currentRoom} !!!`);
      user.socket.leave(user.currentRoom);
    }   */
    // Join the right socket.io room
    /* user.currentRoom = room.name; */
    // console.log(`${user.name} joining ${user.currentRoom} !!!`);
    /* user.socket.join(user.currentRoom); */
  
    // Send join message
    database.joinRoom(req.params.room);
  
    // Send http response
    res.status(200).json({
      /* list: room.messages,
      msg: `Successfully joined room: ${room.name}`,
      href_messages: `/room/${room.name}`,
      href_send_message: `/room/${room.name}/message`, */
    });
  });