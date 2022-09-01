const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const partnerSchema = new Schema({
 name: {
  type: String,
  required: true,
  unique: true,
 },
 image: {
  type: String,
  required: true
 },
 featured: {
  type: Boolean,
 },
 description: {
  type: String,
  required: true
 }
}, {
 timestamps: true//Mongoose adds createdAt and updatedAt properties
});

const Partner = mongoose.model('Partner', partnerSchema);

module.exports = Partner;