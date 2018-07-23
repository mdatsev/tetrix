import express from "express";
var router = express.Router();
import Session from "../schemas/Session";
import Lobby from "../schemas/Lobby";
import User from "../schemas/User";
import crypto from "crypto";

router.use((req, res, next)=> {
  Session.findOne({token: req.cookies.sessionToken}).then((ses)=>{
      if(ses){
        req.username = ses.username
      }
      next()
  })
});

router.get('/create', (req,res)=>{
  if(!req.username) return res.redirect('/login')
  res.render('lobby_create')
})

router.post('/start/:id', async(req,res)=>{
  if(!req.username) return res.redirect('/login')
  let lobby = await Lobby.findOne({id:req.params.id})
  console.log(lobby)
  res.render('game')
})

router.post('/create', async(req,res)=>{
  if(!req.username) return res.redirect('/login')
  let cur_user = await User.findOne({username:req.username}).exec()
  let link = crypto.randomBytes(18).toString("hex")

  await Lobby.create({name:req.body.name, max_players:req.body.players, creator: cur_user.id, link:link})
  res.redirect(`/game/room/${link}`)
})
router.get('/room/:id', (req,res)=>{
  if(!req.username) return res.redirect('/login')
  res.render('Room',{players:[], username:req.username, id:req.params.id})
})

router.get('/', function(req, res) {
    if(!req.username) return res.redirect('/login')
    res.render('game')
});
export default router;
