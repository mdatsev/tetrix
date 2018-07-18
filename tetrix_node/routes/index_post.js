var express = require('express');
var router = express.Router();
var admin = require('../config/db')
var db = admin.database();
var usersRef = db.ref("users");
var bcrypt = require('bcrypt');
const saltRounds = 10
router.post('/login', function(req, res, next) {
    admin.auth().getUserByEmail(req.body.email)
        .then(function(userRecord) {
            console.log(userRecord)
            res.cookie('uid', userRecord.uid)
            res.redirect('/game')
        })
        .catch(function(error) {
            console.log(error)
        });
});
router.post('/register', function(req, res, next) {
    admin.auth()
        .createUser({
            email:req.body.email,
            password:req.body.password,
            displayName: req.body.username
        }).then((user)=>{
            res.redirect('/login')
        })
        .catch(function(error) {
            var errorCode = error.code;
            var errorMessage = error.message;
            console.log(error)
        });
    
});
module.exports = router;
