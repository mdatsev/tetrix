import { Schema as _Schema, model } from 'mongoose';

var Schema = _Schema;
const ObjectId= _Schema.Types.ObjectId
var userSchema = new Schema({
  username:String,
  password:String,
  friends:[{type:ObjectId, ref:"User"}],
  requests:[{type:ObjectId, ref:"User"}]
});
let User =  model("User", userSchema)

export default User