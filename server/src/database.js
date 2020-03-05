'use strict';

// Imports
const { Sequelize, DataTypes, QueryTypes } = require('sequelize');
const bcrypt = require('bcrypt');

// Define database
const sequelize = new Sequelize('', '', '', {
  dialect: 'sqlite',
  storage: './database.sqlite'
});

const users = sequelize.define('Users', {
    // Model attributes are defined here
    username: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    // Other model options go here
});

// Setup database
async function initDatabase() {
  try {
    await users.sync({ force: true });
    await sequelize.authenticate();
    console.log('Database created successfuly.');
  } catch (error) {
    console.error('Unable to create database:', error);
  }
}
initDatabase();


async function createLogin(username, password) {
  /* Encrypt password and store in db */
  await users.create({
    username: username,
    password: bcrypt.hashSync(password, 10)
  }).catch((err) => {
    throw err;
  });
}
exports.createLogin = createLogin;


/* Check for user login in database */
async function checkLogin(username, password) {
  const rows = await users.findAll({
    attributes: ['username', 'password'],
    where: {
      username: username
    }
  }).catch((err) => {
    throw err;
  });

  if (rows[0] !== undefined) {
    const hash = rows[0].password;
    return bcrypt.compareSync(password, hash);
  }
  return false;
}
exports.checkLogin = checkLogin;


/* Check for user in database */
async function findUser(username) {
  const rows = await users.findAll({
    attributes: ['username'],
    where: {
      username: username
    }
  }).catch((err) => {
    throw err;
  });

  if (rows[0] !== undefined) {
    return true;
  }
  return false;
}
exports.findUser = findUser;