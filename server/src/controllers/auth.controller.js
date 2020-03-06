'use strict';

const express = require('express');
const router = express.Router();
const database = require('../database.js');
const jwt = require('jsonwebtoken');


// Authentication gaurd
const requireAuth = (req, res, next) => {
  const ip = req.header('x-forwarded-for') || req.connection.remoteAddress;
  jwt.verify(req.signedCookies.jwt, process.env.KEY, (err, decoded) => {
    if (err || decoded.ipAddress !== ip) {
      res.status(401).send('Unauthorized. Please make sure you are logged in before attempting this action again.');
      return;
    }
    else {
      next();
    }
  });
};
module.exports = { router, requireAuth };

// ---------------------------------------- API routes -------------------------------------------------

function createToken(username, ip){
  // sign with default (HMAC SHA256)
  let expirationDate =  Math.floor(Date.now() / 1000) + 30000 //30000 seconds from now
  var token = jwt.sign({ userID: username, ipAddress: ip, exp: expirationDate }, process.env.KEY);
  return token;
}

router.post('/login', (req, res) => {
  database.checkLogin(req.body.username, req.body.password)
    .then(function(result) {
      if (result === true) {
        const ip = req.header('x-forwarded-for') || req.connection.remoteAddress;
        const token  = createToken(req.body.username, ip);
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
