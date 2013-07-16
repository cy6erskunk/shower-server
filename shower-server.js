var utils = require('./utils/utils'),
    express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    hbs = require('hbs'),
    config = {},
    singleMode = false,
    clientJS,
    clientJsFile = 'shower-server.client.js',
    presentations,
    presentationsSockets = {};

require('colors');

io.set('log level', 2);

config = require('./config');

presentations = initPresentations(config.presentations);
if (!singleMode) {
    app.get('/', function (req, res) {
        res.render('presentations.hbs', { presentations: presentations });
    });
}

clientJS = utils.readFile(clientJsFile).replace('%HOST%', config.host);
app.get('/client.js', function (req, res) {
    res.setHeader('content-type', 'application/javascript');
    res.send(clientJS);
});

server.listen(config.port, config.host);

//======================================

function initPresentations(presentations) {
    var currentHash = null;

    singleMode = !presentations || presentations.length === 1;

    presentations = presentations.map(function (presentation) {
        presentation = require('extend')({
                folder: 'presentation',
                file: 'index.html',
                master: utils.getRandomMasterKey()
            }, presentation);

        presentation.url = singleMode ?
            '/' :
            (presentation.url || '/' + presentation.folder).replace(/(^.+)\/$/,'$1');

        return presentation;
    });

    presentations.forEach(function (presentation) {
        var folder = presentation.folder,
            url = presentation.url,
            file = presentation.file,
            masterKey = presentation.master;

        app.use(url, express.static(__dirname + '/' + folder));
        app.get(url, function (req, res) {
            res.sendfile(__dirname + '/' + folder + '/' + file);
        });

        console.log('Presentation '.green + (folder + '/' + file).yellow +
            ' is served at '.green + url.yellow + ' with masterKey '.green + masterKey.red);

        presentationsSockets[url] = (url === '/' ? io : io.of(url))
            .on('connection', function (socket) {
                var _masterKey = masterKey,
                    _url = url;

                socket
                    .on('setMaster', function (data) {
                        console.log((data === _masterKey).toString().red + ' MASTER connected!'.green);
                        socket.set('_masterKey', (data === _masterKey));
                        // Update viewer's hash on connect
                        if ((data !== _masterKey) && currentHash) {
                            socket.emit('hashchange', currentHash);
                        }
                    })
                    .on('hashchange', function (data) {
                        console.log(data);
                        socket.get('_masterKey', function (err, _masterKey) {
                            if (_masterKey) {
                                currentHash = data.hash;
                                console.log('BROADCAST!'.green);
                                presentationsSockets[_url].emit('hashchange', data.hash);
                            }
                        });
                    });
            });
    });

    return presentations;
}
