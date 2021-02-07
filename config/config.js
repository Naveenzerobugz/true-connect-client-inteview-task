const mongoose = require('mongoose');
var env = require('dotenv').config()
const url = "mongodb+srv://zbadmin:zbadmin@cluster0.rwyv3.mongodb.net/library?retryWrites=true&w=majority"
mongoose.connect(url, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: true,
    },
    (err) => {
        if (!err) {
            console.log('MongoDB Connection Succeeded.')
        } else {
            console.log('Error in DB connection : ' + err)
        }
    });


const connect = mongoose.createConnection(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: true,
})
let gfs;
connect.once('open', () => {
    global.gfs = new mongoose.mongo.GridFSBucket(connect.db, {
        bucketName: "uploads"
    });
})


// require('../config/config')
require('../models/index')