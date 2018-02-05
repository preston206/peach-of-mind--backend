const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();

// body parser middleware
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())



// routes
app.get('/', (req, res) => {
    res.status(200).json({ "get": "test" });
});

module.exports = { app };