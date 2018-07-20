import { Router } from 'express';
var router = Router();
import { findOne } from '../schemas/Session';

router.use((req, res, next)=> {
  findOne({token: req.cookies.sessionToken}).then((ses)=>{
      if(ses){
        req.username = ses.username
      }
      next()
  })
});


router.get('/', function(req, res) {
    if(!req.username) res.redirect('/login')
    res.render('game')
});
export default router;
