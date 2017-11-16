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

    type: {
        type: String
    },
    id: {
        type: String
    },
    tags: {

    },
    center: {

    },
    bounds: {
        minlon: {
            type: String
        },
        minlat: {
            type: String
        },
        maxlon: {
            type: String
        },
        maxlat: {
            type: String
        },

    },
    geometry: {
        lat: [{
            type: String
        }],
        lon: [{
            type: String
        }],
        elevation: [{

        }]

    },
    nodes: [{
        type: String
    }],
    elevation: [{

    }]

});


trailsSchema.methods.toJSON = function() {
    var trail1 = this;
    var trailObject = trail1.toObject();
    return _.pick(trailObject, ['center', 'type', 'id', 'tags', 'geometry', 'minlat', 'maxlat', 'minlon', 'maxlon', 'elevation', 'lat', 'lon', 'nodes', 'bounds', 'elevation']);
};

trailsSchema.statics.findByName = function(name) {

    trail1 = this;
    return trail1.findOne({
        'name': name
    })
}
var Trails1 = mongoose.model('trails1', trailsSchema);
module.exports = {
    Trails1
}