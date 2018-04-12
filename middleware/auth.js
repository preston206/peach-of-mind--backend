const express = require('express');

// auth check to see if user has already been authenticated
// if unauthenticated or missing session info then send back 302
// client side will manage redirect
function isLoggedIn(req, res, next) {
    console.log("auth check session:", req.session);
    console.log("auth check session.passport:", req.session.passport);
    if (req.isAuthenticated()) {
        return next();
    }
    else if (req.session.passport.user) {
        return next();
    }
    else {
        res.status(302).json({ error: "missing session info or credentials" });
    };
};

module.exports = { isLoggedIn };