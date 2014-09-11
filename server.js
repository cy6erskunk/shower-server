var showerServer = require('./lib/shower-server'),
    express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    config = {},
    presentations;

require('colors');

config = require('./config');

presentations = showerServer.initPresentations(config.presentations);

showerServer.initExpressStatic(presentations, app, __dirname);

showerServer.initSocketHandlers(presentations, io);

server.listen(config.port, config.host);
