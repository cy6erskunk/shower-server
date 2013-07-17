/*global io:false */
var ioUrl = 'http://%HOST%' + location.pathname.replace(/(^\/.*)\/$/, '$1');
var socket = io.connect(ioUrl);
var master = location.search.replace(/^.*master=([^&]*)$/, '$1');

socket.on('connect', function () {
    socket.emit('setMaster', master, function (data) {
        master = data;
        if (master) {
            addEvent(window, 'hashchange', function () {
                socket.emit('hashchange', {hash: location.hash});
            });
        }
    });
});

socket.on('hashchange', function (data) {
    console.log(data);
    location.hash = data;
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

