const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const favoriteSchema = new Schema({
 user: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'User'
 },
 dines: [{
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Dine'
 }]
});

const Favorite = mongoose.model('Favorite', favoriteSchema);
module.exports = Favorite;