module.exports = function(req, res, next) {
    if(req.user.role == 'admin'){
        next();
    }
    else{
        return res.json("You can't access this api");
    }
};