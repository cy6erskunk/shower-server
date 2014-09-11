var utils = require('./utils');
var express = require('express');
var clientJsFile = 'shower-server.client.js';
var singleMode;

/**
 * @typedef {Object} Presentation
 *
 * @property {String} [folder='presentation'] - folder to look for presentation
 * @property {String} [url]                   - relative url to show presentation at
 *                                              defaults to '/' in singleMode or
 *                                              Presentation.folder
 * @property {String} [file='index.html']
 * @property {String} [master]                - master-key, aut-generated, when absent
 */

/**
 * Checks presentations and explicitly adds all defaults
 * @param   {Array.<Presentation>} presentations
 * @returns {Array.<Presentation>} presentations
 */
exports.initPresentations = function (presentations) {
    (!presentations || !presentations.length) && (presentations = [{}]);

    singleMode = presentations.length === 1;

    presentations = presentations.map(function (presentation) {
        presentation = require('extend')({
                folder: 'presentation',
                file: 'index.html',
                master: utils.getRandomMasterKey()
            }, presentation);

        presentation.url = singleMode ?
            '/' :
            (presentation.url || '/' + presentation.folder).replace(/^(?!\/)/, '/').replace(/(^.+)\/$/,'$1');

        return presentation;
    });

    return presentations;
};

/**
 * Binds all static files (client js, presentation files and presentations' static)
 * @param  {Array.<presentation>} presentations
 * @param  {Object}               app           - Express app
 * @param  {String}               dirname       - shower-server dirname
 */
exports.initExpressStatic = function (presentations, app, dirname) {

    app.get('/client.js', function (req, res) {
        res.sendfile(clientJsFile);
    });

    if (!singleMode) {
        app.get('/', function (req, res) {
            res.render('index.jade', { presentations: presentations });
        });
    }

    presentations.forEach(function (presentation) {
        var folder = presentation.folder,
            url = presentation.url,
            file = presentation.file,
            masterKey = presentation.master;

        app.get(url, function (req, res) {
            try {
                res.send(200, utils.readFile(dirname + '/' + folder + '/' + file)
                    .replace('</head>', '<script src="/socket.io/socket.io.js"></script></head>')
                    .replace('</body>', '<script type="text/javascript" src="/client.js"></script></body>'));
            } catch (e) {
                res.send(500, 'Whoops, could not modify presentation file...');
            }
        });

        app.use(url, express.static(dirname + '/' + folder));

        console.log('Presentation '.green + (folder + '/' + file).yellow +
            ' is served at '.green + url.yellow + ' with masterKey '.green + masterKey.red);
    });
};

/**
 * Binds all Socket.IO handlers
 * @param   {Array.<presentation>} presentations
 * @param   {Object}               io            - Socket.IO instance
 * @returns {Object}
 */
exports.initSocketHandlers = function (presentations, io) {
    var currentHash = null,
        presentationsSockets = {};

    presentations.forEach(function (presentation) {
        var url = presentation.url,
            masterKey = presentation.master;

        presentationsSockets[url] = (url === '/' ? io.sockets : io.of(url))
            .on('connection', function (socket) {
                var _masterKey = masterKey,
                    _url = url;

                socket
                    .on('setMaster', function (data, sendMasterBack) {
                        socket.isMasterKey = data === _masterKey;

                        socket.isMasterKey && console.log('MASTER connected!'.green);

                        sendMasterBack(socket.isMasterKey);

                        // Update viewer's hash on connect
                        if (!socket.isMasterKey && currentHash) {
                            console.log('EMIT '.green + JSON.stringify(currentHash).yellow +
                                    ' to listener just connected'.green);
                            socket.emit('hashchange', currentHash);
                        }
                    })
                    .on('hashchange', function (data) {
                        console.log('RECEIVED '.green + JSON.stringify(data).yellow);
                        if (socket.isMasterKey) {
                            currentHash = data.hash;
                            console.log('EMIT '.green + JSON.stringify(data.hash).yellow +
                                ' to listeners at '.green + _url.yellow);
                            presentationsSockets[url].emit('hashchange', data.hash);
                        }
                    });
            });

    });

    return presentationsSockets;
};
