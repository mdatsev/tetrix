import Lobby from "../schemas/Channel"
import User from "../schemas/User"
import tetrisMaker from "./tetris.mjs"
export default function channelHandler(io) {
  var manager = io.of("/channel").on('connection', function (socket) {
    let uid;
    let roomid;
    socket.on("disconnect", async()=>{
       let lobby = await Lobby.findOneAndUpdate( {link: roomid}, { $pullAll: {players: [uid] }}, {"new":true}  ).exec()
       
      if(lobby.players.length == 0){
        await Lobby.deleteOne({link:roomid}).exec()
      }
       socket.join(roomid)
       manager.to(roomid).emit('player_left',uid)
    })
    socket.on('inputs', async(pkg)=>{
      let tetris = tetrises.filter(t=>t.id == socket.id)[0].tetris
      tetris.update(pkg.inputs)
      socket.join(roomid);
      manager.to(roomid).emit('sync', {data:tetris.serialize(), id:socket.id})
    })
    socket.on("start", async(pkg)=>{
        socket.join(pkg.roomID);
        // let lobby = await Lobby.findOne({link:pkg.roomID}).populate('players').exec()
        for(const id of player_ids[roomid]){
           tetrises.push({tetris:tetrisMaker(), id})
        }
        manager.to(roomid).emit("started", {player_ids: player_ids[roomid]})
    })
    socket.on("join", async(pkg)=>{

      socket.join(pkg.roomID);
      uid = (await User.findOne({username: pkg.username}).exec()).id
      roomid = pkg.roomID
      if(!player_ids[roomid])
        player_ids[roomid] = []
      player_ids[roomid].push(socket.id)

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