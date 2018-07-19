var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');
const User = require('../schemas/User')
const Session = require('../schemas/Session')
const Crypto =  require('crypto')
const saltRounds = 10
router.post('/login', async(req, res, next)=> {
    let user = await User.findOne({username:req.body.username}).exec()
    if(user){
        let authenticated = await bcrypt.compare(req.body.password,user.password)
        if(authenticated){
            let token = Crypto.randomBytes(48).toString("hex")
            Session.create({username:req.body.username, token:token})
            res.cookie('sessionToken',  token)
            res.redirect('/game')
        }
    }
});
router.post('/register',async(req, res, next)=> {
   let hash = await bcrypt.hash(req.body.password,saltRounds)  
   await User.create({username:req.body.username, password:hash})
   res.redirect('/login')
});
module.exports = router;
