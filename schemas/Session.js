var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var sessionSchema = new Schema({
  username:String,
  token:String
});
let Session =  mongoose.model("Session", sessionSchema)

module.exports = Session