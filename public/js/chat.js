function sendMsg(message) {
    socket.emit('message', {
        username: window.username,
        message: $('#message').val()
    });
    $('#message').val('');
}
