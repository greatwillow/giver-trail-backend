const mongoose = require('mongoose');
const validator = require('validator');
const _ = require('lodash');
const jwt = require('jsonwebtoken');
var UserSchema = new mongoose.Schema({
    // - User ID.  			- /users/
    // - User First Name		- /users/id/first-name
    // - User Last Name		- /users/id/last-name
    // - User Picture(s)		- /users/id/profile-picture
    // - User Description		- /users/description
    // - Total Points Earned		..
    // - Total Points Donated       ..  
    // - Points have right now      ..      
    // - Current chosen Cause       ..
    // - Current chosen Trail       ..

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
    },
    pictures: {},
    description: {
        type: String,
        required: false,
        minlength: 5,
        trim: true,
    },
    pointesEarned: {
        type: number,
        minlength: 1
    },
    pointsDonated: {
        type: number,
        minlength: 1
    },
    currentCause: {
        type: String,
        required: flase,
        minlength: 1,
        trim: true,
    },
    currentTrail: {

        trail: {
            lat: {

            },
            lon: {

            }
        },

        required: false,

    },
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
    return _.pick(userObject, ['email', '_id']);
};


// UserSchema.methods.generateAuthToken = function() {
//     var user = this;
//     var process = auth;

// };

UserSchema.pre('save', function(next) {
    var user = this;
    if (user.isModified('password')) {
        bcryptjs.genSalt(10, (err, salt) => {

            bcryptjs.hash(user.password, salt, (err, hash) => {
                user.password = hash;
                next();
            });
        });
    } else { next(); }

});
var User = mongoose.model('User', UserSchema);