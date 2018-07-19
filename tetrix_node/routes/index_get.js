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
    res.render('index', {title:"Express"})
});



router.get('/login', function(req, res, next) {
  res.render('login');
});



router.get('/register', function(req, res, next) {
  res.render('register');
});
module.exports = router;
