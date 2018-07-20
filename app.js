var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');

var logger = require('morgan');
var indexGetRouter = require('./routes/index_get');
var indexPostRouter = require('./routes/index_post');
var gameGetRouter = require('./routes/game_get');
var accountGetRouter =require('./routes/account_get');

const Session = require('./schemas/Session');
const mongoose = require('mongoose');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

mongoose.connect('mongodb://localhost/tetrix');
var db = mongoose.connection;
db.once('open', function(err) {
    if(err)
      console.log(err)
})
db.on('error', console.error.bind(console, 'connection error:'));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));
app.use('/common', express.static(path.join(__dirname, 'common')));

app.use(function(req,res,next){
  res.locals.loged = false
  Session.findOne({token: req.cookies.sessionToken}).then(sess => {
    if(sess) {
      res.locals.loged = true
    }
    next();
  })
});
app.use('/', indexGetRouter);
app.use('/', indexPostRouter);
app.use('/game', gameGetRouter);
app.use('/account', accountGetRouter); 



// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
