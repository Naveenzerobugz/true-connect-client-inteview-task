var express = require("express");
var router = express.Router();
const { body, check } = require('express-validator');
const methodOverride = require('method-override');
const crypto = require("crypto");
const path = require("path");
const mongoose = require("mongoose");
const multer = require('multer')
const GridFsStorage = require('multer-gridfs-storage')
var env = require('dotenv').config()
const productdetail = require("../controllers").productdetail;


const storage = new GridFsStorage({
    url: process.env.MONGO_DB_CONNECTION,
    options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    },
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            crypto.randomBytes(16, (err, buf) => {
                if (err) {
                    return reject(err);
                }
                const filename = buf.toString("hex") + path.extname(file.originalname);
                const fileInfo = {
                    filename: filename,
                    bucketName: "uploads"
                };
                resolve(fileInfo);
            });
        });
    }
});
const upload = multer({
    storage
});
router.get("/image/:filename", (req, res) => {
    // console.log('id', req.params.id)
    const file = gfs
        .find({
            filename: req.params.filename
        })
        .toArray((err, files) => {
            if (!files || files.length === 0) {
                return res.status(404).json({
                    err: "no files exist"
                });
            }
            gfs.openDownloadStreamByName(req.params.filename).pipe(res);
        });
});
router.post('/productdetails',
    upload.single('image'),
    body('productname').isLength({ min: 5 }).withMessage('Product Name must be at least 5 chars long'),
    body('amount').isFloat().withMessage('Amount is Invalid'),
    body('sellingprice').isFloat().withMessage('Selling Price is Invalid'),
    body('stock').isNumeric().withMessage('Stock is Invalid'),
    productdetail.add)

router.get('/productdetails', productdetail.list);
router.get('/productdetails/:id', productdetail.getbyid)
router.post('/deleteproductdetails', productdetail.delete)

module.exports = router;