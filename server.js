require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const morgan = require('morgan');

const app = express();

// importing config variables
const { PORT, PROD_DATABASE_MLAB_URL, TEST_DATABASE_LOCALHOST_URL, TEST_DATABASE_MLAB_URL, SESSION_SECRET } = require('./config');

// // //
// TESTING LOCALLY:
// 1) toggle startServer() to TEST_DATABASE_LOCALHOST_URL
// 2) update MongoDBStore URI to TEST_DATABASE_LOCALHOST_URL
// 3) toggle header Allow Origin setting to localhost
// res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
// res.header('Access-Control-Allow-Origin', 'https://peachofmind.netlify.com');
// 4) toggle "cookie: secure:" to false and mute "app.set('trust proxy', 1)"
// 5) toggle client side "base URL" to localhost (within actions)
// // //

// // // // //
// DATABASE CURRENTLY IN USE: PROD_DATABASE_MLAB_URL
// // // // //

// body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// auth and CORS
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', 'https://peachofmind.netlify.com');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Headers', 'Origin,Accept,Content-Type,Authorization,Content-Length,X-Requested-With');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(204);
    }
    next();
});

// logging
app.use(morgan('common'));

// importing model
const { Parent } = require('./models/Parent');

// init express session store
const store = new MongoDBStore({
    uri: PROD_DATABASE_MLAB_URL,
    collection: 'sessions'
});

// catch store errors
store.on('error', function (error) {
    assert.ifError(error);
    assert.ok(false);
});

// init express session
// the session needs to come before initializing passport
app.set('trust proxy', 1);
app.use(session({
    secret: SESSION_SECRET,
    cookie: {
        secure: true,
        maxAge: 1000 * 60 * 60 * 24 // 1 day
    },
    store: store,
    resave: false,
    saveUninitialized: false
}));

// init passport
app.use(passport.initialize());
app.use(passport.session());

// routing
// IMPORTANT: the routes need to come after everything above...
// such as, initializing passport, body parser, etc
const parentRouter = require('./routes/parentRouter');
const childRouter = require('./routes/childRouter');
const allergenRouter = require('./routes/allergenRouter');
app.use('/api/v1/parents', parentRouter);
app.use('/api/v1/children', childRouter);
app.use('/api/v1/allergens', allergenRouter);


//  ----- server config section -----
// functions for starting and stopping the server, and connecting to the db

// a global variable needs to be declared here because
// otherwise the stop server function wouldnt have access to
// it if it was declared inside of the start server function
let server;

function startServer(db) {

    // creating and formatting a timestamp to record when the server starts
    let getCurrentDateAndTime = new Date();
    let timeStamp =
        getCurrentDateAndTime.getHours() + ":" +
        (getCurrentDateAndTime.getMinutes() < 10 ? '0' : '') + getCurrentDateAndTime.getMinutes();

    // starting the connection promise
    return new Promise((resolve, reject) => {
        mongoose.connect(db, err => {
            useMongoClient: true;

            console.log("MongoDB is connected to", db);

            if (err) {
                return reject(err);
            }

            server = app.listen(PORT, () => {
                console.log(timeStamp + ` - server is listening on ${PORT}`);
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
            console.log('erver is down');
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
    startServer(PROD_DATABASE_MLAB_URL).catch(err => console.error(err));
    // startServer(TEST_DATABASE_LOCALHOST_URL).catch(err => console.error(err));
};

module.exports = { app, startServer, stopServer };