const express = require('express');
const flash = require('express-flash');
const router = express.Router();
const fbacckit = require('../helpers/fbacckit');
const Utils = require('../helpers/Utils');
const jwt = require('json-web-token');
const User = require('../models/User');

var phone;
var secret = "secretttt";

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/phone-token', function(req, res, next){
    fbacckit.phoneForCode(req.body.code, function(error, result){
        if(error){
            return res.json(error);
        }
        else{
            jwt.encode(secret, result.phone, function(err, phone_token){
                if (err) {
                    return res.json(err);
                } else {
                    phone = phone_token;
                    return res.json({phone_token: phone_token});
                }
            });
        }
    });
});

router.post('/api/auth/register', function(req, res, next){
    var user = new User(req.body);
    User.findOne({
        $or: [
            {'email': user.email},
            {'username': user.username}
        ]
    }).exec(function(err, userId){
        if (err) {
            return res.json(err);
        } else {
            if (userId) {
                return res.json('User exists');
            } else {
                
                jwt.decode(secret, phone, function (err, decodedPayload, decodedHeader) {
                    if (err) {
                        return res.json(err);
                    } else {
                        User.findOne({phone_token: decodedPayload}, function(err, userId){
                            if (err) {
                                return res.json(err);
                            } else {
                                if (userId) {
                                    return res.json('Phone number already in use');
                                } else {
                                    Utils.saltAndHash(user.password, function(err, result){
                                        if (err) {
                                            return res.json(err);
                                        } else {
                                            user.password = result;
                                        }
                                    });
                                    user.e_verified = false;
                                    user.phone_token = decodedPayload;
                                    var d = new Date();
                                    user.created = d;
                                    user.save(function(err, user){
                                        if (err) {
                                            return res.json(err);
                                        } else {
                                            return res.json({
                                                profile: {
                                                    id: user._id,
                                                    created: user.created,
                                                    username: user.username,
                                                    password: user.password,
                                                    email: user.email,
                                                    e_verified: user.e_verified
                                                }
                                            });
                                        }
                                    });
                                }
                            }
                        });
                    }
                });
            }
        }
    });
});

router.post('/api/auth/login', function(req, res, next){
    var user = new User(req.body);
    User.findOne({
        $or: [
            {'email': user.email},
            {'username': user.username}
        ]
    }).exec(function(err, userId){
        if (err) {
            return res.json(err);
        } else {
            if (!userId) {
                return res.json('Wrong email or username');
            } else {
                Utils.checkPassword(user.password, userId.password, function(err, result){
                    if (err) {
                        return res.json(err);
                    } else {
                        if (!result) {
                            return res.json('Wrong password');
                        } else {
                            return res.json('Login success');
                        }
                    }
                })
            }
        }
    })
})

module.exports = router;
