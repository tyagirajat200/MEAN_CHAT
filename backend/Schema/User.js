var mongoose = require('mongoose')
const { strict } = require('assert')

var user = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        unique: 1,
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
    },
    imagePath: {
        type: String
    },
    passToken : String,
    passExp  : String
}, { timestamps: true })

var Users = new mongoose.model('User', user)

module.exports = Users
