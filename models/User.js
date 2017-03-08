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
        type: String
    },
    e_verified: {
        required: true,
        type: Boolean
    },
    created: {
        required: true,
        type: Date
    }
    
});



module.exports = UserSchema;

module.exports = mongoose.model('User', UserSchema);