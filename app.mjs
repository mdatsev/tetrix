import express, { json, urlencoded, static as st } from 'express';
import { join } from 'path';
import cookieParser from 'cookie-parser';

import logger from 'morgan';
import indexGetRouter from './routes/index_get';
import indexPostRouter from './routes/index_post';
import gameGetRouter from './routes/game_get';
import accountGetRouter from './routes/account_get';

import { findOne } from './schemas/Session';
import { connect, connection } from 'mongoose';
var app = express();

// view engine setup
app.set('views', join(__dirname, 'views'));
app.set('view engine', 'pug');

connect('mongodb://localhost/tetrix');
var db = connection;
db.once('open', function(err) {
    if(err)
      console.log(err)
})
db.on('error', console.error.bind(console, 'connection error:'));

app.use(logger('dev'));
app.use(json());
app.use(urlencoded({ extended: false }));
app.use(cookieParser());

app.use(st(join(__dirname, 'public')));
app.use('/common', st(join(__dirname, 'common')));

app.use(function(req,res,next){
  res.locals.loged = false
  findOne({token: req.cookies.sessionToken}).then(sess => {
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

export default app;
