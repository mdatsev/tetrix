import mongoose from 'mongoose'
const Schema = mongoose.Schema
const ObjectId= Schema.Types.ObjectId
const channelSchema = new Schema({
    name:String,
    max_players:Number,
    players:[{type:ObjectId, ref: 'User'}],
    messages:[{author:String, message:String}],
})

channelSchema.method('test', () => {

})


const Channel =  mongoose.model('Channel', channelSchema)

export default Channel