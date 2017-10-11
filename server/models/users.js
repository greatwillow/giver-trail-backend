const mongoose = require('mongoose');
const validator = require('validator');
const _ = require('lodash');
const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
var UserSchema = new mongoose.Schema({
    //var User = mongoose.model('User', {
    email: {
        type: String,
        required: true,
        minlength: 5,
        trim: true,
        unique: true,
        validate: {
            validator: validator.isEmail,
            message: '{VALUE} is not a correct email'
        }

    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    firstName: {
        type: String,
        required: false,
        minlength: 5,
        trim: true,
    },
    lastName: {
        type: String,
        required: false,
        minlength: 5,
        trim: true,
    }
    // pictures: {},
    // description: {
    //     type: String,
    //     required: false,
    //     minlength: 5,
    //     trim: true,
    // },
    // pointesEarned: {
    //     type: Number,
    //     minlength: 1
    // },
    // pointsDonated: {
    //     type: Number,
    //     minlength: 1
    // },
    // currentCause: {
    //     type: String,
    //     required: false,
    //     minlength: 1,
    //     trim: true,
    // },
    // currentTrail: {

    //     trail: {
    //         lat: {

    //         },
    //         lon: {

    //         }
    //     },

    //     required: false,

    // },
    // tokens: [{
    //     access: {
    //         type: String,
    //         required: true
    //     },
    //     token: {
    //         type: String,
    //         required: true
    //     }
    // }]



});


UserSchema.methods.toJSON = function() {
    var user = this;
    var userObject = user.toObject();
    return _.pick(userObject, ['email', '_id', 'firstName', 'lastName']);
};


// UserSchema.methods.generateAuthToken = function() {
//     var user = this;
//     var process = auth;

// };

// UserSchema.pre('save', function(next) {
//     var user = this;
//     if (user.isModified('password')) {
//         bcryptjs.genSalt(10, (err, salt) => {

//             bcryptjs.hash(user.password, salt, (err, hash) => {
//                 user.password = hash;
//                 next();
//             });
//         });
//     } else { next(); }

// });
var User = mongoose.model('User', UserSchema);
module.exports = { User };