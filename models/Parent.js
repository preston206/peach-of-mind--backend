const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const AllergenSchema = new mongoose.Schema({
    allergen: String,
    reaction: String,
    details: String
},
    {
        timestamps: {
            type: Date,
            createdAt: 'added'
        }
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

// the next two instance methods will be available on each document object
ParentSchema.methods.serialize = function () {
    return {
        id: this._id || '',
        email: this.email || '',
        username: this.username || '',
        children: this.children || ''
    };
};

ParentSchema.methods.validatePassword = function (password) {
    console.log("pass-", password, this.password);
    const hash = bcrypt.hash(password, 10);
    return bcrypt.compare(password, hash, this.password);
};

// this static method will be available on the Model
// E.G. Parent.hashPassword(password)
ParentSchema.statics.hashPassword = function (password) {
    return bcrypt.hash(password, 10);
};

const Parent = mongoose.model('Parent', ParentSchema);
module.exports = { Parent };