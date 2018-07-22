import mongoose from "mongoose";
const Schema = mongoose.Schema;
const ObjectId= mongoose.Schema.Types.ObjectId
const userSchema = new Schema({
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
const User =  mongoose.model("User", userSchema)

export default User;