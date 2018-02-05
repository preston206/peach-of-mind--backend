require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const { PORT, DATABASE_URL } = require('./config');

const app = express();

// body parser middleware
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())



// routes
app.get('/get-test', (req, res) => {
    res.status(200).json([{ "_id": "787878" }]);
});

module.exports = { app };