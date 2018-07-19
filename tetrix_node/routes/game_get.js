var express = require('express');
var router = express.Router();
const Session = require('../schemas/Session')
router.use((req, res, next)=> {
  Session.findOne({token: req.cookies.sessionToken}).then((ses)=>{
      if(ses){
        req.username = ses.username
      }
      next()
  })
});


router.get('/', function(req, res, next) {
    if(!req.username) res.redirect('/login')
    res.render('game')
});
module.exports = router;
