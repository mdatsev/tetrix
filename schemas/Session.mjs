import { _Schema, model } from 'mongoose';
var Schema = _Schema;
var sessionSchema = new Schema({
  username:String,
  token:String
});
let Session =  model("Session", sessionSchema)

export default Session