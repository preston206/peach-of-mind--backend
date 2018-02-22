// auth check to see if user has already been authenticated
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        console.log("hello,", req.user.username);
        return next();
    }
    else {
        console.log("who are you?");
        res.redirect('/');
        // return next();
    };
};

module.exports = { isLoggedIn };