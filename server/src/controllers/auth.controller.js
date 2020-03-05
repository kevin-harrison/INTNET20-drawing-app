'use strict';

const express = require('express');
const router = express.Router();
const database = require('../database.js');
const jwt = require('jsonwebtoken');



// Authentication gaurd
const requireAuth = (req, res, next) => {
  // If JWT exists and is valid call next
  console.log(`COOKIE: ${req.signedCookies.jwt}`);
  jwt.verify(req.signedCookies.jwt, 'secretKey', (err, decoded) => {
    if (err) {
      res.status(401).send('Unauthorized. Please make sure you are logged in before attempting this action again.');
      return;
    }
    else {
      console.log(`DECODED TOKEN ID: ${decoded.userID}`);
      next();
    }
  });
};
module.exports = { router, requireAuth };

// ---------------------------------------- API routes -------------------------------------------------

function createToken(username){
  // sign with default (HMAC SHA256)
  let expirationDate =  Math.floor(Date.now() / 1000) + 300 //300 seconds from now
  var token = jwt.sign({ userID: username, exp: expirationDate }, 'secretKey');
  return token;
}

router.post('/login', (req, res) => {
  database.checkLogin(req.body.username, req.body.password)
    .then(function(result) {
      if (result === true) {
        const token  = createToken(req.body.username);
        res.cookie('jwt', token, { signed: true });
        res.status(200).json({
          msg: 'Login succcessful',
          jwt: token
        });
      } else {
        res.status(401).json({
          msg: 'Login failed'
        });
      }
    })
});

router.post('/register', (req, res) => {
  database.createLogin(req.body.username, req.body.password)
    .then((result) => {
      res.status(200).json({
        msg: 'Registration succcessful'
      });
    })
    .catch((err) => {
      if (err.name === 'SequelizeUniqueConstraintError') {
        // Username already taken
        res.status(403).json({
          msg: 'Username already taken'
        });
      }
      else {
        // Uncaught error
        console.log(err);
        res.status(500).json({
          error: err.name,
          message: err.message
        });
      }
    });
});


router.get('/isAuthorized', requireAuth, (req, res) => {
  res.status(200).json({
    msg: 'Congratulations! You are authorized!'
  });
});
