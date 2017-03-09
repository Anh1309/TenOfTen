const express = require('express');
const router = express.Router();
const fbacckit = require('../helpers/fbacckit');
const Utils = require('../helpers/Utils');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config/env');
const APIError = require('../helpers/APIError');
const httpStatus = require('http-status');
const expressjwt = require('express-jwt');
const AuthApi = require('../middleware/AuthApi');
const isAdmin = require('../middleware/isAdmin');

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
            const phone_token = jwt.sign(result.phone, config.secret);
            return res.json({phone_token: phone_token});
        }
    });
});

router.post('/api/auth/register', function(req, res, next){
    const phoneDecoded = jwt.verify(req.body.phone_token, config.secret);
    var user = new User(req.body);
    Utils.saltAndHash(user.password, function(err, result){
        if (err) {
            const error = new APIError('Wrong password', httpStatus.UNAUTHORIZED, true);
            return res.json(error);
        } else {
            user.password = result;
            user.phone = phoneDecoded;
            user.save(function(err, user){
                if (err) {
                    console.log(err);
                    const error = new APIError(err.message, httpStatus.UNAUTHORIZED, true);
                    return res.json(error);
                } else {
                    const token = jwt.sign({
                        userId: user._id,
                        role: user.role,
                        expiresIn: config.expireTime
                    }, config.secret);
                    return res.json({
                        profile: {
                            id: user._id,
                            created: user.created,
                            username: user.username,
                            email: user.email,
                            e_verified: user.e_verified,
                            phone: user.phone,
                            role: user.role
                        },
                        id_token: token
                    });
                }
            });
        }
    });        
    
});

router.post('/api/auth/login', function(req, res, next){
    User.findOne({
        $or: [
            {'email': req.body.email},
            {'username': req.body.username}
        ]
    }).exec(function(err, user){
        if (err) {
            const error = new APIError('Have system error', httpStatus.UNAUTHORIZED, true);
            return res.json(error);
        } else {
            if (!user) {
                const error = new APIError('Wrong email or username', httpStatus.UNAUTHORIZED, true);
                return res.json(error);
            } else {
                Utils.checkPassword(req.body.password, user.password, function(err, result){
                    if (err) {
                        return res.json(err);
                    } else {
                        if (!result) {
                            const error = new APIError('Password is not correct!', httpStatus.UNAUTHORIZED, true);
                            return res.json(error);
                        } else {
                            const token = jwt.sign({
                                userId: user._id,
                                role: user.role,
                                expiresIn: config.expireTime
                            }, config.secret);
                            return res.json({
                                profile: {
                                    id: user._id,
                                    created: user.created,
                                    username: user.username,
                                    email: user.email,
                                    e_verified: user.e_verified,
                                    phone: user.phone,
                                    role: user.role
                                },
                                id_token: token
                            });
                        }
                    }
                });
            }
        }
    });
});

router.post('/api/userList', [AuthApi, isAdmin], function(req, res, next){
//    const user = jwt.verify(req.headers.authorization, config.secret);
//    console.log(user);
//    console.log(req.headers);
//    if (user.role === "parent") {
//        User.find({}, function(error, users){
//            if (error) {
//                return res.json(error);
//            } else {
//                return res.json({users: users});
//            }
//        });
//    } else {
//        return res.json("You're not admin");
//    }
    User.find({}, function(err, users){
        if (err) {
            return res.json(err);
        } else {
            return res.json({users: users});
        }
    });
    
    
});

module.exports = router;
