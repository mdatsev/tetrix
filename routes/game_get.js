var express = require('express');
var router = express.Router();
const Session = require('../schemas/Session')
const Lobby = require('../schemas/Lobby')
const User = require('../schemas/User')
const Crypto =  require('crypto')

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

router.post('/create', async(req,res)=>{
  if(!req.username) return res.redirect('/login')
  let cur_user = await User.findOne({username:req.username}).exec()
  let link = Crypto.randomBytes(18).toString("hex")

  await Lobby.create({name:req.body.name, max_players:req.body.players, creator: cur_user.id, link:link})
  res.redirect(`/game/room/${link}`)
})
router.get('/room/:id', (req,res)=>{
  if(!req.username) return res.redirect('/login')
  console.log(req.username)
  res.render('Room',{players:[], username:req.username})
})

router.get('/', function(req, res) {
    if(!req.username) return res.redirect('/login')
    res.render('game')
});
module.exports = router;
