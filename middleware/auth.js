const express = require('express');

// auth check to see if user has already been authenticated
// if unauthenticated or missing sessions info then send back 302
// client side will manage redirect
function isLoggedIn(req, res, next) {
    // console.log("auth check--", req.user);
    // console.log("auth check session--", req.session);
    // console.log("auth check sessionID--", req.sessionID);
    // if (req.isAuthenticated()) {
    //     console.log("is authenticated");
    //     return next();
    // }
    // else {
    //     console.log("not authenticated");
    //     res.status(302).json({ error: "missing session info or credentials" });
    // };

    if (req.sessionID) {
        return next();
    }
    else {
        res.status(302).json({ error: "missing session info or credentials" });
    }
};

module.exports = { isLoggedIn };