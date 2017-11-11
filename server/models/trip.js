const mongoose = require('mongoose');
const validator = require('validator');
const _ = require('lodash');
var { Mongoose } = require('../db/mongoose.js');
const express = require('express');
const { User } = require('../models/users');
var bodyParser = require('body-parser');
var app = express();

const { ObjectID } = require('mongodb');
const { authenticate } = require('../middleware/authenticate');

const axios = require('axios');
const port = process.env.PORT || 3000;


var tripSchema = new mongoose.Schema({

    trail: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'trails',
        required: true
    },

    time: {
        timeStarted: {
            type: Number
        },
        timeEnded: {
            type: Number
        },
        timeSpent: {
            type: Number
        }
    },
    pointsEarned: {
        type: Number,
        ref: 'Points'.earnedPoints
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }




});


tripSchema.methods.toJSON = function() {
    var trail = this;
    var trailObject = trail.toObject();
    return _.pick(trailObject, ['trail', 'photos', 'timeStarted', 'timeEnded', 'timeSpent', 'pointsEarned', 'user']);
};

var Trips = mongoose.model('trips', tripSchema);
module.exports = {
    Trips
}