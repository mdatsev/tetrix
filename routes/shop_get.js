var express = require('express');
var router = express.Router();
const Session = require('../schemas/Session')
const Item = require('../schemas/Item')
const Skin = require('../schemas/Skin')
const User = require('../schemas/User')

router.use((req, res, next) => {
  Session.findOne({token: req.cookies.sessionToken}).then((ses)=>{
      if(ses){
        req.username = ses.username
      }
      next()
  })
});


router.get('/', async (req, res) => {
    if(!req.username) res.redirect('/login')
    let items = await Item.find({}).exec()
    let skins = await Skin.find({}).exec()

    res.render('shop', {items: items, skins: skins})
});

router.post('/item', async (req, res) => {
	if(!req.username) res.redirect('/login')
	let user = await User.findOne({username: req.username}).exec()
	let item = await Item.findOne({name: req.body.itemName}).exec()

	if(item) {
		for(let itemId of user.items) {
			if(item._id.equals(itemId)) {
				return res.send({message: "Item already exists!"})
			}
		}
		
		if(user.tBucks >= item.tBucks && user.tCoins >= item.tCoins) {
			await User.updateOne({username: req.username}, {
				tBucks: user.tBucks - item.tBucks,
				tCoins: user.tCoins - item.tCoins,
				$push: {items: item._id}
			}).exec()
			return res.send({message: "Item bought!"})
		}
	}
	res.send({message: "Not enough T-Bucks/T-Coins"})
})

router.post('/skin', async (req, res) => {
	if(!req.username) return res.redirect('/login')

	let user = await User.findOne({username: req.username}).exec()
	let skin = await Skin.findOne({name: req.body.skinName}).exec()

	if(skin) {
		for(let skinId of user.skins) {
			if(skin._id.equals(skinId)) {
				return res.send({message: "Skin already exists!"})
			}
		}
		
		if(user.tBucks >= skin.tBucks && user.tCoins >= skin.tCoins) {
			await User.updateOne({username: req.username}, {
				tBucks: user.tBucks - skin.tBucks,
				tCoins: user.tCoins - skin.tCoins,
				$push: {skins: skin._id},
				equippedSkin: skin._id
			}).exec()
			return res.send({message: "Skin bought!"})
		}
	}
	res.send({message: "Not enough T-Bucks/T-Coins"})
})
module.exports = router;
