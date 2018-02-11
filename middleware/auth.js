// auth check to see if user has already been authenticated
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        console.log("hello,", req.user);
        return next();
    }
    else {
        console.log("who are you?");
        // res.redirect('login');
        return next();
    };
};

module.exports = { isLoggedIn };