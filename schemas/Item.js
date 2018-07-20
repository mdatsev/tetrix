var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var itemSchema = new Schema({
    name: String,
    imgPath: String,
    description: String,
    tBucks: {type: Number, default: 0},
    tCoins: {type: Number, default: 0}
});
let Item =  mongoose.model("Item", itemSchema)

module.exports = Item