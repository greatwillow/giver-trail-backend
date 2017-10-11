var { Mongoose } = require('./db/mongoose.js');
const express = require('express');
const { User } = require('./models/users');
var bodyParser = require('body-parser');
var app = express();
var _ = require('lodash');

const port = process.env.PORT || 3000;
app.use(bodyParser.json());


// ========== User Routes =================

app.post('/users/create-user', (req, res) => {

    var theuser = new User({

        email: req.body.email,
        password: req.body.password,
        firstName: req.body.firstName,
        lastName: req.body.lastName
    });
    console.log(theuser);
    theuser.save().then((theuser) => {
        res.status(200).send(theuser);
        console.log(JSON.stringify(theuser));
    }).catch((err) => {
        res.status(400).send(err);
    })
});

app.listen(3000, () => {
    console.log(`started up at port :3000`)
});