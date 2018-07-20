import { Router } from 'express';
var router = Router();
import { compare, hash as _hash } from 'bcrypt';
import { findOne, create } from '../schemas/User';
import { create as _create } from '../schemas/Session';
import { randomBytes } from 'crypto';
const saltRounds = 10

router.post('/login', async(req, res, next)=> {
    let user = await findOne({username:req.body.username}).exec()
    if(user){
        let authenticated = await compare(req.body.password,user.password)
        if(authenticated){
            let token = randomBytes(48).toString("hex")
            _create({username:req.body.username, token:token})
            res.cookie('sessionToken',  token)
            return res.redirect('/game')
        }
    }
    res.cookie('error', 'Incorrect username or password!')
    return res.redirect('/login')
});
router.post('/register',async(req, res, next)=> {
    let user = await findOne({username:req.body.username}).exec()
    if(!user) {
        let hash = await _hash(req.body.password,saltRounds)  
        await create({username:req.body.username, password:hash})
        return res.redirect('/game')
    }
    res.cookie('error', 'This user already exists!')
    return res.redirect('/register')
});
export default router;
