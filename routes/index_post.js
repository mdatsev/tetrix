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
            return res.redirect('/game')
        }
    }
    res.cookie('error', 'Incorrect username or password!')
    return res.redirect('/login')
});
const Skin = require('../schemas/Skin')
router.post('/register',async(req, res, next)=> {
    let user = await User.findOne({username:req.body.username}).exec()
    if(!user) {
        let hash = await bcrypt.hash(req.body.password,saltRounds)
        let skin = await Skin.findOne({name: "skin"})
        await User.create({username:req.body.username, password:hash, tBucks:10, tCoins: 1000, equippedSkin: skin._id})
        return res.redirect('/game')
    }
    res.cookie('error', 'This user already exists!')
    return res.redirect('/register')
});
module.exports = router;
