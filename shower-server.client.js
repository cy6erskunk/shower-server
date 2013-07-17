/*global io:false */
(function (){
    var socket = io.connect('http://' + location.hostname + location.pathname.replace(/(^\/.*)\/$/, '$1'));
    var master = location.search.replace(/^.*master=([^&]*)$/, '$1');
    var connected = true;

    socket.on('connect', function () {
        socket.emit('setMaster', master, setMasterCallback);
    });


    var button = document.createElement('div');

    button.className = 'changeUpdateStatus';
    button.innerHTML = 'Disconnect';
    button.style.position = 'fixed';
    button.style.left = '50px';
    button.style.bottom = '50px';
    button.style.zIndex = 100000;
    button.style.padding = '0.2em';
    button.style.border = '1px solid black';
    button.style.backgroundColor = 'white';
    document.body.appendChild(button);

    addEvent(button, 'click', function () {
        if (connected) {
            button.innerHTML = 'Connect';
            socket.removeListener('hashchange', socketHashchangeHandler);
        } else {
            button.innerHTML = 'Disonnect';
            socket.emit('setMaster', master, setMasterCallback);
            socket.on('hashchange', socketHashchangeHandler);
        }
        connected = !connected;
    });

    function addEvent(elem, event, fn) {
        if (elem.addEventListener) {
            elem.addEventListener(event, fn, false);
        } else {
            elem.attachEvent('on' + event, function() {
                // set the this pointer same as addEventListener when fn is called
                return fn.call(elem, window.event);
            });
        }
    }

    function socketHashchangeHandler (data) {
        location.hash = data;
    }

    function browserHashchangeHandler () {
        socket.emit('hashchange', {hash: location.hash});
    }

    function setMasterCallback (data) {
        master = data;
        if (master) {
            // only master emits hashchanges
            addEvent(window, 'hashchange', browserHashchangeHandler);
        } else {
            // master doesn't subscribe to hashchanges
            socket.on('hashchange', socketHashchangeHandler);
        }
    }
})();
