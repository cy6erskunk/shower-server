/*global io:false */
(function (){
    var socket = io.connect('http://' + location.hostname + location.pathname.replace(/(^\/.*)\/$/, '$1')),
        queryParams = (function () {
            return location.search.substring(1).split('&').map(function (pair) {
                return pair.split('=');
            }).reduce(function (prev, current) {
                prev[current[0]] = current.length === 2 ? current[1] : true;
                return prev;
            }, {});
        })(),
        master = false,
        debug = function (message) {
            if (queryParams.debug) {
                console.log(message);
            }
        },
        connected = false;

    socket.on('connect', function () {
        connected = true;
        debug('connected, master=' + queryParams.master);
        socket.emit('setMaster', queryParams.master, setMasterCallback);
        addDisconnectButton()
    });

    function addEvent(elem, event, fn) {
        if (elem.addEventListener) {
            elem.addEventListener(event, fn, false);
        } else {
            elem.attachEvent('on' + event, function () {
                // set the this pointer same as addEventListener when fn is called
                return fn.call(elem, window.event);
            });
        }
    }

    function socketHashchangeHandler(data) {
        if (connected) {
            debug('RECEIVED: ' + JSON.stringify(data));
            location.hash = data;
        }
    }

    function browserHashchangeHandler() {
        var dataToEmit = { hash: location.hash };
        if (connected) {
            debug('EMIT: ' + JSON.stringify(dataToEmit))
            socket.emit('hashchange', dataToEmit);
        }
    }

    function setMasterCallback(isClientMaster) {
        master = isClientMaster;
        if (master) {
            debug('OK, adding event handler on hashchange');
            // only master emits hashchanges
            addEvent(window, 'hashchange', browserHashchangeHandler);
            // emit current position
            browserHashchangeHandler();
        } else {
            debug('Nyan, subscribing to socket messages');
            // master doesn't subscribe to hashchanges
            socket.on('hashchange', socketHashchangeHandler);
        }
    }

    function addDisconnectButton() {
        var button = document.createElement('div'),
            initialOpacity = 0.2;

        button.className = 'connectButton';
        button.innerHTML = 'Disconnect';
        button.style.position = 'fixed';
        button.style.left = '50px';
        button.style.top = '50px';
        button.style.zIndex = 100000;
        button.style.padding = '0.2em';
        button.style.border = '1px solid black';
        button.style.borderRadius = '5px';
        button.style.opacity = initialOpacity;
        button.style.backgroundColor = 'white';
        document.body.appendChild(button);

        addEvent(button, 'click', function () {
            connected = !connected;

            if ( ! connected) {
                button.innerHTML = 'Connect';
                if ( ! master) {
                    socket.removeAllListeners();
                }
            } else {
                button.innerHTML = 'Disconnect';
                if (master) {
                    // master sends update on re-connection
                    browserHashchangeHandler();
                } else {
                    socket.emit('setMaster', queryParams.master, setMasterCallback);
                }
            }
        });

        addEvent(button, 'mouseover', function () {
            button.style.opacity = 1;
        });

        addEvent(button, 'mouseout', function () {
            button.style.opacity = initialOpacity;
        });
    }

})();
