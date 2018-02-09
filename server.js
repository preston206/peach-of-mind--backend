require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const morgan = require('morgan');

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const cors = require('cors');
const app = express();
app.use(cors());

// logging
app.use(morgan('common'));

const { PORT, DATABASE_URL, SESSION_SECRET } = require('./config');

// import model
const { Parent } = require('./models/Parent');

// body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const store = new MongoDBStore({
    uri: DATABASE_URL,
    collection: 'sessions'
});

// catch store errors
store.on('error', function (error) {
    assert.ifError(error);
    assert.ok(false);
});

// the session needs to come before initializing passport
app.use(session({
    secret: SESSION_SECRET,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
    },
    store: store,
    resave: true,
    saveUninitialized: true
}));

// passport init
app.use(passport.initialize());
app.use(passport.session());

// auth check to see if user has already been authenticated
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        console.log("hello", req.user);
        return next();
    }
    else {
        console.log("who are you?");
        // res.redirect('login');
        return next();
    };
};

// if I want to check every req to see if the user is logged in:
// app.use(isLoggedIn);


// routes
app.get('/api/v1/get-test', isLoggedIn, (req, res) => {
    res.status(200).json([{ "_id": "787878" }]);
});

app.get('/', (req, res) => {
    res.send("hello, test.");
});

// protected
app.get('/api/v1/protected-resource', (req, res, next) => {
    res.status(200).json("authorized");
});

// register
app.post('/api/v1/users/register', (req, res, next) => {

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
            res.status(500).json({ code: 500, message: error.stack });
        });
});


// passport local strategy setup
passport.use(new LocalStrategy(
    function (username, password, done) {
        Parent.findOne({ username: username }, function (err, user) {
            if (err) { return done(err); }
            if (!user) {
                return done(null, false, { message: 'Incorrect username.' });
            }
            if (!user.validatePassword(password)) {
                return done(null, false, { message: 'Incorrect password.' });
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


// login
app.post('/api/v1/auth/login', passport.authenticate('local'), (req, res) => {
    res.status(200).json("logged in");
});

app.post('/api/v1/post-test', (req, res) => {

    const newParent = {
        email: req.body.email,
        username: req.body.username,
        password: req.body.password,
        children: [{
            name: req.body.child,
            allergies: [{
                name: req.body.allergen,
                reaction: req.body.reaction,
                details: req.body.details
            }]
        }]
    };

    return Parent
        .create(newParent)
        .then(profile => {
            console.log("creating: ", profile);
            res.status(201).json(profile)
        })
        .catch(error => console.log(error));
});

app.put('/api/v1/put-test/:id', (req, res) => {

    let updateTheseFields = {
        email: req.body.email,
        username: req.body.username,
        password: req.body.password,
        children: [{
            name: req.body.child,
            allergies: [{
                name: req.body.allergen,
                reaction: req.body.reaction,
                details: req.body.details
            }]
        }]
    };

    return Parent
        .findByIdAndUpdate(req.params.id, { $set: updateTheseFields }, { new: true })
        .then(parent => {
            return res.status(200).json({
                message: "data has been updated",
                data: parent
            });
        })
        .catch(error => {
            return res.status(500).json({
                message: "server error"
            });
        });
});

app.delete('/delete-test/:id', (req, res) => {
    console.log("deleting id: ", req.params.id);
    return Parent
        .findOneAndRemove(req.params.id)
        .exec()
        .then(res.status(204).end())
        .catch(error => res.status(500).json({
            message: "server error"
        }));
});


//  -- server config section --
// functions for starting and stopping
// and connecting to the db
let server;

function startServer(db) {
    return new Promise((resolve, reject) => {
        mongoose.connect(db, err => {
            useMongoClient: true;

            console.log("connected to", db);

            if (err) {
                return reject(err);
            }

            server = app.listen(PORT, () => {
                let getCurrentDateAndTime = new Date();
                let timeStamp =
                    getCurrentDateAndTime.getHours() +
                    ":" +
                    (getCurrentDateAndTime.getMinutes() < 10 ? '0' : '') +
                    getCurrentDateAndTime.getMinutes();

                console.log(timeStamp + ` - server is connected to mongo and listening on ${PORT}`);

                resolve();
            })
                .on('error', err => {
                    mongoose.disconnect();
                    reject(err);
                });
        });
    });
};

function stopServer() {
    return mongoose.disconnect().then(() => {
        return new Promise((resolve, reject) => {
            console.log('Server is down');
            server.close(err => {
                if (err) {
                    return reject(err);
                }
                resolve();
            });
        });
    });
};

// check if server was started directly via "node.js" or if it was started from another file via require
// resource: https://nodejs.org/docs/latest/api/all.html#modules_accessing_the_main_module
if (require.main === module) {
    startServer(DATABASE_URL).catch(err => console.error(err));
};

module.exports = { app, startServer, stopServer };