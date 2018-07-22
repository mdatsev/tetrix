import mongoose from "mongoose";
const Schema = mongoose.Schema;
const sessionSchema = new Schema({
  username:String,
  token:String
});
const Session =  mongoose.model("Session", sessionSchema)

export default Session;