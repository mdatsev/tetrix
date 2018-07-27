// @ts-check

import Lobby from "../schemas/Lobby";
import User from "../schemas/User";
import GameManager from "../common/game_manager.mjs";
export default function lobbyHandler(io) {
    let rooms = {}
    let player_ids = {}
    io.on('connection', (socket) => {

    })
    var manager = io.of("/game/room").on('connection', function (socket) {
        let uid;
        let roomid;
        let last_inputs;
        socket.on("disconnect", async () => {
            rooms[roomid].player_leave(socket.id)
            // clearInterval(tetrises.filter(t => t.id == socket.id)[0].timer_id)
            // let lobby = await Lobby.findOneAndUpdate({ link: roomid }, { $pullAll: { players: [uid] } }, { "new": true }).exec()

            // if (lobby.players.length == 0) {
            //     await Lobby.deleteOne({ link: roomid }).exec()
            // }
            socket.join(roomid);
            manager.to(roomid).emit('player_left', uid);
        })
        socket.on('inputs', async (pkg) => {
            rooms[roomid].input(socket.id, pkg.inputs)
            // let tetris = tetrises.filter(t => t.id == socket.id)[0].tetris
            // tetris.update(pkg.inputs)
            // last_inputs = pkg.inputs
            socket.join(roomid);
        })
        socket.on("start", async (pkg) => {
            socket.join(pkg.roomID);
            rooms[roomid].start()
            // let lobby = await Lobby.findOne({link:pkg.roomID}).populate('players').exec()
            // for (const id of player_ids[roomid]) {
                // let tetris = tetrisMaker(t => manager.to(roomid).emit('sync', {data:t.serialize(), id:socket.id}))
                // tetrises.push({ tetris, id, timer_id: 
                //     setInterval(() => {if(last_inputs)tetris.update(last_inputs, true)}, 16) })
            // }
            manager.to(roomid).emit("started", { player_ids: rooms[roomid].tetrises.map(t=>t.meta.id) })
        })
        socket.on("join", async (pkg) => {
            roomid = pkg.roomID
            if(!rooms[roomid])
                rooms[roomid] = new GameManager(t => manager.to(roomid).emit('sync', {data:t.serialize(), id:t.meta.id}))
            console.log(socket.id)
            rooms[roomid].player_join(socket.id, pkg.username)
            socket.join(pkg.roomID);
            // uid = (await User.findOne({ username: pkg.username }).exec()).id
            // if (!player_ids[roomid])
            //     player_ids[roomid] = []
            // player_ids[roomid].push(socket.id)

            // let lobby = await Lobby.findOneAndUpdate(
            //     {
            //         "link": pkg.roomID,
            //         $where: 'this.players.length<this.max_players'
            //     },
            //     {
            //         $push: { players: uid }
            //     },
            //     { "new": true }).populate('players').exec()

            manager.to(roomid).emit('player_join', rooms[roomid].tetrises.map(t => ({ username: t.meta.username, id: t.meta.id })));
        })

        socket.on('message', async (data) => {
            
            manager.to(roomid).emit('message', data);
        })
    })
}