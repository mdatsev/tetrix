import mongoose, { mongo } from "mongoose";

const Schema = mongoose.Schema;
const ObjectId= Schema.Types.ObjectId
const lobbySchema = new Schema({
    name:String,
    max_players:Number,
    creator: {type:ObjectId, ref:"User"},
    players:[{type:ObjectId, ref:"User"}],
    link:String,
    channel: {type:ObjectId, ref:"Channel"}
});

const Lobby =  mongoose.model("Lobby", lobbySchema)

export default Lobby;