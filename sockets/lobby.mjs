import Lobby from "../schemas/Lobby";
import User from "../schemas/User";
import tetrisMaker from "./tetris.mjs"
export default function lobbyHandler(io){
  let tetrises = []
  io.on('connection', (socket)=>{
    
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
      let tetris = tetrises.filter(t=>t.id == pkg.id)[0].tetris
      tetris.update(pkg.inputs)
      socket.join(roomid);
      manager.to(roomid).emit('sync', {data:tetris.serialize(), id:pkg.id})
    })
    socket.on("start", async(pkg)=>{
        socket.join(pkg.roomID);
        let lobby = await Lobby.findOne({link:pkg.roomID}).populate('players').exec()
        for(let i=0;i<lobby.players.length;i++){
           tetrises.push({tetris:tetrisMaker(), id:lobby.players[i].id})
        }
        manager.to(roomid).emit("started", {players_lenght:lobby.players.length, players_id: lobby.players.map(u=>u.id)})
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