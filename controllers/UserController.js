const express = require('express');
const router = express.Router();
const fbacckit = require('../helpers/fbacckit');
const Utils = require('../helpers/Utils');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config/env');
const httpStatus = require('http-status');
const AuthApi = require('../middleware/AuthApi');
const isAdmin = require('../middleware/isAdmin');

/* GET users listing. */
router.get('/', function (req, res, next) {
    res.send('respond with a resource');
});

router.post('/phone-token', function (req, res, next) {
    fbacckit.phoneForCode(req.body.code, function (error, result) {
        if (error) {
            return res.json(error);
        } else {
            const phone_token = jwt.sign(result.phone, config.secret);
            return res.json({phone_token: phone_token});
        }
    });
});

router.post('/api/auth/register', function (req, res, next) {
    const phoneDecoded = jwt.verify(req.body.phone_token, config.secret);
    var newUser = new User(req.body);
    Utils.saltAndHash(newUser.password, function (err, result) {
        if (err) {
            return res.status(409).json('Wrong password');
        } else {
            newUser.password = result;
            newUser.phone = phoneDecoded;
            newUser.save(function (err, user) {
                if (err) {
                    Utils.getStringErrors(err.errors, function (error, message) {
                        if (error)
                            return res.json(error);
                        else {
                            return res.status(409).json(message);
                        }
                    });

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

router.post('/api/auth/login', function (req, res, next) {
    User.findOne({
        $or: [
            {'email': req.body.email},
            {'username': req.body.username}
        ]
    }).exec(function (err, user) {
        if (err) {
            Utils.getStringErrors(err.errors, function (error, message) {
                if (error)
                    return res.json(error);
                else {
                    return res.status(404).json(message);
                }
            });
        } else {
            if (!user) {
                return res.status(409).json('Wrong email or username');
            } else {
                Utils.checkPassword(req.body.password, user.password, function (err, result) {
                    if (err) {
                        return res.json(err);
                    } else {
                        if (!result) {
                            return res.status(409).json('Password is not correct');
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

router.post('/api/userList', [AuthApi, isAdmin], function (req, res, next) {
    User.find({}, function (err, users) {
        if (err) {
            return res.json(err);
        } else {
            return res.json({users: users});
        }
    });


});

module.exports = router;
