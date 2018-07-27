import createTetris from '../js/sketch.js'
window.socket = io('/game/room')

$('#start').on('click', ()=>{
    socket.emit('start', {roomID, username})
})

var roomID = window.location.pathname.split('/').pop(-1)

socket.emit('join', {roomID, username:window.username})

socket.on('player_join', function (data) {
    $('#users').empty()
    data.forEach(player=> {
        $('#users').append($(`<li>${player.username}</li>`).attr('data-id', player.id))
    })
})

socket.on('player_left', function (data) {
    $('#users').find(`[data-id=${data}]`).remove()
})

socket.on('started', function (data) {
    $('#start').remove()
    for(let i = 0;i<data.player_ids.length;i++){
        $('body').append(`<div id=${data.player_ids[i]}></div>`)
        createTetris(data.player_ids[i].toString())
    }
})

socket.on('dead', function(data) {
    data = data.replace(/([/#])/g, "\\$1")
    $(`#${data}`).append('<div>Dead</div>')
})

socket.on('message', (data) => {
    $('#messages').append($('<li>').text(data.username + ': ' + data.message))
})