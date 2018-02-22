const express = require('express');

// auth check to see if user has already been authenticated
// if unauthenticated or missing sessions info then send back 302
// client side will manage redirect
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    else {
        res.status(302).json({ error: "missing session info or credentials" });
    };
};

module.exports = { isLoggedIn };