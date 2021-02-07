var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser')
var env = require('dotenv').config()
global.mongoose = require('mongoose');
global.config = require('./config/config');
var jwt = require('jsonwebtoken');

var indexrouter = require('./router/index')

// create express app
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(bodyParser.json({ limit: '10mb', extended: true }))
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }))

// Serve the static files from the React app
app.use(express.static(path.join(__dirname, "/build")));
app.use(express.static("public/build"));

// Handles any requests that don't match the ones above
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname + "/public/build/index.html"));
});
// parse application/json
app.use(bodyParser.json())
app.post('/login', function(req, res) {
    const user = {
        id: 1,
        username: "admin",
        password: "admin"
    }
    if (user.username == req.body.username && user.password == req.body.password) {
        jwt.sign(user, 'sceretkey', { expiresIn: '1h' }, (err, token) => {
            if (err) {
                res.status(400).send({ status: 1, err: err })
            }
            res.status(200).send({ status: 0, token: token, message: "login success" })
        });
    } else {
        res.status(400).send({ status: 1, message: "Invalid User" })
    }
})


// veryfing access token
app.use(function(req, res, next) {
    console.log(req.body);
    if (req.headers && req.headers.authorization) {
        const accessToken = req.headers.authorization.split(" ")[1];
        if (!accessToken) {
            res.status(401).send("Authorization token needed.");
        } else {
            jwt.verify(accessToken, 'sceretkey', function(err, decoded) {
                if (err) {
                    return res.status(400).send({ status: 1, message: err })
                }
                console.log(decoded);
                next()
            });
        }
    }
})
app.use("/api", indexrouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    // render the error page
    res.status(err.status || 500);
    res.render('error');
});


app.listen(process.env.PORT || 3000, () => { console.log('Server listening on ' + process.env.PORT) });


module.exports = app;