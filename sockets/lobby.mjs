import Lobby from "../schemas/Lobby";
import User from "../schemas/User";
import tetrisMaker from "./tetris.mjs"
export default function lobbyHandler(io){
  let tetris
  io.on('connection', (socket)=>{
    tetris = tetrisMaker();
  })
  var manager = io.of("/game/room").on('connection', function (socket) {
    let uid;
    let roomid;
    socket.on("disconnect", async()=>{
       let lobby = await Lobby.findOneAndUpdate( {link: roomid}, { $pullAll: {players: [uid] }}, {"new":true}  ).exec()
       
      if(lobby.players.length == 0){
        await Lobby.deleteOne({link:roomid}).exec()
      }
       socket.join(roomid);
       manager.to(roomid).emit('player_left',uid);
    })
    socket.on('inputs', async(pkg)=>{
      tetris.update(pkg)
      socket.join(roomid);
      manager.to(roomid).emit('sync', tetris.serialize())
    })
    socket.on("start", async(pkg)=>{
        socket.join(pkg.roomID);
        let lobby = await Lobby.findOne({link:pkg.roomID})
        manager.to(roomid).emit("started", lobby.players.length)
    })
    socket.on("join", async(pkg)=>{
        socket.join(pkg.roomID);
        uid = (await User.findOne({username: pkg.username}).exec()).id
        roomid = pkg.roomID
        let lobby = await Lobby.findOneAndUpdate(
          {
            "link":pkg.roomID,
            $where:'this.players.length<this.max_players'
          },
          {
            $push: {players: uid}
          },
          {"new":true}).populate('players').exec()
         
          manager.to(roomid).emit('player_join',lobby.players.map(p=>({username:p.username, id: p.id})));
    })
  })
}