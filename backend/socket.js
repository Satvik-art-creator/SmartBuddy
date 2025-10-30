const socketState = {
  io: null,
  userSocketMap: new Map(),
};

function setIO(ioInstance) {
  socketState.io = ioInstance;
}

function getIO() {
  return socketState.io;
}

function getUserSocketMap() {
  return socketState.userSocketMap;
}

module.exports = {
  setIO,
  getIO,
  getUserSocketMap,
};
