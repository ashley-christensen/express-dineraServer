const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
 // passportLocalMongoose will add username/password fields + Hash && Salt password
 admin: {
  type: Boolean,
  default: false
 }
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);