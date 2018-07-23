import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";
import fs from "fs";
import indexGetRouter from "./routes/index_get";
import indexPostRouter from "./routes/index_post";
import gameGetRouter from "./routes/game_get";
import accountGetRouter from "./routes/account_get";
import shopGetRouter from "./routes/shop_get";
import lobbyHandler from "./sockets/lobby";
import tetrisHandler from "./sockets/tetris";


const __dirname = path.dirname(new URL(import.meta.url).pathname).substr(1);

import Lobby from "./schemas/Lobby";
import User from "./schemas/User";
import Item from "./schemas/Item";
import Skin from "./schemas/Skin";
import Session from "./schemas/Session";

import mongoose from "mongoose";
const app = express();
import socket from "socket.io";

// view engine setup
app.use(express.static(path.join(__dirname, 'public')));
app.use('/common', express.static(path.join(__dirname, 'common')));
app.use('/game', express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));



app.set('view engine', 'pug');

mongoose.connect('mongodb://localhost/tetrix');
var db = mongoose.connection
db.once('open', async(err)=> {
    if(err)
      console.log(err)
    let skins = JSON.parse(fs.readFileSync('./models/skins.json').toString());
    for(let skin of skins){
      let exists = await Skin.findOne({name:skin.name}).exec()
      
      if(!exists){
        
        create(skin)
      }
    }
})
db.on('error', console.error.bind(console, 'connection error:'));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());


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
app.use('/shop', shopGetRouter)

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
let server = app.listen(5000,(err)=>{
  if (err)
    console.log(err)
  console.log("app listening on port 5000")
})

let io = socket(server)
lobbyHandler(io)
tetrisHandler(io)

export default app;
