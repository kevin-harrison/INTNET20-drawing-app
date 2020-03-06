'use strict';

// Imports
const { Sequelize, DataTypes, QueryTypes } = require('sequelize');
const bcrypt = require('bcrypt');

// ------------------------------ Define database ------------------------------
const sequelize = new Sequelize('', '', '', {
  dialect: 'sqlite',
  storage: './database.sqlite'
});

const rooms = sequelize.define('Rooms', {
  name: {
    type: DataTypes.STRING,
    primaryKey: true
  }
}, {
  // Other model options go here
});

const sockets = sequelize.define('Sockets', {
  socketID: {
    type: DataTypes.STRING,
    primaryKey: true
  },
  currentRoomName: {
    type: DataTypes.STRING,
    allowNull: true,
    references: {
      model: rooms,
      key: 'name',
    }
  }
}, {
  // Other model options go here
});

const users = sequelize.define('Users', {
  username: {
    type: DataTypes.STRING,
    primaryKey: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  socketID: {
    type: DataTypes.STRING,
    allowNull: true,
    references: {
      model: sockets,
      key: 'socketID',
    }
  }
}, {
  // Other model options go here
});

const lines = sequelize.define('Lines', {
  roomName: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: rooms,
      key: 'name',
    }
  },
  style: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  // Other model options go here
});

// -----------------------------------------------------------------------------

// Setup database
async function initDatabase() {
  try {
    await rooms.sync({ force: true });
    await sockets.sync({ force: true });
    await users.sync({ force: true });
    await lines.sync({ force: true });
    await sequelize.authenticate();

    await rooms.create({ name: 'Test1' });
    await rooms.create({ name: 'Test2' });

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

async function getRooms() {
  const rows = await rooms.findAll({
    attributes: ['name']
  }).catch((err) => {
    throw err;
  })
  return rows;
}
exports.getRooms = getRooms;