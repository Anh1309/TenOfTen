const express = require('express');
const router = express.Router();
const fbacckit = require('../helpers/fbacckit');
const User = require('../models/User');

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
            return res.json(result);
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
            return next(err);
        } else {
            user.save(function(err, user){
                if (err) {
                    return next(err);
                }
            });
        }
    });
});

module.exports = router;
