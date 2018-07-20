var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const ObjectId= mongoose.Schema.Types.ObjectId
var userSchema = new Schema({
  username:String,
  password:String,
  tBucks: {type: Number, default: 0},
  tCoins: {type: Number, default: 0},
  friends:[{type:ObjectId, ref:"User"}],
  requests:[{type:ObjectId, ref:"User"}],
  items:[{type:ObjectId, ref:"Item"}],
  skins:[{type:ObjectId, ref:"Skin"}],
  equippedSkin: {type:ObjectId, ref:"Skin"}
});
let User =  mongoose.model("User", userSchema)

module.exports = User