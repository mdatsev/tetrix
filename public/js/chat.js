function send_msg() {
    socket.emit('message', {
        username: window.username,
        message: $('#message').val()
    })
    $('#message').val('')
}
