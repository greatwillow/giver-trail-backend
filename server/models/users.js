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
    },
    pictures: {},
    description: {
        type: String,
        required: false,
        minlength: 5,
        trim: true,
        default: 'this is a description'
    },
    pointsEarned: {
        type: Number,
        minlength: 1,
        default: 0

    },
    pointsDonated: {
        type: Number,
        minlength: 1,
        default: 0
    },
    currentCause: {
        type: String,
        required: false,
        minlength: 1,
        trim: true,
        default: "none"
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
    tokens: [{
        access: {
            type: String,
            required: true
        },
        token: {
            type: String,
            required: true
        }
    }]



});


UserSchema.methods.toJSON = function() {
    var user = this;
    var userObject = user.toObject();
    return _.pick(userObject, ['email', '_id', 'firstName', 'lastName', 'pictures', 'description', 'pointsEarned', 'pointsDonated', 'currentCause']);
};


UserSchema.methods.generateAuthToken = function() {
    var user = this;
    var access = 'auth';
    var token = jwt.sign({ _id: user._id.toHexString(), access }, 'secret').toString();
    user.tokens.push({ access, token });
    return user.save().then((user) => {
        return token;
    });

};


UserSchema.methods.removeToken = function(token) {
    var user = this;
    return user.update({
        $pull: {
            tokens: { token }
        }
    });
};


UserSchema.statics.findByToken = function(token) {
    var User = this;
    var decoded;
    try {
        decoded = jwt.verify(token, 'secret');
    } catch (e) {
        return Promise.reject('invalid token sent ');
    }
    return User.findOne({
        '_id': decoded._id,
        'tokens.token': token,
        'tokens.access': 'auth'
    });
};


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

UserSchema.statics.findByCredentials = function(email, password) {
    var user = this;
    return user.findOne({ email }).then((user) => {
        if (!user) {
            return Promise.reject('user is not available!');
        } else {
            return new Promise((resolve, reject) => {
                bcryptjs.compare(password, user.password, (err, res) => {
                    if (res) {
                        resolve(user);
                    } else {
                        reject('Entered password is invalid', err);
                    }
                });
            });
        }
    });
};

var User = mongoose.model('User', UserSchema);
module.exports = { User };