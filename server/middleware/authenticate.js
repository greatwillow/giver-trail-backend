var { User } = require('./../models/users');


var authenticate = (req, res, next) => {
    var token = req.header('x-auth');
    User.findByToken(token).then((user) => {
        if (!user) {
            return Promise.reject();
        }
        req.user = user;
        console.log(user);
        req.token = token;
        console.log(token);
        next();
    }).catch((err) => {
        res.status(401).send();
    });
}

module.exports = {
    authenticate
}