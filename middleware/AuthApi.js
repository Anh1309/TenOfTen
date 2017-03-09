/**
 * AuthApi
 *
 */
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config/env');
module.exports = function(req, res, next) {
    var token;
    if (req.headers && req.headers.authorization) {
        var parts = req.headers.authorization.split(' ');
        if (parts.length == 2) {
            var scheme = parts[0],
                credentials = parts[1];
            if (/^Bearer$/i.test(scheme)) {
                token = credentials;
            }
        } else {
            
            return res.json(401, 'Format is Authorization: Bearer [token]');
        }
    } else if (req.param('token')) {
        token = req.param('token');
        // We delete the token from param to not mess with blueprints
        delete req.query.token;
    } else {
        return res.json(401, resJson.dataError('No Authorization header was found', req));
    }
    jwt.verify(token, config.secret, function(err, token) {
        if (err) {
            return res.json(401, 'Invalid Token!');
        }
       
        req.token = token; // This is the decrypted token or the payload you provided
        // Find the user with that token
        
        User.findOne({ _id: token.userId })
            .exec(function(err, user) {
                if (err) { return res.json(400, "Have error"); }
                if (!user) { return res.json(404, "Not found user"); }
                req.user = user;
                next();
        });
    });
};