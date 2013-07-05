var fs = require('fs'),
    iconv = require('iconv-lite'),
    express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    crypto = require('crypto'),
    config,
    configFile = 'config.json',
    currentHash = null,
    presentations,
    presentationsSockets = {};

io.set('log level', 2);

var file = {};

file.defaultEncoding = 'utf8';

// Read a file, return its contents.
file.read = function(filepath, options) {
    if (!options) { options = {}; }

    var contents;

    try {
        contents = fs.readFileSync(String(filepath));
        // If encoding is not explicitly null, convert from encoded buffer to a
        // string. If no encoding was specified, use the default.
        if (options.encoding !== null) {
            contents = iconv.decode(contents, options.encoding || file.defaultEncoding);
            // Strip any BOM that might exist.
            if (contents.charCodeAt(0) === 0xFEFF) {
                contents = contents.substring(1);
            }
        }

        return contents;
    } catch(e) {
        console.error('Unable to read "' + filepath + '" file (Error code: ' + e.code + ').', e);
    }
};

// Read a file, parse its contents, return an object.
file.readJSON = function(filepath, options) {
    var src = file.read(filepath, options),
        result;

    try {
        result = JSON.parse(src);
        return result;
    } catch(e) {
        console.error('Unable to parse "' + filepath + '" file (' + e.message + ').', e);
    }
};

if (fs.existsSync(configFile)) {
    config = file.readJSON(configFile);
}

if (config && config.presentations && Array.isArray(config.presentations)) {
    presentations = config.presentations;
} else {

    presentations = [{
        'folder' : 'presentation',
        'url'    : '/',
        'master' : getRandomMasterKey(),
        'file'   : 'index.html'
    }];

}


presentations.forEach(function (presentation) {
    var folder = presentation.folder,
        url = presentation.url || '/' + presentation.folder,
        file = presentation.file || 'index.html',
        masterKey = presentation.master || getRandomMasterKey();

    app.use(url, express.static(__dirname + '/' + folder));
    app.get(url, function (req, res) {
        res.sendfile(__dirname + '/' + folder + '/' + file);
    });

    if (presentations.length === 1) {
        console.log('path: "' + url + '"');
        console.log('############################################');
        console.log('#                                          #');
        console.log('#              YOUR MASTER KEY:            #');
        console.log('#                                          #');
        console.log('# ' + masterKey + ' #');
        console.log('#                                          #');
        console.log('############################################');
    } else {
        console.log('Presentation  "' + folder + '/' + file + '" is served at ' + url + ' with masterKey=' + masterKey);
    }

    presentationsSockets[url] = (url === '/' ? io : io.of(url))
        .on('connection', function (socket) {
            var _masterKey = masterKey,
                _url = url;

            socket
                .on('setMaster', function (data) {
                    console.log((data === _masterKey) + ' MASTER connected!');
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
                            console.log('BROADCAST!');
                            presentationsSockets[_url].emit('hashchange', data.hash);
                        }
                    });
                });
        });

});


app.get('/client.js', function (req, res) {
    res.sendfile(__dirname + '/shower-server.client.js');
});

server.listen(3000);

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