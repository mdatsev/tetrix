import { Router } from 'express';
var router = Router();
import { findOne } from '../schemas/Session';
import { findOne as _findOne, find, findById } from '../schemas/User';


router.use((req, res, next)=> {
  findOne({token: req.cookies.sessionToken}).then((ses)=>{
      if(ses){
        req.username = ses.username
      }
      next()
  })
});
router.get('/', async(req, res)=> {
    if(!req.username)res.redirect('/login')
    let cur_user = await _findOne({username:req.username}).populate('friends').exec()
    
    res.render('account', {user:cur_user})
});
router.get('/friends/add', async(req,res)=>{
    if(!req.username)res.redirect('/login')
    
    let all_users = await find({}).exec();
    let cur_user = await _findOne({username:req.username}).populate('requests').exec()
    let cur_user_friends = await _findOne({username:req.username}).populate('friends').exec()
    let request_usernames = cur_user.requests.map(u => u.username)
    let friends_username =  cur_user_friends.friends.map(u => u.username)
    console.log(friends_username)
    let filtered = all_users.filter(u=>!request_usernames.includes(u.username) && u.username!=req.username && !friends_username.includes(u.username))
    
    res.render('freidns',{users: filtered, cur_user:cur_user})
})
router.post('/friends/accept/:id', async(req,res)=>{
    let user = await _findOne({username:req.username}).exec()
    user.friends.push(req.params.id)
    let accepted_user =  await findById(req.params.id)
    accepted_user.friends.push(user.id)

    user.requests.splice(user.requests.indexOf(accepted_user.id.toString()),1)

    user.save()
    accepted_user.save()

    res.send('Friend added')
})
router.post('/friends/add/:id', async(req,res)=>{
    if(!req.username)res.redirect('/login')
    
    let requested_user = await findById(req.params.id)
    let user = await _findOne({username:req.username})
    
    requested_user.requests.push(user.id)
    requested_user.save()
    
    res.send("Request send!")
})


export default router;
