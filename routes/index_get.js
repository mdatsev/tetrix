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



router.get('/', function(req, res) {
    res.render('index', {title:"Express"})
});



router.get('/login', function(req, res) {
  res.clearCookie('error')
  res.render('login', {error: req.cookies.error});
});



router.get('/register', function(req, res) {
  res.clearCookie('error')
  res.render('register', {error: req.cookies.error});
});


router.get('/logout',async(req, res)=> {
  Session.deleteOne({token: req.cookies.sessionToken}, function (err) {
    if (err) console.log(err) //return handleError(err);
  });
  res.clearCookie("sessionToken");
  res.locals.loged = false
  return res.redirect('/')
});

module.exports = router;
