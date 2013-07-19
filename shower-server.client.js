/*global io:false */
(function (){
    var socket = io.connect('http://' + location.hostname + location.pathname.replace(/(^\/.*)\/$/, '$1'));
    var master = location.search.replace(/^.*master=([^&]*)$/, '$1');

    socket.on('connect', function () {
        socket.emit('setMaster', master, function (data) {
            master = data;
            if (master) {
                // only master emits hashchanges
                addEvent(window, 'hashchange', browserHashchangeHandler);
            } else {
                // master doesn't subscribe to hashchanges
                socket.on('hashchange', socketHashchangeHandler);
            }
        });
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
})();
