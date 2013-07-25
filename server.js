var showerServer = require('./lib/shower-server'),
    express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    hbs = require('hbs'),
    config = {},
    presentations;

require('colors');

io.set('log level', 2);

config = require('./config');

presentations = showerServer.initPresentations(config.presentations);

showerServer.initExpressStatic(presentations, app, __dirname);

showerServer.initSocketHandlers(presentations, io);

server.listen(config.port, config.host);
