const mongoose = require('mongoose');

const AllergenSchema = new mongoose.Schema({
    allergen: String,
    reaction: String,
    details: String
});

const ChildSchema = new mongoose.Schema({
    child: String,
    allergies: [AllergenSchema]
});

const ParentSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    children: [ChildSchema]
})

const Parent = mongoose.model('Parent', ParentSchema);
module.exports = { Parent };