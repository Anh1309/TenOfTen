const mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
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
    phone_token: {
        unique: true,
        type: String,
        required: true
    }
    
});