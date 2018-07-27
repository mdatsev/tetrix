import mongoose from "mongoose";
const Schema = mongoose.Schema;
const ObjectId= Schema.Types.ObjectId
const channelSchema = new Schema({
    name:String,
    max_players:Number,
    players:[{type:ObjectId, ref:"User"}],
    messages_limit:Number,
    messages:[{author:String, message:String}],
    private:Boolean
});

channelSchema.method('test', function() {

})

channelSchema.path('messages').validate(function() {
    if(this.messages.length > this.messages_limit) {
        this.messages.shift()
    }
    return true
})
  
const Channel =  mongoose.model("Channel", channelSchema)

export default Channel;