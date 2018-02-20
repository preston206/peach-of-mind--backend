const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const app = express();

// import auth check middleware
const { isLoggedIn } = require('../middleware/auth');

// importing model
const { Parent } = require('../models/Parent');

// model layout:
// Parent {
//     email: ,
//     username: ,
//     password: hashed,
//     children: [{
//         child: name,
//         allergies: [{
//             allergen: name,
//             reaction: safe or unsafe,
//             details: 
//         }]
//     }]
// };

// register route
router.post('/register', (req, res, next) => {

    console.log("req.body", req.body);

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
            message: 'Cannot start nor end with space',
            location: notTrimmed
        });
    }

    // check username and password length
    const credentialLength = {
        username: {
            min: 1
        },
        password: {
            min: 8,
            // bcrypt truncates after 72 characters
            max: 72
        }
    };

    const tooShort = Object.keys(credentialLength).find(field =>
        'min' in credentialLength[field] &&
        req.body[field].trim().length < credentialLength[field].min
    );
    const tooLong = Object.keys(credentialLength).find(field =>
        'max' in credentialLength[field] &&
        req.body[field].trim().length > credentialLength[field].max
    );

    if (tooShort || tooLong) {
        return res.status(422).json({
            code: 422,
            reason: 'ValidationError',
            message: tooShort ?
                `Must be at least ${credentialLength[tooShort].min} characters long` :
                `Must be at most ${credentialLength[tooLong].max} characters long`,
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
            // if username does not exist, hash password
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
            // error because something unexpected has happened
            if (error.reason === 'ValidationError') {
                return res.status(error.code).json(error);
            }
            return res.status(500).json({ code: 500, message: error });
        });
});

// passport local strategy setup
passport.use(new LocalStrategy(
    function (username, password, done) {
        console.log("creds-", username, password);
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

// passport serialize / deserialize
passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    Parent.findById(id, function (err, user) {
        done(err, user);
    });
});

// login route
router.post('/login', passport.authenticate('local'), (req, res) => {
    return res.status(200).json("logged in");
});

// logout
router.post('/logout', (req, res) => {

    console.log("still logged in: ", req.user);
    req.logout();
    console.log("logged out? ", req.user);

    return res.status(200).json("logged out");
});

module.exports = router;