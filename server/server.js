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
const axios = require('axios');
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

app.get('/getTrails', (req, res) => {
    const url = 'http://overpass-api.de/api/interpreter?data=[out:json];way["highway"="footway"](50.745,7.17,50.75,7.18);out geom;';
    console.log('inside get trails')


    axios.get(url).then((data) => {


        // let finalData = data.data.elements.map((element) => {

        // let location = [element];

        // return modifiedResults = location.filter((e) => {
        //     return { type: e.type, id: e.id, tags: e.tags, geometry: e.geometry, bounds: e.bounds }

        // })

        //console.log(modifiedResults);

        // let modifiedResults1 = modifiedResults.geometry.map((e) => {
        //     return { lat: e.lat, lng: e.lon }
        // })

        //console.log(modifiedResults);
        // elevation.locations(modifiedResults, null, (err, result) => {
        //     if (err) {
        //         console.log(err);
        //     }
        //     //  console.log(result);
        //     // query data (data.lat = result.lt)
        //     // push data.push(result)

        // });


        // });
        let count = 0;
        let r = {

                element: data.data.elements.map((e) => {


                    return { thename: e }
                })

            }
            // console.log(r.element[3].thename.type);


        r.element.filter((e) => {
            let bodyTrail = _.pick(e.thename, ['type', 'id', 'bounds', 'tags']);
            let geometry = _.pick(e.thename, ['geometry']);
            let nodes = _.pick(e.thename, ['nodes']);

            let newData = Object.assign(bodyTrail, geometry, nodes);

            let trail1 = new Trails1(newData);
            trail1.id = newData.id;
            // console.log(trail1.id); // id 
            // console.log(newData.id); //
            trail1.type = newData.type;
            // console.log(trail1.type); // type 
            // console.log(newData.type); //

            // console.log('bounds data ', newData.bounds);

            trail1.bounds.minlat = newData.bounds.minlat;
            // console.log('minlat trail ', trail1.bounds.minlat); // minlat

            trail1.bounds.minlon = newData.bounds.minlon;
            // console.log('minlon trail ', trail1.bounds.minlon); //minlon

            trail1.bounds.maxlat = newData.bounds.maxlat;
            // console.log('maxlat trail ', trail1.bounds.maxlat); //maxlat

            trail1.bounds.maxlon = newData.bounds.maxlon;
            // console.log('maxlon trail ', trail1.bounds.maxlon); //maxlon


            trail1.tags = newData.tags;
            // console.log(trail1.tags); //
            // console.log(newData.tags); //
            let lat = newData.geometry.map((geo) => {
                // console.log('lat data : ', geo.lat)
                return geo.lat;
            });
            trail1.geometry.lat = lat;
            // console.log('lat trail : ', trail1.geometry.lat)
            let lon = newData.geometry.map((geo) => {
                // console.log('lon data : ', geo.lon)
                return geo.lon;
            });
            trail1.geometry.lon = lon;
            // console.log('lon trail : ', trail1.geometry.lon)
            trail1.nodes = newData.nodes;
            // console.log('nodes trail : ', trail1.nodes); //
            // console.log('nodes data : ', newData.nodes); //
            console.log('before save ')

            trail1.save().then((dataSaved) => {

            }).catch((err) => { res.status(401).send(err) });


        });

        res.status(200).send();

    });


})

app.get('/showtrails', (req, res) => {
    let allTrails = [];
    let count = 0;
    Trails1.find().then((data) => {

        res.send(data);
    });

})

app.get('/getPoint', (req, res) => {
    var obj = {
        id: "1234",
        type: "line",
        centralCoordinate: {
            latitude: 45.7377,
            longitude: 76.8888
        },
        coordinates: [{
            latitude: 46.1564,
            longitude: -76.2343
        }]
    }
    res.status(200).send(obj);
})

app.listen(port, () => {
    console.log(`started up at port :${port}`)
});



// another way of doing update user 

// app.patch('/users/update-profile/', authenticate, (req, res) => {
//     var body = _.pick(req.body, ['email', 'password', 'firstName', 'lastName', 'description', 'pointsEarned', 'pointsDonated', 'currentCause', 'address', 'city', 'country', 'province', 'age']);
//     var body1 = {
//         email: body.email,
//         password: body.password,
//         firstName: body.firstName,
//         lastName: body.lastName,
//         description: body.description,
//         pointsEarned: body.pointsEarned,
//         pointsDonated: body.pointsDonated,
//         currentCause: body.currentCause,
//         address: {
//             city: body.city,
//             country: body.country,
//             province: body.province,
//             address: body.address
//         },
//         age: body.age
//     }


//     email = req.user.email;
//     User.findOneAndUpdate({ email }, { $set: body1 }, { new: true }).then((user) => {

//         res.status(200).send(user);


//     }).catch((err) => { res.status(400).send(err) });


// });


// logout 



// app.post('/api/google', (req, res) => {
//     var city = req.body.city
//     var country = req.body.country;
//     var postalCode = req.body.postalCode;
//     var encodedAddress = encodeURIComponent(city + ' ' + country + ' ' + postalCode);
//     console.log(encodedAddress)
//     var url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}`;
//     axios.get(url).then((response) => {
//         if (response.data.status === 'ZERO_RESULTS') { throw new Error('Unable to find that address. ') }
//         res.status(200).send(response.data.results[0].formatted_address);

//     }).catch((err) => {
//         res.status(400).send(err.message);
//     })




// });










// var email = req.user.email;
// var body = _.pick(req.body, ['email', 'password', 'firstName', 'lastName', 'description', 'pointsEarned', 'pointsDonated', 'currentCause', 'address', 'city', 'country', 'postalCode']);
// var body1 = {
//     email: body.email,
//     password: body.password,
//     firstName: body.firstName,
//     lastName: body.lastName,
//     description: body.description,
//     pointsEarned: body.pointsEarned,
//     pointsDonated: body.pointsDonated,
//     currentCause: body.currentCause,
//     address: {
//         city: body.city,
//         country: body.country,
//         postalCode: body.postalCode,
//         address: body.address
//     }
// }
// User.findOne({ email }).then((user) => {
//     if (!user) { res.status(400).send('some fields cannot be empty!'); }

//     user.description = body1.description || user.description;
//     user.firstName = body1.firstName || user.firstName;
//     user.lastName = body1.lastName || user.lastName;
//     user.pointsEarned = body1.pointsEarned || user.pointsEarned;
//     user.pointsDonated = body1.pointsDonated || user.pointsDonated;
//     user.address.city = body1.address.city || user.address.city;
//     user.address.country = body1.address.country || user.address.country;
//     user.address.postalCode = body1.address.postalCode || user.address.postalCode;
//     console.log(`address in server : ${user.address.address}`)
//     user.save().then((newuser) => {

//         console.log(`address in save : ${user.address.address}`)
//         res.status(200).send(newuser);
//     }).catch((err) => {
//         return res.status(400).send(err);
//     });
// }).catch((err) => {
//     return res.status(400).send(err);
// });