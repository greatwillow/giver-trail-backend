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


var trailsSchema = new mongoose.Schema({

    name: {
        type: String
    },
    photos: [{
        type: String
    }],
    description: {

    },
    geoData: {
        lat: {

        },
        long: {

        },
        difficulty: {

        },
        length: {

        }
    }

});


trailsSchema.methods.toJSON = function() {
    var trail = this;
    var trailObject = trail.toObject();
    return _.pick(trailObject, ['name', 'photos', 'description', 'lat', 'long', 'difficulty', 'length']);
};

trailsSchema.statics.findByName = function(name) {

    trail = this;
    return trail.findOne({
        'name': name
    })
}
var Trails = mongoose.model('trails', trailsSchema);
module.exports = {
    Trails
}