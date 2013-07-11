var extend = require('extend'),
    file = require('./utils/file'),
    express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    crypto = require('crypto'),
    config = {},
    defaultConfig,
    configFile = 'config.json',
    clientJsFile = 'shower-server.client.js',
    currentHash = null,
    presentations,
    presentationsSockets = {};

require('colors');

io.set('log level', 2);

defaultConfig = {
    host : 'localhost',
    port : 3000,
    singleMode : true,
    presentations : [{}]
};

config = file.readJSON(configFile) || {};

if (config.presentations && Array.isArray(config.presentations)) {
    presentations = config.presentations;
}
config = extend({}, defaultConfig, config);

prepareClientJSFile(clientJsFile);

presentations = initPresentations(presentations);

if (presentations.length > 1) {
    addPresentationListPage(presentations);
}

app.get('/client.js', function (req, res) {
    res.sendfile(__dirname + '/_' + clientJsFile);
});

server.listen(config.port, config.host);

//======================================

function prepareClientJSFile (clientJsFile) {
    var clientJS;

    clientJS = file.read(clientJsFile) || console.error('Could not read client js file!');
    file.write('_' + clientJsFile, clientJS.replace('%HOST%', config.host));
    console.log('Wrote client js file!'.green);
}

function initPresentations(presentations) {
    presentations = presentations.map(function (presentation) {
        !presentation.folder && (presentation.folder = 'presentation');
        if (config.singleMode && presentations.length === 1) {
            presentation.url = '/';
        } else {
            !presentation.url && (presentation.url = '/' + presentation.folder);
            (/\/.*\/$/).test(presentation.url) && presentation.url.replace(/\/$/,'');
        }
        !presentation.file && (presentation.file = 'index.html');
        !presentation.master && (presentation.master = getRandomMasterKey());

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

        if (config.singleMode && presentations.length === 1) {
            console.log('path: '.green + url.yellow + '\n');
            console.log('############################################'.green);
            console.log('#                                          #'.green);
            console.log('#              '.green + 'YOUR MASTER KEY:'.yellow + '            #'.green);
            console.log('#                                          #'.green);
            console.log('# '.green + masterKey.red + ' #'.green);
            console.log('#                                          #'.green);
            console.log('############################################'.green);
        } else {
            console.log('Presentation '.green + (folder + '/' + file).yellow +
                ' is served at '.green + url.yellow + ' with masterKey '.green + masterKey.red);
        }

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

function addPresentationListPage (presentations) {
    app.get('/', function (req, res) {
        var index = '<!DOCTYPE html>';

        index += '<html>';
        index += '<head><title>Presentations list</title><meta encoding="utf8"/></head>';
        index += '<body>';
        index += '<h1>Presentations List</h1>';
        index += '<ul>';
        index += presentations.reduce(function (prev, current) {
            return prev + '<li><a href="' + current.url + '/">' + current.folder + '</a></li>';
        }, '');
        index += '</ul>';
        index += '</body>';
        index += '</html>';

        res.send(index);
    });
}

function getRandomMasterKey() {
    var shasum = crypto.createHash('sha1');
    var secret = process.argv[2] ? process.argv[2] : [
        Math.ceil(Math.random() * 1000),
        (new Date()).getTime(),
        Math.ceil(Math.random() * 1000)
    ].join('');
    shasum.update(secret);
    return shasum.digest('hex');
}
