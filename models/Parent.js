const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// sub doc schema for allergies
// allergen = the allergen name
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

// sub doc schema for child profiles
// child = the child name
const ChildSchema = new mongoose.Schema({
    child: String,
    allergies: [AllergenSchema]
});

// root schema
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
    return bcrypt.compareSync(password, this.password);
};

// this static method will be available on the Model
// E.G. Parent.hashPassword(password)
ParentSchema.statics.hashPassword = function (password) {
    return bcrypt.hashSync(password, 10);
};

const Parent = mongoose.model('Parent', ParentSchema);
module.exports = { Parent };