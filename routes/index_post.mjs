import express from 'express'
var router = express.Router()
import bcrypt from 'bcrypt'
import User from '../schemas/User'
import Session from '../schemas/Session'
import Skin from '../schemas/Skin'
import crypto from 'crypto'
const saltRounds = 10

router.post('/login', async(req, res, next)=> {
    let user = await User.findOne({username:req.body.username}).exec()
    if(user){
        let authenticated = await bcrypt.compare(req.body.password,user.password)
        if(authenticated){
            let token = crypto.randomBytes(48).toString('hex')
            Session.create({username:req.body.username, token:token})
            res.cookie('sessionToken',  token)
            return res.redirect('/menu')
        }
    }
    res.cookie('error', 'Incorrect username or password!')
    return res.redirect('/login')
})
router.get('/menu', (req,res)=>{
    res.render('menu')
})
router.post('/register',async(req, res, next)=> {
    let user = await User.findOne({username:req.body.username}).exec()
    if(!user) {
        let hash = await bcrypt.hash(req.body.password,saltRounds)
        let skin = await Skin.findOne({name: 'skin'})
        await User.create({username:req.body.username, password:hash, tBucks:10, tCoins: 1000, equippedSkin: skin._id})
        return res.redirect('/game')
    }
    res.cookie('error', 'This user already exists!')
    return res.redirect('/register')
})
export default router
