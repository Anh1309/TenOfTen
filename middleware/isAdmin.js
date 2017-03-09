module.exports = function(req, res, next) {
    if(req.user.role == 'parent'){
        next();
    }
    else{
        return res.json("You can't access this api");
    }
}