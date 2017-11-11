const mongoose = require('mongoose');
const validator = require('validator');
const _ = require('lodash');
// each user goes on a trail 

var pointsSchema = new mongoose.Schema({

    trail: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'trails'
    }],
    earnedPoints: {
        type: Number
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    trip: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Trips'
    }]
});


pointsSchema.methods.toJSON = function() {
    var point = this;
    var pointObject = point.toObject();
    return _.pick(pointObject, ['trail', 'earnedPoints', 'user']);
};
var Points = mongoose.model('Points', pointsSchema);
module.exports = { Points }