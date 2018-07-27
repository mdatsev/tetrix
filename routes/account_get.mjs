import express from 'express'
var router = express.Router()
import Session from '../schemas/Session'
import User from '../schemas/User'
import Skin from '../schemas/Skin'


router.use((req, res, next)=> {
    Session.findOne({token: req.cookies.sessionToken}).then((ses)=>{
        if(ses){
            req.username = ses.username
        }
        next()
    })
})
router.get('/', async(req, res)=> {
    if(!req.username) return res.redirect('/login')
    let cur_user = await User.findOne({username:req.username}).populate('friends').populate('skins').populate('equippedSkin').exec()  
    res.render('account', {user:cur_user})
})
router.get('/friends/add', async(req,res)=>{
    if(!req.username) return res.redirect('/login')
    
    let all_users = await find({}).exec()
    let cur_user = await User.findOne({username:req.username}).populate('requests').exec()
    let cur_user_friends = await User.findOne({username:req.username}).populate('friends').exec()
    
    let request_usernames = cur_user.requests.map(u => u.username)
    let friends_username =  cur_user_friends.friends.map(u => u.username)

    //console.log(friends_username)
    let filtered = all_users.filter(u=>!request_usernames.includes(u.username) && u.username!=req.username && !friends_username.includes(u.username))
    
    res.render('freidns',{users: filtered, cur_user:cur_user})
})
router.post('/friends/accept/:id', async(req,res)=>{
    if(!req.username) return res.redirect('/login')
    
    let user = await User.findOne({username:req.username}).exec()
    user.friends.push(req.params.id)
    let accepted_user =  await User.findById(req.params.id)
    accepted_user.friends.push(user.id)

    user.requests.splice(user.requests.indexOf(accepted_user.id.toString()),1)

    user.save()
    accepted_user.save()

    res.send('Friend added')
})
router.post('/friends/add/:id', async(req,res)=>{
    if(!req.username) return res.redirect('/login')
    
    let requested_user = await User.findById(req.params.id)
    let user = await User.findOne({username:req.username})
    
    requested_user.requests.push(user.id)
    requested_user.save()
    
    res.send('Request send!')
})

router.get('/skin', async function(req, res) {
    if(!req.username) return res.redirect('/login')
    let user = await User.findOne({username: req.username}).populate('equippedSkin').exec()
    res.send({skinPath: user.equippedSkin.imgPath})
})

router.post('/skin', async function(req, res) {
    if(!req.username) return res.redirect('/login')
    let skin = await Skin.findOne({name: req.body.skinName}).exec()
    await User.updateOne({username: req.username}, {
        equippedSkin: skin._id
    }).exec()
    res.send({message: 'equipped'})
})


export default router
