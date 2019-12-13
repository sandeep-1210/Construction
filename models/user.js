const mongoose = require('mongoose')
const Schema = mongoose.Schema
const crypto = require('crypto')
const config = require('../config')

const User = new Schema({
    username: { type: String, unique: true, required: true },
    password: String,
    admin: { type: Boolean, default: false },
    hash: { type: String },
    mobile: { type: String, required: true , unique: true, },
    createdDate: { type: Date, default: Date.now }
})


// crypto.createHmac('sha1', 'secret')
//              .update('mypasswssord')
//              .digest('base64')


// create new User document
User.statics.create = function (obj) {
    const encrypted = crypto.createHmac('sha1', config.secret)
        .update(obj.password)
        .digest('base64')
        obj.password = encrypted;

    const user = new this(obj);
    // return the Promise
    return user.save()
}

// find one user by using username
User.statics.findOneByUsername = function (username) {
    const user = this.findOne({
        username
    }).exec()
    return user;
}

User.statics.checkuserisAdmin = function (username) {
    const onError = (error) => {
        return res.status(409).json({
            message: error.message
        })
    }
    return this.findOne({ username }).exec()
        .then(function (value) {
            if (value) {
                return value.admin;
            }
            else{
                return res.status(403).json({
                    success: false,
                    message: 'not authorized login again'
                })               
            }
        })
        .catch(onError)
}

// verify the password of the User documment
User.methods.verify = function (password) {
    const encrypted = crypto.createHmac('sha1', config.secret)
        .update(password)
        .digest('base64')
    console.log(this.password === encrypted)

    return this.password === encrypted
}

User.methods.assignAdmin = function () {
    this.admin = true
    return this.save()
}

module.exports = mongoose.model('User', User)