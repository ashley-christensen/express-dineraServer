const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema({
 rating: {
  type: Number,
  min: 1,
  max: 5,
  required: true
 },
 text: {
  type: String,
  required: true
 },
 author: {
  type: String,
  required: true
 }
}, {
 timestamps: true
});//schema second arg is configs, mongoose adds createdAt and updatedAt timestamp properties

const dineSchema = new Schema({
 name: {
  type: String,
  required: true,
  unique: true,
 },
 description: {
  type: String,
  required: true
 },
 image: {
  type: String,
  required: true
 },
 featured: {
  type: Boolean,
  default: false
 },
 comments: [commentSchema]//every dine doc can contain multiple comment docs stored in an array
}, {
 timestamps: true,//mongoose will auto add createdAt and updatedAt property for second arg
});

// return value of mongoose.model() is a constructor function USED TO INSTANTIATE DOCUMENTS
const Dine = mongoose.model('Dine', dineSchema);//first arg is capital singular of coll

module.exports = Dine;