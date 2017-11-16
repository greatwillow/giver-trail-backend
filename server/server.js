var { Mongoose } = require('./db/mongoose.js');
const express = require('express');
const { User } = require('./models/users');
const { Points } = require('./models/points');
const { Trails } = require('./models/trails');
const { Trails1 } = require('./models/trails.1');
const { Trips } = require('./models/trip');
var bodyParser = require('body-parser');
var app = express();
var _ = require('lodash');
const { ObjectID } = require('mongodb');
const { authenticate } = require('./middleware/authenticate');
const user_routes = require('./router/user_routes');
const geometry_routes = require('./router/geometry_routes');
const axios = require('axios');
const getElevation = require('./middleware/getElevation');

// elevation api sample    
var Elevation = require('googlemapsutil').Elevation;
elevation = new Elevation();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());


// ========== User Routes =================


app.post('/users/login', user_routes.log_in);
app.post('/users/create-user', user_routes.create_user);
// get the user's info , for admin purposes 
app.get('/users/:id', user_routes.get_user);
//display all users
app.get('/users', user_routes.display_users);
// displays all necesary fields for user's profile
app.get('/user/profile', authenticate, user_routes.user_profile);
// update user's profile 
app.put('/users/update-profile/', authenticate, user_routes.update_user);

app.delete('/users/logout', authenticate, user_routes.log_out);

app.post('/users-points-trail-trip', (req, res) => {
    var bodyUser = _.pick(req.body, ['email', 'password']);
    var bodyTrail = _.pick(req.body, ['name', 'description']);
    var bodyPoint = _.pick(req.body, ['thepoints']);
    var bodyTrip = _.pick(req.body, ['timeStarted', 'timeEnded']);
    var user = new User(bodyUser);
    var trail = new Trails(bodyTrail);
    var point = new Points(bodyPoint);
    var trip = new Trips(bodyTrip);
    user.email = bodyUser.email;
    user.password = bodyUser.password;
    trail.name = bodyTrail.name;
    trail.description = bodyTrail.description;
    point.trail = trail;
    user.trail = trail;

    point.user = user;

    trip.trail = trail;
    trip.user = user;
    trip.time.timeStarted = bodyTrip.timeStarted;
    trip.time.timeEnded = bodyTrip.timeEnded;
    trip.time.timeSpent = bodyTrip.timeEnded - bodyTrip.timeStarted;
    point.earnedPoints = trip.time.timeSpent * 10;
    trip.pointsEarned = point.earnedPoints;
    point.trip = trip





    let data = [];

    //if (user && trail && point & trip) {


    trail.save().then(() => {
            data[0] = trail;
            console.log('inside trail');
        }).then(() => {

            point.save().catch((err) => { console.log(err) });
            console.log('inside point');
            data[1] = point;
        }).then(() => {
            user.save().catch((err) => { console.log(err) });
            console.log('inside user');
            var token = user.generateAuthToken();
            res.header('x-auth', token);
            data[2] = user;
        }).then(() => {

            trip.save().catch((err) => { console.log(err) });
            console.log('inside trip');
            data[3] = trip;
            console.log('success!');
            res.status(200).send(data);

        }).catch((err) => {
            console.log('something went wrong , ', err)
        })
        //}

});


//=============== Trails routes =======================
app.get('/getTrails', geometry_routes.getTrails);

app.get('/getcenterCoordinates', geometry_routes.getCenterCoordinates);
// display all trails we have 
app.get('/showtrails', geometry_routes.showTrails);

// dont run this 
app.get('/getElevationAll', geometry_routes.getElevationAll);

app.get('/sendTrails', geometry_routes.sendTrails);

// app.get('/getPoint', (req, res) => {
//     var obj = {
//         id: "1234",
//         type: "line",
//         centralCoordinate: {
//             latitude: 45.7377,
//             longitude: 76.8888
//         },
//         coordinates: [{
//             latitude: 46.1564,
//             longitude: -76.2343
//         }]
//     }
//     res.status(200).send(obj);
// })

app.listen(port, () => {
    console.log(`started up at port :${port}`)
});