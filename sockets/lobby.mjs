import Lobby from "../schemas/Lobby";
import User from "../schemas/User";
export default function lobbyHandler(io){
  io.on('connection', (socket)=>{
    socket.on('keypress', (data)=>{
      console.log(data)  
    })
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

    socket.on('message', async (data) => {
      manager.to(roomid).emit('message',data);
    })
  })
}