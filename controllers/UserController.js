const express = require('express');
const flash = require('express-flash');
const router = express.Router();
const fbacckit = require('../helpers/fbacckit');
const Utils = require('../helpers/Utils');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config/env');

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
            return res.json(err);
        } else {
            user.password = result;
            user.phone = phoneDecoded;
            user.save(function(err, user){
                if (err) {
                    return res.json(err.errmsg);
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
