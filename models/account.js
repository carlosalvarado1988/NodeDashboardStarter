var mongoose = require('mongoose')
var Schema = mongoose.Schema
var passportLocalMongoose = require('passport-local-mongoose')

var Account = new Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  reference: String
})

Account.plugin(passportLocalMongoose)

module.exports = mongoose.model('Account', Account)
