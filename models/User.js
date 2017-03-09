const mongoose = require('mongoose');
const Utils = require('../helpers/Utils');

var UserSchema = new mongoose.Schema({
    _id: {
        type: String,
        index: {unique: true},
        required: true,
        default: Utils.getUUID
    },
    email: {
        required: true,
        unique: true,
        type: String
    },
    username: {
        required: true,
        unique: true,
        type: String
    },
    password: {
        required: true,
        type: String
    },
    phone: {
        unique: true,
        type: String
    },
    e_verified: {
        type: Boolean,
//        default: false,
    },
    role: {
        type: String,
//        default: 'parent'
    },
    created: {
        required: true,
        type: Date,
        default: Date.now
    },
    
    
});

module.exports = UserSchema;

module.exports = mongoose.model('User', UserSchema);