const express = require('express');
const router = require('./router');
const server = express();

server.use(express.json());
server.use(router);

server.get('/', (req, res) => {
  res.send('<h1>:(</h1>')
})

module.exports = server;