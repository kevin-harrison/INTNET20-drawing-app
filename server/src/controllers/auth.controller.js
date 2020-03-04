'use strict';

const express = require('express');
const router = express.Router();
const database = require('../database.js');


// Authentication gaurd
const requireAuth = (req, res, next) => {
  // If JWT exists and is valid call next
  
  // else if username and password are valid call next
  const maybeUser = database.findLogin(req.body.userID, req.body.password);
  
  // "auth" check
  if (maybeUser === undefined) {
    res.status(401).send('Unauthorized. Please make sure you are logged in before attempting this action again.');
    return;
  }
  
  next();
};

module.exports = { router, requireAuth };
