const express = require('express');
const accountsRouter = require('./accountsRouter');

const server = express();

server.use('/accounts', accountsRouter);

module.exports = server;
