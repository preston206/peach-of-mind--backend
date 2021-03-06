const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const app = express();

// importing model
const { Parent } = require('../models/Parent');

// register route
router.post('/register', (req, res, next) => {

    // check for missing fields
    const requiredField = ['email', 'username', 'password'];
    const missingField = requiredField.find(field => !(field in req.body));

    if (missingField) {
        return res.status(422).json({
            code: 422,
            reason: 'ValidationError',
            message: 'Missing field',
            location: missingField
        });
    }

    // verify data type is string
    const shouldBeString = ['email', 'username', 'password'];
    const notString = shouldBeString.find(field =>
        (field in req.body) && typeof req.body[field] !== 'string'
    );

    if (notString) {
        return res.status(422).json({
            code: 422,
            reason: 'ValidationError',
            message: 'Incorrect field type: expected string',
            location: notString
        });
    }

    // check username and password for leading and trailing space
    const shouldBeTrimmed = ['username', 'password'];
    const notTrimmed = shouldBeTrimmed.find(field =>
        req.body[field].trim() !== req.body[field]
    );

    if (notTrimmed) {
        return res.status(422).json({
            code: 422,
            reason: 'ValidationError',
            message: 'Username or password cannot start nor end with a space.',
            location: notTrimmed
        });
    }

    // check username and password length
    const credentialLength = {
        username: {
            min: 4
        },
        password: {
            min: 8,
            max: 72 // bcrypt truncates after 72 characters
        }
    };

    const tooShort = Object.keys(credentialLength).find(field =>
        'min' in credentialLength[field] && req.body[field].trim().length < credentialLength[field].min
    );

    const tooLong = Object.keys(credentialLength).find(field =>
        'max' in credentialLength[field] && req.body[field].trim().length > credentialLength[field].max
    );

    const fieldName = tooShort || tooLong;

    if (tooShort || tooLong) {
        return res.status(422).json({
            code: 422,
            reason: 'ValidationError',
            message: tooShort ?
                `${fieldName} must be at least ${credentialLength[tooShort].min} characters long` :
                `${fieldName} must be at most ${credentialLength[tooLong].max} characters long`,
            location: tooShort || tooLong
        });
    }

    // obtain values from request body
    let { email, username, password } = req.body;

    // start checking submitted data against database
    return Parent
        .find({ username })
        .count()
        .then(count => {
            if (count > 0) {
                // if username exists reject promise and throw error
                return Promise.reject({
                    code: 422,
                    reason: 'ValidationError',
                    message: 'Username already taken',
                    location: 'username'
                });
            };
            // if username does not exist (I.E. the username is not already taken), hash password
            return Parent.hashPassword(password);
        })
        .then(hash => {
            return Parent
                .create({
                    email,
                    username,
                    password: hash
                });
        })
        .then(user => {
            return res.status(201).json(user.serialize());
        })
        .catch(error => {
            // Forward validation errors on to the client, otherwise give a 500
            // the 500 error represents something happening that we didnt plan for in the code
            if (error.reason === 'ValidationError') {
                return res.status(error.code).json(error);
            }
            return res.status(500).json({ code: 500, message: error });
        });
});

// passport local strategy setup
passport.use(new LocalStrategy(
    function (username, password, done) {
        Parent.findOne({ username: username }, function (err, user) {
            if (err) { return done(err); }
            if (!user) {
                return done(null, false, { message: 'Invalid credentials.' });
            }
            if (!user.validatePassword(password)) {
                return done(null, false, { message: 'Invalid credentials.' });
            }
            return done(null, user);
        });
    }
));

// passport serialize / deserialize- used for establishing a session
// after deserializing, the req body will have a user object attached which contains the user ID and other info
passport.serializeUser(function (user, done) {
    console.info("serializing...", user.id);
    done(null, user.id);
    // done(null, user);
});

passport.deserializeUser(function (id, done) {
    console.log("de-serializing...", id);
    Parent.findById(id, function (err, user) {
        done(err, user);
    });
});

// login route
router.post('/login', passport.authenticate('local', { session: true }), (req, res) => {
    const sid = req.sessionID;
    const pid = req.user._id;
    console.log("the following user just logged in: ", pid);

    // if auth successfull, then return 200 and session ID and parent ID (AKA the user ID)
    res.status(200).json({ sid, pid });
});

// logout
router.get('/logout', (req, res) => {
    // this is a method provided by Passport, which removes the user object from the req body
    req.logout();
    req.session.destroy();
    return res.status(200).json("logged out");
});

module.exports = router;