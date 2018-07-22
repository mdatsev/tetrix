var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var skinSchema = new Schema({
    name: String,
    imgPath: String,
    rarity: {type: Number, default: 0},
    tBucks: {type: Number, default: 0},
    tCoins: {type: Number, default: 0}
});
let Skin = mongoose.model("Skin", skinSchema)

module.exports = Skin