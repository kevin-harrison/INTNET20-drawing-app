'use strict';

const express = require('express');
const router = express.Router();
const database = require('../database.js');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

// ------------------------------------------------ GAURDS ----------------------------------------------------------
/**
 * Authentication gaurd middleware.
 * Checks that a request has a valid JWT and that the IP address of the request is reflected in the token.
 */
const requireAuth = (req, res, next) => {
  const ip = req.header('x-forwarded-for') || req.connection.remoteAddress;
  jwt.verify(req.signedCookies.jwt, process.env.KEY, (err, decoded) => {
    if (err || decoded.ipAddress !== ip) {
      res.status(401).send('Unauthorized. Please make sure you are logged in before attempting this action again.');
      return;
    }
    else {
      req.tokenInfo = decoded;
      next();
    }
  });
};

/**
 * Socket Authentication gaurd middleware.
 * Checks that the socket's connection handshake has a valid JWT and that the IP address of the request
 * is reflected in the token.
 */
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
// ------------------------------------------------------------------------------------------------------------------
module.exports = { router, requireAuth, requireAuthSocket };
// ---------------------------------------------- API ROUTES --------------------------------------------------------
/**
 * Intercepts the login API and stores a JWT token in an HTTP only cookie of the response. 
 * @param {String} req.body.username - The username of the login attempt
 * @param {String} req.connection.remoteAddress - The IP address of the login attempt (uses x-forwarded-for head if available)
 */
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

/**
 * Login API.
 * Consults with the database to check if the login is valid.
 * If the login is valid a JWT will be sent to the client in a cookie.
 * @param {String} req.body.username - The username of the login attempt
 * @param {String} req.body.password - The password of the login attempt
 */
router.post('/login', (req, res) => {
  database.checkLogin(req.body.username, req.body.password)
    .then(function(result) {
      if (result === true) {
        sendToken(req, res);
        res.status(200).json({
          msg: 'Login successful',
        });
      } else {
        res.status(401).json({
          msg: 'Login failed'
        });
      }
    })
});

/**
 * Logout API.
 * Replaces the JWT with an empty expired cookie.
 */
router.get('/logout', (req, res) => {
  res.cookie('jwt', null, { 
    expires: new Date(Date.now()),
    signed: true, 
    secure: false, // TODO: make true once HTTPS works
    httpOnly: true
  });
  res.status(200).json({
    msg: 'Logout successful'
  });
});

/**
 * Registration API.
 * Consults with the database to check if username is already taken.
 * If the username is taken, sends a 403 status.
 * Otherwise creates a new user entity in the database.
 * @param {String} req.body.username - The username of the registration attempt
 * @param {String} req.body.password - The password of the registration attempt
 */
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

/**
 * Small API to help client check if they are authorized or not.
 * Checks for a valid JWT.
 */
router.get('/isAuthorized', requireAuth, (req, res) => {
  res.status(200).json({
    msg: 'Congratulations! You are authorized!'
  });
});
// ------------------------------------------------------------------------------------------------------------------
