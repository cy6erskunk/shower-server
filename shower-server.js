var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    crypto = require('crypto'),
    master =  (function () {
        var shasum = crypto.createHash('sha1');
        var secret = process.argv[2] ? process.argv[2] : [
            Math.ceil(Math.random() * 1000),
            (new Date()).getTime(),
            Math.ceil(Math.random() * 1000)
            ].join('');
        shasum.update(secret);
        return shasum.digest('hex');
    })(),
    currentHash = null;

console.log('############################################');
console.log('#                                          #');
console.log('#              YOUR MASTER KEY:            #');
console.log('#                                          #');
console.log('# ' + master + ' #');
console.log('#                                          #');
console.log('############################################');


server.listen(3000);

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/presentation/index.html');
});

app.get('/client.js', function (req, res) {
  res.sendfile(__dirname + '/shower-server.client.js');
});

app.use(express.static(__dirname + '/presentation'));

io.sockets.on('connection', function (socket) {

    socket.on('setMaster', function (data) {
        console.log((data === master) + ' MASTER connected!');
        socket.set('master', (data === master));
        // Update viewer's hash on connect
        if ((data !== master) && currentHash) {
            socket.emit('hashchange', currentHash);
        }
    });

    socket.on('hashchange', function (data) {
        console.log(data);
        socket.get('master', function (err, master) {
            console.log(master);
            if (master) {
                currentHash = data.hash;
                console.log('BROADCAST!');
                socket.broadcast.emit('hashchange', data.hash);
            }
        });
    });
});

