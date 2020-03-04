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
    },
    screenname: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    // Other model options go here
  });

// Setup database
async function initDatabase() {
  try {
    await users.sync();//{ force: true });
    await sequelize.authenticate();
    console.log('Database created successfuly.');
  } catch (error) {
    console.error('Unable to create database:', error);
  }
}
initDatabase();


async function createLogin(username, password, screenname) {
  /* Encrypt password and store in db */
  await users.create({
    username: username,
    password: bcrypt.hashSync(password, 10),
    screenname: screenname
  }).catch((err) => {
    console.log(err)
  });
}
exports.createLogin = createLogin;


/* Check for user login in database in database */
async function checkLogin(username, password) {
  const rows = await assistant.findAll({
    attributes: ['name', 'password'],
    where: {
      name: username
    }
  }).catch((err) => {
    throw err;
  });
  const hash = rows[0].password;
  return bcrypt.compareSync(password, hash);
}
exports.checkLogin = checkLogin;