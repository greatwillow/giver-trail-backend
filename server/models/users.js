const mongoose = require('mongoose');
const validator = require('validator');
const _ = require('lodash');
const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
const { geocode } = require('../middleware/geocode');
var UserSchema = new mongoose.Schema({
    //var User = mongoose.model('User', {

    email: {
        type: String,
        required: true,
        minlength: 5,
        trim: true,
        unique: true,
        validate: [{ validator: value => isEmail(value), msg: 'Invalid email.' }],
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
    age: {

        type: Number,
        required: true,
        trim: true,
        default: 1
    },
    pictures: {},
    interestList: [{ type: String }],
    currentCause: {
        type: String,
        required: false,
        minlength: 1,
        trim: true,
        default: "none"
    },
    trail: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'trails',
        required: false,
    },
    address: {
        city: {
            name: String,
            type: String,
            required: false,
            default: 'montreal'
        },
        country: {
            name: String,
            type: String,
            required: false,
            default: 'canada'
        },
        province: {
            name: String,
            type: String,
            required: false,
            default: 'QC'
        },
        address: {
            name: String,
            type: String,
            required: false,
            default: 'Montreal , QC,Canada'
        }
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
    }],
    trips: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'trips'
    }



});


UserSchema.methods.toJSON = function() {
    var user = this;
    var userObject = user.toObject();
    return _.pick(userObject, ['email', 'firstName', 'lastName', 'interestList', 'currentCause', 'address', 'city', 'country', 'province', 'age']);
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

        // hashing password process
        bcryptjs.genSalt(10, (err, salt) => {

            bcryptjs.hash(user.password, salt, (err, hash) => {
                user.password = hash;
                next();
            });
            // // generating the address

            // geocode(user.address.city, user.address.country, user.address.postalCode).then((newUser) => {

            //     user.address.address = newUser.data.results[0].formatted_address;
            //     console.log(`address in users : ${user.address.address}`)
            //     next();
            // }).catch((err) => {
            //     user.address.address = ' ';
            //     next();
            // });
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