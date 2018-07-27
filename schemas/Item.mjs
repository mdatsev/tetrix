import mongoose from 'mongoose'
const Schema = mongoose.Schema
const itemSchema = new Schema({
    name: String,
    imgPath: String,
    description: String,
    tBucks: {type: Number, default: 0},
    tCoins: {type: Number, default: 0}
})
const Item =  mongoose.model('Item', itemSchema)

export default Item