'use strict';

const express = require('express');
const router = express.Router();
const database = require('../database.js');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');


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

// Socket authentication gaurd
const requireAuthSocket = (socket, next) => {
  // Parse socket request
  const token  = cookieParser.signedCookie(socket.handshake.cookies.jwt, process.env.KEY);
  const ip = socket.handshake.headers['x-forwarded-for'] === null ? 
    socket.handshake.address : 
    socket.handshake.headers['x-forwarded-for'];

  jwt.verify(token, process.env.KEY, (err, decoded) => {
    if(err || decoded.ipAddress !== ip) return;
    socket.tokenInfo = decoded; // TODO: is this ok security-wise?
    next();
  });
};

module.exports = { router, requireAuth, requireAuthSocket };

// ---------------------------------------- API routes -------------------------------------------------

function sendToken(req, res){  
  const tokenLifetime = 30000;
  const tokenExpirationDate = new Date(Date.now() + (tokenLifetime * 1000));
  const ip = req.header('x-forwarded-for') || req.connection.remoteAddress;

  var token = jwt.sign({
    userID: req.body.username, 
    sessionID: req.session.id,
    ipAddress: ip, 
    expiresIn: tokenLifetime 
  }, process.env.KEY);

  res.cookie('jwt', token, { 
    expires: tokenExpirationDate,
    signed: true, 
    secure: false, // TODO: make true once HTTPS works
    httpOnly: true
  });
}

router.post('/login', (req, res) => {
  database.checkLogin(req.body.username, req.body.password)
    .then(function(result) {
      if (result === true) {
        sendToken(req, res);
        res.status(200).json({
          msg: 'Login succcessful',
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
