const express = require('express');

// auth check to see if user has already been authenticated
// if not authenticated or missing session info then send back 302
// client side will manage redirect
function isLoggedIn(req, res, next) {

    console.log("auth check sessionID:", req.sessionID);
    let sid = req.sessionID ? req.sessionID : false;
    console.log("sid:", sid);

    if (req.isAuthenticated()) {
        return next();
    }
    else if (sid) {
        return next();
    }
    else {
        res.status(302).json({ error: "missing session info or credentials" });
    };
};

module.exports = { isLoggedIn };