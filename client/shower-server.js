/*global io:false */
var ioUrl = 'http://%HOST%' + location.pathname.replace(/(^\/.*)\/$/, '$1');
var socket = io.connect(ioUrl);
var master = location.search.replace(/^.*master=([^&]*)$/, '$1');

socket.on('connect', function () {
    socket.emit('setMaster', master);
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

addEvent(window, 'hashchange', function () {
    socket.emit('hashchange', { hash: location.hash });
});

var commentsForm = document.createElement('div');
commentsForm.className = 'commentsForm';
commentsForm.innerHTML = '<input type="text" name="name" class="nameInput"/><textarea name="comment" class="commentText"></textarea><button class="commentPostButton">post</button>';
document.body.appendChild(commentsForm);

var cssLink = document.createElement('link');
cssLink.setAttribute('rel', 'stylesheet');
cssLink.href = '/client.css';
document.body.appendChild(cssLink);

(function () {
    var name = document.getElementsByClassName('nameInput')[0],
        comment = document.getElementsByClassName('commentText')[0];

    addEvent(document.getElementsByClassName('commentPostButton')[0], 'click', function () {
        if (comment.value) {
            socket.emit('comment', {
                name : name.value || 'anonymous',
                comment: comment.value
            });
            name.value = '';
            comment.value = '';
            alert('comment sent');
        }
    });
})();
