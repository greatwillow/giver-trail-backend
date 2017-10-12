var { Mongoose } = require('./db/mongoose.js');
const express = require('express');
const { User } = require('./models/users');
var bodyParser = require('body-parser');
var app = express();
var _ = require('lodash');
const { ObjectID } = require('mongodb');

const port = process.env.PORT || 3000;
app.use(bodyParser.json());


// ========== User Routes =================


//register a user 
app.post('/users/create-user', (req, res) => {

    var theuser = new User(req.body);
    console.log(theuser);
    theuser.save().then((theuser) => {
        res.status(200).send(theuser);
        console.log(JSON.stringify(theuser));
    }).catch((err) => {
        res.status(400).send(` hello greg your code is throwing an error : ${err}`);
    })
});


// get the user's info 

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
app.listen(port, () => {
    console.log(`started up at port :${port}`)
});