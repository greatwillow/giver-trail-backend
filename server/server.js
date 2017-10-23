var { Mongoose } = require('./db/mongoose.js');
const express = require('express');
const { User } = require('./models/users');
var bodyParser = require('body-parser');
var app = express();
var _ = require('lodash');
const { ObjectID } = require('mongodb');
const { authenticate } = require('./middleware/authenticate');

const axios = require('axios');
const port = process.env.PORT || 3000;
app.use(bodyParser.json());


// ========== User Routes =================


app.post('/users/login', (req, res) => {
    console.log('inside the function');
    var body = _.pick(req.body, ['email', 'password']);
    console.log(req.body.email);
    console.log(req.body.password);


    User.findByCredentials(body.email, body.password).then((User) => {

        return User.generateAuthToken().then((token) => {
            res.header('x-auth', token).send(User);
        });


    }).catch((err) => {
        res.status(400).send(err)
    });

});


app.post('/users/create-user', (req, res) => {
    console.log('inside the function');
    var body = _.pick(req.body, ['email', 'password', 'firstName', 'lastName', 'description', 'pointsEarned', 'pointsDonated', 'currentCause', 'address', 'city', 'country', 'province', 'age']);
    var body1 = {
        email: body.email,
        password: body.password,
        firstName: body.firstName,
        lastName: body.lastName,
        description: body.description,
        pointsEarned: body.pointsEarned,
        pointsDonated: body.pointsDonated,
        currentCause: body.currentCause,
        address: {
            city: body.city,
            country: body.country,
            province: body.province,
            address: body.address
        },
        age: body.age
    }

    console.log(body)
    console.log(body1)
    var user = new User(body1);


    user.save().then(() => { // this call back with a promise for the authentication function 
        // function defined in the User Modle 

        return user.generateAuthToken();

    }).then((token) => {
        res.header('x-auth', token).send(user);
    }).catch((err) => {
        res.status(400).send(err);
    });

});



// get the user's info , for admin purposes 

app.get('/users/:id', (req, res) => {


    var id = req.params.id;
    if (!ObjectID.isValid(id)) {
        res.status(400).send('Id field is empty or Id is not correct');
    }
    User.findById(id).then((doc) => {
        res.status(200).send({ doc });
    }).catch((err) => {
        res.status(400).send(err);
    });

});
//display all users
app.get('/users', (req, res) => {

    User.find().then((Ulist) => {
        res.send(Ulist);
    }).catch((e) => {
        res.send(e);
    });
});
// displays all necesary fields for user's profile
app.get('/user/profile', authenticate, (req, res) => {
    console.log('inside the function');
    res.send(req.user);
});
// update user's profile 
app.put('/users/update-profile/', authenticate, (req, res) => {
    var body = _.pick(req.body, ['email', 'password', 'firstName', 'lastName', 'description', 'pointsEarned', 'pointsDonated', 'currentCause', 'address', 'city', 'country', 'province', 'age']);
    var body1 = {
        email: body.email,
        password: body.password,
        firstName: body.firstName,
        lastName: body.lastName,
        description: body.description,
        pointsEarned: body.pointsEarned,
        pointsDonated: body.pointsDonated,
        currentCause: body.currentCause,
        address: {
            city: body.city,
            country: body.country,
            province: body.province,
            address: body.address
        },
        age: body.age
    }


    email = req.user.email;
    User.findOne({ email }).then((user) => {
        user.password = body1.password || user.password;
        user.description = body1.description || user.description;
        user.firstName = body1.firstName || user.firstName;
        user.lastName = body1.lastName || user.lastName;
        user.pointsEarned = body1.pointsEarned || user.pointsEarned;
        user.pointsDonated = body1.pointsDonated || user.pointsDonated;
        user.currentCause = body1.currentCause || user.currentCause;
        user.address.city = body1.address.city || user.address.city;
        user.address.country = body1.address.country || user.address.country;
        user.address.province = body1.address.province || user.address.province;
        user.address.address = body1.address.address || user.address.address;
        user.age = body1.age || user.age;
        return user;
    }).then((user) => {
        console.log('###############', user.email)
        console.log('###############', user.address.address);
        user.save().then((userchanges) => {
            res.status(200).send(userchanges);

        }).catch((err) => { res.status(400).send(err) });
    });


});





// logout 

app.delete('/users/logout', authenticate, (req, res) => {

    req.user.removeToken(req.token).then(() => {
        res.status(200).send();
    }).catch((err) => {
        res.status(400).send();
    });


});

app.post('/api/google', (req, res) => {
    var city = req.body.city
    var country = req.body.country;
    var postalCode = req.body.postalCode;
    var encodedAddress = encodeURIComponent(city + ' ' + country + ' ' + postalCode);
    console.log(encodedAddress)
    var url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}`;
    axios.get(url).then((response) => {
        if (response.data.status === 'ZERO_RESULTS') { throw new Error('Unable to find that address. ') }
        res.status(200).send(response.data.results[0].formatted_address);

    }).catch((err) => {
        res.status(400).send(err.message);
    })




});





app.listen(port, () => {
    console.log(`started up at port :${port}`)
});








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