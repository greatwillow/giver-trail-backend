var { Mongoose } = require('./db/mongoose.js');
const express = require('express');
const { User } = require('./models/users');
var bodyParser = require('body-parser');
var app = express();
var _ = require('lodash');
const { ObjectID } = require('mongodb');
const { authenticate } = require('./middleware/authenticate');

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
    var body = _.pick(req.body, ['email', 'password', 'firstName', 'lastName', 'description', 'pointsEarned', 'pointsDonated', 'currentCause']);
    var user = new User(body);

    user.save().then(() => { // this call back with a promise for the authentication function 
        // function defined in the User Modle 

        return user.generateAuthToken();

    }).then((token) => {
        res.header('x-auth', token).send(user);
    }).catch((err) => {
        res.status(400).send(err);
    })


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


    var email = req.user.email;
    var body = _.pick(req.body, ['description', 'firstName', 'lastName', 'pictures', 'pointsEarned', 'pointsDonated']);

    User.findOne({ email }).then((user) => {
        if (!user) { res.status(400).send('some fields cannot be empty!'); }

        user.description = req.body.description || user.description;
        user.firstName = req.body.firstName || user.firstName;
        user.lastName = req.body.lastName || user.lastName;
        user.pointsEarned = req.body.pointsEarned || user.pointsEarned;
        user.pointsDonated = req.body.pointsDonated || user.pointsDonated;
        user.save((err, newuser) => {
            if (err) { throw new Error(err); }
            res.status(200).send(newuser);
        });
    }).catch((err) => {
        res.status(400).send(err);
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






app.listen(port, () => {
    console.log(`started up at port :${port}`)
});