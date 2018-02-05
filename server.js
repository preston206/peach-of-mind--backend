require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const { PORT, DATABASE_URL } = require('./config');

const app = express();

// body parser middleware
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// connecting to mongodb
// mongoose.connect(DATABASE_URL)
//     .then(() => console.log(`mongodb connected to ${PORT}`))
//     .catch(error => console.log(error));

// import model
const { Parent } = require('./models/Parent');

// routes
app.get('/get-test', (req, res) => {
    res.status(200).json([{ "_id": "787878" }]);
});

app.post('/post-test', (req, res) => {

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

app.put('/put-test/:id', (req, res) => {

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

//////////

//////////

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

// app.listen(PORT, () => console.log(`server is listening on ${PORT}`));

module.exports = { app, startServer, stopServer };