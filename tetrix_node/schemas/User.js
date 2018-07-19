var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const ObjectId= mongoose.Schema.Types.ObjectId
var userSchema = new Schema({
  username:String,
  password:String,
  friends:[{type:ObjectId, ref:"User"}],
  requests:[{type:ObjectId, ref:"User"}]
});
let User =  mongoose.model("User", userSchema)

module.exports = User