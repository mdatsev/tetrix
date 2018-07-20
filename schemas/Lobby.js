var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const ObjectId= mongoose.Schema.Types.ObjectId
var lobbySchema = new Schema({
  name:String,
  max_players:Number,
  creator: {type:ObjectId, ref:"User"},
  players:[{type:ObjectId, ref:"User"}],
  link:String
});
let Lobby =  mongoose.model("Lobby", lobbySchema)

module.exports = Lobby