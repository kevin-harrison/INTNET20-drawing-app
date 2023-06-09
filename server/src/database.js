'use strict';

// Imports
const { Sequelize, DataTypes, QueryTypes } = require('sequelize');
const bcrypt = require('bcrypt');

// ------------------------------ Define database ------------------------------
const sequelize = new Sequelize('', '', '', {
  dialect: 'sqlite',
  storage: './database.sqlite',
  logging: false
});

const rooms = sequelize.define('Rooms', {
  name: {
    type: DataTypes.STRING,
    primaryKey: true
  },
  owner: {
    type: DataTypes.STRING,
    allowNull: true, // TODO: change to false once done testing!
    // TODO: Add correct foreign key constraint, doing it this ways add a cyclical dependency which sequelize cant handlew
    //references: {
    //  model: users,
    //  key: 'username',
    //}
  }
}, {
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


const lines = sequelize.define('Lines', {
  roomName: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: rooms,
      key: 'name',
    }
  },
  data: {
    type: DataTypes.STRING,
    allowNull: false
  },
  style: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  // Other model options go here
});
// -----------------------------------------------------------------------------


// Setup database
async function initDatabase() {
  try {
    await lines.sync();//{ force: true });
    await users.sync();//{ force: true });
    await rooms.sync();//{ force: true });
    await sequelize.authenticate();

    // TEMPORARY EXAMPLE DATA
    //await rooms.create({ name: 'Room 1' });
    //await rooms.create({ name: 'Room 2' });

    console.log('Database created successfuly.');
  } catch (error) {
    console.error('Unable to create database: ');
    throw error;
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


async function getUser(username) {
  const row = await users.findOne({
    where: {
      username: username
    }
  }).catch((err) => {
    throw err;
  });
  return row;
}
exports.getUser = getUser;


async function getRooms() {
  const rows = await rooms.findAll({
    attributes: ['name', 'owner']
  }).catch((err) => {
    throw err;
  })
  return rows;
}
exports.getRooms = getRooms;


async function getRoom(roomName) {
  const row = await rooms.findOne({
    attributes: ['name'],
    where: {
      name: roomName
    }
  }).catch((err) => {
    throw err;
  });
  return row;
}
exports.getRoom = getRoom;


async function addRoom(userID, roomName) {
  await rooms.create({ name: roomName, owner: userID });
}
exports.addRoom = addRoom;


// TODO: Handle foreign key deletion with onDelete settings in database
async function removeRoom(userID, roomName) {
  const roomExists = await rooms.findOne({ where: { name: roomName, owner: userID } });
  if (roomExists) {
    await users.update({ currentRoomName: null }, { where: { currentRoomName: roomName } });
    await lines.destroy({ where: { roomName: roomName } });
    await rooms.destroy({ where: { name: roomName, owner: userID } });
  } 
  return roomExists;
}
exports.removeRoom = removeRoom;


async function getRoomLines(roomName) {
  const rows = await lines.findAll({
    attributes: ['data', 'style'],
    where: {
      roomName: roomName
    }
  }).catch((err) => {
    throw err;
  });
  return rows;
}


async function joinRoom(userID, roomName) {
  await users.update({ currentRoomName: roomName }, {where: { username: userID}});
  console.log(`${userID} joined ${roomName} in database`);
  const usersInRoom = await users.findAll({
    attributes: ['username'],
    where: {
      currentRoomName: roomName
    }
  });
  const roomLines = await getRoomLines(roomName);
  return { users: usersInRoom, lineData: roomLines };
}
exports.joinRoom = joinRoom;

async function leaveRoom(userID) {
  const leftRoom = await users.findOne({
    attributes: ['currentRoomName'],
    where: {
      username: userID
    }
  });
  users.update({ currentRoomName: null }, {where: { username: userID}});
  console.log(`${userID} left ${leftRoom.currentRoomName} in database`);
  return leftRoom.currentRoomName;
}
exports.leaveRoom = leaveRoom;

async function addLine(roomName, lineData, style) {
  await lines.create({ roomName: roomName, data: lineData , style: style });
}
exports.addLine = addLine;


async function clearRoom(roomName) {
  lines.destroy({ where: { roomName: roomName } });
}
exports.clearRoom = clearRoom;